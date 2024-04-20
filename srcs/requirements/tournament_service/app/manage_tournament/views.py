from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from .models import Tournament, TournamentMatch, MatchSetting, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer, SimplePlayerSerializer
from .serializers import TournamentPlayerSerializer, GamemodeDataSerializer, FieldDataSerializer, PaddlesDataSerializer, BallDataSerializer, TournamentMatchRoundSerializer, TournamentMatchListSerializer
from .serializers import PlayerSerializer, TournamentRegistrationSerializer, PlayerGameStatsSerializer, SimpleTournamentSerializer
from .serializers import MatchGeneratorSerializer
from rest_framework.views import APIView
# from rest_framework_simplejwt.authentication import JWTAuthentication
from .authentication import CustomJWTAuthentication
from .permissions import CustomAuthorization
from rest_framework.decorators import api_view, authentication_classes, permission_classes
# from .permissions import  IsOwnerOrReadOnly, IsHostOrParticipant
from django.contrib.auth.models import User
from collections import defaultdict
from django.utils import timezone
from django.db.models import Q
from threading import Thread
import requests
from django.http import Http404, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseServerError
from django.http import HttpResponse, JsonResponse
import json
from django.core import exceptions
from django.utils.html import escape
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie
from .utils import create_hashed_code
from django.db import transaction




# ------------------------ Tournament -----------------------------------
class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all().order_by('-created_at')
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, *args, **kwargs):
        print(">> GET: loading page\n")
        tournaments = self.get_queryset()
        serializer = self.get_serializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        print(">> received POST to creat a new tournament\n")
        print("request.data: \n", request.data)
        input_data=request.data

        required_fields = ['tournament_name', 'nbr_of_player_match', 'nbr_of_player_total', 'registration_period_min', 'setting']
        try:
            for field in required_fields:
                if not input_data.get(field):
                    raise ValueError(f"'{field.replace('_', ' ').title()}' must be provided")

            input_data['nbr_of_player_match'] = int(input_data['nbr_of_player_match'])
            input_data['nbr_of_player_total'] = int(input_data['nbr_of_player_total'])
            input_data['registration_period_min'] = int(input_data['registration_period_min'])

            input_data['setting']['walls_factor'] = float(input_data['setting']['walls_factor'])
            input_data['setting']['size_of_goals'] = int(input_data['setting']['size_of_goals'])
            input_data['setting']['paddle_height'] = int(input_data['setting']['paddle_height'])
            input_data['setting']['paddle_speed'] = float(input_data['setting']['paddle_speed'])
            input_data['setting']['ball_speed'] = float(input_data['setting']['ball_speed'])
            input_data['setting']['ball_radius'] = float(input_data['setting']['ball_radius'])
            input_data['setting']['nbr_of_player'] = int(input_data['setting']['nbr_of_players_per_match'])
            input_data['setting']['nbr_of_rounds'] = int(input_data['setting']['nbr_of_rounds'])
            
            input_data['setting'].pop('nbr_of_players_per_match', None)
        except KeyError as e:
            missing_field = str(e)
            error_message = f"Missing field '{missing_field}' in the request data"
            return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            print("Error: ", e.detail)
            return Response({'error': str(e.detail)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f">>Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        print("input_data: \n", input_data)
        try:
            serializer = TournamentSerializer(data=input_data)
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            error_message = str(e.detail.get('non_field_errors', ['Unknown error'])[0])
            print("Error: ", e.detail)
            print("Error message: ", error_message)
            if error_message == 'Unknown error':
                error_messages = []
                for field, errors in e.detail.items():
                    if isinstance(errors, dict):
                        for nested_field, nested_errors in errors.items():
                            for error in nested_errors:
                                error_messages.append(f"'{nested_field}': {error}")
                    else:
                        for error in errors:
                            error_messages.append(f"'{field}': {error}")
                    error_message = "\n".join(error_messages)
            return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info
        host, _ = Player.objects.get_or_create(id=uid, username=username) # created wiil return False if the player already exists
        
        match_setting = MatchSetting.objects.create(**input_data.pop('setting'))

        tournament = Tournament.objects.create(
            tournament_name=input_data['tournament_name'],
            registration_period_min=input_data['registration_period_min'],
            nbr_of_player_total=input_data['nbr_of_player_total'],
            nbr_of_player_match=input_data['nbr_of_player_match'],
            host=host,
            setting=match_setting,
            created_at=timezone.now(),
        )
        
        tournament.players.add(host)

        serialized_tournament  = TournamentSerializer(tournament)
        return Response(serialized_tournament.data, status=status.HTTP_201_CREATED)

        

class TournamentData(APIView):
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)

        serializer = TournamentSerializer(tournament)
        return Response(serializer.data)

# ------------------------ Assigning Players on the Tournament Tree -----------------------------------

class JoinTournament(generics.ListCreateAPIView):
    authentication_classes = [CustomJWTAuthentication]
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer

    def get(self, request, *args, **kwargs):
        print("request.user: ", request.user)
        return self.list(request, *args, **kwargs)

    def post(self, request, tournament_id, player_id):
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info
        if player_id != uid:
            return JsonResponse({'message': "You are not authorized to join the Tournament"}, status=status.HTTP_403_FORBIDDEN)
        print("All Tournaments:")
        for tournament in Tournament.objects.all():
            print(tournament.id)
        print("tournament_id: ", tournament_id)
        try:
            tournament = get_object_or_404(Tournament, id=tournament_id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        if tournament.is_full():
            return JsonResponse({'message': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        player, created = Player.objects.get_or_create(id=uid, username=username) # created wiil return False if the player already exists
        if tournament.players.filter(id=player.id).exists():
            print("You already joined this Tournament")
            return JsonResponse({'error': 'Player is already in the tournament'}, status=400)
        tournament.players.add(player)
        if created:
            print("New Player joined\n")
        
        print("Players in the tournament:")
        for player in tournament.players.all():
            print(player.username)

        serializer = TournamentSerializer(tournament)
        escaped_data = escape(serializer.data)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)

class MatchGenerator(generics.ListCreateAPIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': _('Tournament not found')}, status=404)
        
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise AuthenticationFailed(_('User information is not in the expected format'))

        uid, username = user_info
        if tournament.host.id != uid:
            return Response({"message": _("You are not authorized to generate Tournament.")}, status=status.HTTP_403_FORBIDDEN)
        
        match_setting = tournament.setting
        tournament.calculate_nbr_of_match()

        round = 0
        players_total = tournament.players.count()
        players_match = tournament.nbr_of_player_match
        added_match = players_total // players_match
        if players_total % players_match != 0:
            added_match += 1
        tmp = added_match
        
        for _ in range(tournament.nbr_of_match):
            added_match -= 1

            tournament_match = TournamentMatch.objects.create(
                tournament_id=tournament.id,
                match_setting_id=match_setting.id,
                round_number=round,
            )
            tournament.matches.add(tournament_match)

            if added_match == 0:
                round += 1
                winners = tmp
                added_match = winners // players_match
                if winners % players_match != 0:
                    added_match += 1
                tmp = added_match

        players = tournament.players.all().order_by('id')
        for player in players:
            match = tournament.assign_player_to_match(player, 0)
            if match:
                print(f"Player {player.username} added to match {match.id}")
            else:
                print(f"No available matches for player {player}")

        tournament_matches = TournamentMatch.objects.filter(tournament_id=tournament.id).order_by('id')
        serializer = TournamentMatchSerializer(tournament_matches, many=True)

        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)


class MatchResult(APIView):
    # authentication_classes = [CustomJWTAuthentication]
    permission_classes = [CustomAuthorization]

    @staticmethod
    def round_state(request, id, cur_round):
        with transaction.atomic(): 
            print("__________________________________________\n")
            try:
                tournament = Tournament.objects.select_for_update().get(id=id)
                # tournament = get_object_or_404(Tournament, id=id)
            except Tournament.DoesNotExist:
                return JsonResponse({'error': 'Tournament not found'}, status=404)
            # except Http404:
            #     return JsonResponse({'error': 'Tournament not found'}, status=404)
            
            matches = tournament.matches.filter(round_number=cur_round)
            print("matches: ", matches)
            
            if matches.filter(state='playing').exists() or matches.filter(state='waiting').exists():
                return False
            if matches.filter(state='ended').count() == matches.count():
                return True
            return False

    @staticmethod
    def match_update(request, tournament_id, round):
        # with transaction.atomic(): 
        try:
            # tournament = Tournament.objects.select_for_update().get(id=id)
            tournament = get_object_or_404(Tournament, id=tournament_id)
        # except Tournament.DoesNotExist:
        #     return JsonResponse({'error': 'Tournament not found'}, status=404)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)

        finished_matches = tournament.matches.filter(round_number=round - 1).order_by('id')
        matches_in_progress = finished_matches.filter(Q(state="waiting") | Q(state="playing"))
        if matches_in_progress.exists():
            return JsonResponse({"message": "Cannot update next round, the previous round is on going."}, status=400)

        winners = [match.winner for match in finished_matches if match.winner is not None]
        sorted_winners = sorted(winners, key=lambda user: user.id)
        # print("sorted_winners: ", sorted_winners)
        print("MATCH_UPDATE >>> round: ", round)
        next_matches = tournament.matches.filter(round_number=round).order_by('id')
        if not next_matches.exists():
            if len(sorted_winners) == 1:
                
                sorted_winners[0].won_tournament.add(tournament)
                sorted_winners[0].save()

                matches_in_progress = tournament.matches.filter(Q(state="waiting") | Q(state="playing"))
                if matches_in_progress.exists():
                    return JsonResponse({"message": "Cannot end the tournament while matches are in progress."}, status=HTTP_500_INTERNAL_SERVER_ERROR)
                
                tournament.state = "ended"
                tournament.winner = sorted_winners[0].username
                print("tournament.tournament_result: ", tournament.winner)
                tournament.save()
                serializer = TournamentMatchSerializer(finished_matches, many=True)
                return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)
            else:
                return JsonResponse({'message': 'An Error occurred while updating the next round matches.'}, status=HTTP_500_INTERNAL_SERVER_ERROR)
        elif next_matches.exists() and len(sorted_winners) == 1:
            sorted_winners[0].won_tournament.add(tournament)
            sorted_winners[0].save()
            for match in next_matches:
                match.delete()
                tournament.save()
            tournament.state = "ended"
            tournament.winner = sorted_winners[0].username
            print("tournament.tournament_result: ", tournament.winner)
            tournament.save()
            serializer = TournamentMatchSerializer(finished_matches, many=True)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)
       
        for winner in winners:
            print("winner: ", winner.username)
            if winner.username == 'Unknown':
                print("Skipped assigning unknown player to the match")
                continue
            match = tournament.assign_player_to_match(winner, round)
            if match:
                print(f"Player {winner.username} added to match {match.id}")
                match.save()
            else:
                print(f"No available matches for player {winner}")

        ret = auto_win_for_single_player(request, tournament_id, round)
        if ret.status_code != 200:
            return ret
        next_matches = tournament.matches.filter(round_number=round).order_by('id')
        serializer = TournamentMatchSerializer(next_matches, many=True)
        # print("serializer.data\n", serializer.data)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)


    def post(self, request, match_id, winner_username):
        with transaction.atomic(): 
            print("match_id : ", match_id,  "winner: ", winner_username)
            try:
                match = TournamentMatch.objects.select_for_update().get(id=match_id)
                # match = get_object_or_404(TournamentMatch, id=match_id)
            except TournamentMatch.DoesNotExist:
                return JsonResponse({'error': 'Match not found'}, status=404)
            # except Http404:
            #     return JsonResponse({'error': 'Match not found'}, status=404)
            try:
                tournament = get_object_or_404(Tournament, id=match.tournament_id)
            except Http404:
                return JsonResponse({'error': 'Tournament not found'}, status=404)
            players = match.players.all()
            if not players.filter(username=winner_username).exists() and not players.filter(username=winner_username+'*').exists():
                return Response("Winner not found among participants", status=status.HTTP_404_NOT_FOUND)

            if match.state == "ended":
                return Response(f"Match {match_id} has been ended before", status=status.HTTP_400_BAD_REQUEST)
            
            match.state = "ended"
            match.save()
            print("match ID: ", match.id, "match.state: ", match.state)

            for player in players:
                print("player: ", player.username, "winner: ", winner_username)
                if player.username == winner_username or player.username == winner_username+'*':
                    player.total_played += 1
                    player.won_match.add(match)
                    player.save()
                    if player.username == (winner_username+"*"):
                        match.players.remove(player)
                        player.username = 'Unknown'
                        player.save()
                        match.players.add(player)
                        match.save()
                        print("After username modification:", player.username)
                    match.winner = player
                    match.save()
                    tournament.save()
                else:
                    print("non winner----")
                    if player.username.endswith('*'):
                        print('player: ', player.username)
                        player.username = 'Unknown'
                        player.save()
                        print("After username modification:", player.username)
                    player.total_played += 1
                    player.save()

            cur_round = match.round_number

            if MatchResult.round_state(request, match.tournament_id, cur_round) == False:
                return Response(status=204)
                # return JsonResponse({'message': "Winner found and updated successfully", })

            update = MatchResult.match_update(request, match.tournament_id, cur_round + 1)
            print('update: ', update)
            if update.status_code == 200:
                data = json.loads(update.content.decode('utf-8'))
                return JsonResponse(data, status=update.status_code, safe=False)   # tournament finished
            elif update.status_code != 201:
                error_data = json.loads(update.content.decode('utf-8'))
                return JsonResponse(error_data, status=update.status_code)
            response = generate_round(request, match.tournament_id, cur_round + 1)
            return JsonResponse(response.data, status=status.HTTP_201_CREATED, safe=False)


class MatchUpdate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = MatchGeneratorSerializer
    # queryset = Tournament.objects.all()

    def post(self, request, tournament_id, round):
        try:
            tournament = get_object_or_404(Tournament, id=tournament_id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        finished_matches = tournament.matches.filter(round_number=round - 1).order_by('id')
        finished_match_ids = finished_matches.values_list('id', flat=True)

        matches_in_progress = finished_matches.filter(Q(state="waiting") | Q(state="playing"))
        if matches_in_progress.exists():
            return Response({"message": "Cannot update next round while previous round matches are in progress."}, status=400)

        participants = MatchParticipants.objects.filter(is_winner=True, match_id__in=finished_match_ids)
        print("Filtered participants: ", participants)
        # Filter out winners from participants
        winners = participants.filter(is_winner=True)

        # Extract player IDs of winners
        winner_player_ids = sorted(winners.values_list('player_id', flat=True))
        print("winner_player_ids: ", winner_player_ids)
        next_matches = tournament.matches.filter(round_number=round).order_by('id')
        if not next_matches.exists():
            if len(winner_player_ids) == 1:
                winner = Player.objects.get(id=winner_player_ids[0])
                print("winner_player_ids[0]: ", winner_player_ids[0])
                print("winner: ", winner)
                winner.won_tournament.add(tournament)
                winner.save()
                serializer = TournamentMatchSerializer(finished_matches, many=True)
                return JsonResponse({"data": serializer.data, "status": status.HTTP_200_OK, "message": 'The Tournament has been finished.', "winner": winner.id})
            else:
                return JsonResponse({'status': status.HTTP_400_BAD_REQUEST, 'message': 'An Error occurred while updating the next round matches.'})

        for player_id in winner_player_ids:
            player = Player.objects.get(id=player_id)
            if player.username == 'Unkonwn':
                print("Skipped assigning unknown player to the match")
                continue
            match = tournament.assign_player_to_match(player, round)
            print("winner: ", player.id, "match: ", match.id)

            if match:
                print(f"Player {player} added to match {match}")
                participant, created = MatchParticipants.objects.get_or_create(
                    match_id=match.id,
                    player_id=player.id,
                    round_number=round
                )       
                if created:
                    print(f"Participant {participant} created with player ID: {player.id}")
                else:
                    print(f"Participant {participant} already exists for match {match.id}")            
                match.participants.add(participant)
                match.save()
            else:
                print(f"No available matches for player {player}")

        serializer = TournamentMatchSerializer(next_matches, many=True)
        escaped_data = escape(serializer.data)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)


class TournamentRoundState(APIView):
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request, tournament_id):
        try:
            tournament = get_object_or_404(Tournament, id=tournament_id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        matches = tournament.matches.all()
        print("matches: ", matches)
        match_in_progress = matches.filter(state='playing').first()
        print("match_in_progress: ", match_in_progress)
        if match_in_progress:
            return Response({'round': None, 'message': f"Round {match_in_progress.round_number} is playing"})
        
        # If all matches of the round are finished, return the round number of the last match
        final_round = matches.order_by('-round_number').first().round_number
        last_match = matches.filter(state='ended').order_by('-round_number').first()
        if last_match:
            if last_match.round_number == final_round:
                return Response({'round': last_match.round_number, 'is_tournamentFinish': True})
            return Response({'round': last_match.round_number})
        else:
            return Response({'round': None, "message": "An Error occurred while checking Round state"})

# --------------------------- Tournament Participants -----------------------------------    
class TournamentParticipantList(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] # Only authenticated users can view the participant list

    def get(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)

        # participants = tournament.players.all().order_by('id')
        serializer = TournamentPlayerSerializer(tournament)
        return Response(serializer.data)


class TournamentParticipantDetail(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def delete(self, request, id, participant_id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        try:
            participant = get_object_or_404(TournamentPlayer, tournament_id=tournament, player__player_id=participant_id)
        except Http404:
            return JsonResponse({'error': 'Participant not found'}, status=404)
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info

        if uid != tournament.host.id and uid != participant.player.id:
            return Response({"message": "You do not have permission to deregister this participant."}, status=status.HTTP_403_FORBIDDEN)

        participant.delete()
        return Response({"message": "Participant deregistered successfully."}, status=status.HTTP_204_NO_CONTENT)


# -------------------------------- Tournament Visualization --------------------------------------
class TournamentVisualization(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated, IsHostOrParticipant]

    def get(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        # Verify the permissions of the user object
        self.check_object_permissions(request, tournament)

        matches = TournamentMatch.objects.filter(tournament_id=tournament)
        matches_serializer = TournamentMatchSerializer(matches, many=True)
        data = {"matches": matches_serializer.data}
        return Response(data)


# -------------------------------- Tournament Lifecycle --------------------------------------
class TournamentStart(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request, id):
        with transaction.atomic():
            try:
                tournament = Tournament.objects.select_for_update().get(id=id)
            except Http404:
                return JsonResponse({'error': 'Tournament not found'}, status=404)
            user_info = request.user
            if not isinstance(user_info, tuple) or len(user_info) != 2:
                raise exceptions.AuthenticationFailed('User information is not in the expected format')

            uid, username = user_info

            if tournament.host.id != uid:
                return Response({"message": "Only the tournament host can start the tournament."}, status=403)
            if tournament.players.count() < 2:
                return JsonResponse({'error': 'Not enough players to start the tournament'}, status=400)
            
            if tournament.matches.count() == 0:
                response = self.match_generator(request, id)
                if response.status_code != 201:
                    return response
                game_response = generate_round(request, id, 0)
                print("game_response: ", game_response)
                if game_response.status_code != 200:
                    return game_response  
            else:
                return JsonResponse({'error': 'Tournament already started'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

        tournament_matches = TournamentMatch.objects.filter(tournament_id=tournament.id).order_by('id')
        serializer = TournamentMatchSerializer(tournament_matches, many=True)     
        # return response
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)

    def match_generator(self, request, id):

        print("Tournament id: ", id)
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info
        if tournament.host.id != uid:
            return Response({"message": "You are not authorized to generate Tournament."}, status=status.HTTP_403_FORBIDDEN)
        match_setting = tournament.setting
        tournament.calculate_nbr_of_match()
        print("nbr_of_match of T: ", tournament.nbr_of_match)

        # Create TournamentMatch instances
        round = 0
        players_total = tournament.players.count()
        print("players_total: ", players_total)
        players_match = tournament.nbr_of_player_match
        print("players_match: ", players_match)
        added_match = players_total // players_match
        if players_total % players_match != 0:
            added_match += 1
        tmp = added_match
        for _ in range(tournament.nbr_of_match):
            print("round: ", round, "mathches: ", added_match)
            added_match -= 1

            tournament_match = TournamentMatch.objects.create(
                tournament_id=tournament.id,
                match_setting_id=match_setting.id,
                round_number=round,
            )
            print("created Match: ", tournament_match)
            tournament.matches.add(tournament_match)

            if added_match == 0:
                round += 1
                winners = tmp
                added_match = winners // players_match
                if winners % players_match != 0:
                    added_match += 1
                tmp = added_match

        players = tournament.players.all().order_by('id')
        # print("all player: ", tournament.players.count())
        for player in players:
            match = tournament.assign_player_to_match(player, 0)
            if match:
                print(f"Player {player.username} added to match {match.id}")
            else:
                print(f"No available matches for player {player.username}")

        ret = auto_win_for_single_player(request, tournament.id, 0)
        if ret.status_code != 200:
            return ret

        tournament_matches = TournamentMatch.objects.filter(tournament_id=tournament.id).order_by('id')
        serializer = TournamentMatchSerializer(tournament_matches, many=True)

        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)

def auto_win_for_single_player(request, tournament_id, round_number):
    try:
        tournament = get_object_or_404(Tournament, id=tournament_id)
    except Http404:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    matches = tournament.matches.filter(round_number=round_number).order_by('id')
    
    matches_to_delete = []
    for match in matches:
        if match.state != "ended":
            print(".....MATCH: ", match)
            if match.players.count() == 0:
                print("Match without player")
                matches_to_delete.append(match)
                print("Match save to be deleted: ")
            if match.players.count() == 1:
                player = match.players.first()
                player.won_match.add(match)
                player.save()
                match.state = "ended"
                match.winner = player
                match.save()
                tournament.save()
            # return JsonResponse({'message': 'Match ended with a single participant'}, status=200)
    for match in matches_to_delete:
        match.delete()
        tournament.save()
        print("Match deleted")
    return JsonResponse({'message': '-'}, status=200)

class TournamentEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info
        
        if tournament.host.id != uid:
            return Response({"message": "Only the tournament host can end the tournament."}, status=403)

        matches_in_progress = tournament.matches.filter(Q(state="waiting") | Q(state="playing"))
        if matches_in_progress.exists():
            return Response({"message": "Cannot end the tournament while matches are in progress."}, status=400)
        
        # Update tournament state to end
        tournament.state = "ended"
        tournament.save()
        return Response({"status": "Tournament ended"})


# -------------------------------- Tournament Matches Progression ------------------------------------
class TournamentMatchList(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated, IsHostOrParticipant]

    def get(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        self.check_object_permissions(request, tournament)
        # matches = TournamentMatch.objects.filter(tournament_id=tournament.id)
        # print("matches: ", matches)
        # serializer = TournamentMatchSerializer(matches, many=True)
       
        matches = tournament.matches.all().order_by('id')

        if matches:
            serialized_matches = TournamentMatchSerializer(matches, many=True)
            tournament_name = tournament.tournament_name
            final_winner = matches.last().winner.username if matches.last().winner else None
            serializer = TournamentMatchListSerializer(data={
                'tournament_name': tournament_name,
                'date': tournament.created_at,
                'round': matches.last().round_number + 1,
                'winner': final_winner,
                'nbr_player_setting': tournament.setting.nbr_of_player,
                'matches': serialized_matches.data,
            })
            serializer.is_valid()
            return Response(serializer.data)
        else:
            serializer = TournamentMatchListSerializer(data={
                'tournament_name': tournament.tournament_name,
                'date': tournament.created_at,
                'winner': None,
                'matches': []
            })
            serializer.is_valid()
            return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request, id):
        serializer = TournamentMatchSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(tournament_id=id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TournamentMatchDetail(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]
    
    def put(self, request, id, match_id):
        try:
            match = get_object_or_404(TournamentMatch, id=match_id, tournament_id=id)
        except Http404:
            return JsonResponse({'error': 'Match not found'}, status=404)
        serializer = TournamentMatchSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, match_id):
        try:
            match = get_object_or_404(TournamentMatch, id=match_id, tournament_id=id)
        except Http404:
            return JsonResponse({'error': 'Match not found'}, status=404)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ---------------------------- Match Operations -------------------------------
class MatchStart(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 

    def post(self, request, match_id):
        try:
            match = get_object_or_404(TournamentMatch, id=match_id)
        except Http404:
            return JsonResponse({'error': 'Match not found'}, status=404)
        match.state = "playing"
        match.save()
        # Mettre à jour l'état du match pour le démarrer
        return Response({"status": "Match started"})

class MatchEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 

    def post(self, request, match_id):
        try:
            match = get_object_or_404(TournamentMatch, id=match_id)
        except Http404:
            return JsonResponse({'error': 'Match not found'}, status=404)
        match.state="ended"
        match.save()
        # Enregistrer les résultats du match et mettre à jour son état
        return Response({"status": "Match ended"})

class TournamentPlayerList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 

    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer

class PlayerList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer


def home(request):
    return render(request, 'home.html')


class PlayerStatsView(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, username):  
        # user_info = request.user
        # if not isinstance(user_info, tuple) or len(user_info) != 2:
        #     raise exceptions.AuthenticationFailed('User information is not in the expected format')
        # uid, username = user_info
        # if (username != username):
        #     return JsonResponse({'message': 'You are not authorized to view the stats of another player'}, status=403)
        try:
            player = get_object_or_404(Player, username=username)
        except Http404:
            return JsonResponse({'message': 'Nothing to show'}, status=204)

        played_tournaments = Tournament.objects.filter(players__username=username).exclude(state='waiting')
        played_matches = TournamentMatch.objects.filter(players__username=username)

        total_played = player.total_played
        nbr_of_won_matches = player.won_match.count()
        nbr_of_won_tournaments = player.won_tournament.count()
        serialized_tournaments = SimpleTournamentSerializer(played_tournaments, many=True)

        player_stats_data = {
            'played_tournaments': serialized_tournaments.data,
            'played_matches': played_matches,
            'total_played': total_played,
            'nbr_of_lost_matches': total_played - nbr_of_won_matches,
            'nbr_of_won_matches': nbr_of_won_matches,
            'nbr_of_won_tournaments': nbr_of_won_tournaments,
        }

        serializer = PlayerGameStatsSerializer(player_stats_data)
        return Response(serializer.data)

def generate_round(request, id, round):
    try:
        tournament = get_object_or_404(Tournament, id=id)
    except Http404:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    try:
        matches = tournament.matches.filter(round_number=round).exclude(state='ended').exclude(players=None).order_by('id')
        # matches = tournament.matches.filter(round_number=round).order_by('id')
    except AttributeError:
        return JsonResponse({'error': 'Matches not found or cannot be filtered.'}, status=404)
    
    if not matches.exists():
        return JsonResponse({'message': 'No matches found for the current round'}, status=204)
        
    serialized_matches = []
    for match in matches:
        match.state = "playing"
        match.save()
        match_data = {
            'tournament_id': match.tournament_id,
            'matchID': match.id,
            'gamemodeData': GamemodeDataSerializer(match).data,
            'fieldData': FieldDataSerializer(tournament.setting).data,
            'paddlesData': PaddlesDataSerializer(tournament.setting).data,
            'ballData': BallDataSerializer(tournament.setting).data,
            'playersData': SimplePlayerSerializer(match.players.all(), many=True).data,
        }
        serialized_matches.append(match_data)
    # print("serialized_matches:\n", serialized_matches)

    webhook_thread = Thread(target=send_webhook_request, args=(serialized_matches, tournament.id))
    webhook_thread.start()
    print("serialized_matches:\n", serialized_matches)
    # Update tournament, matches state
    tournament.state = "started"
    tournament.save()
    for match in matches:
        match.state = "playing"
        match.save()

    webhook_thread.join()
    global webhook_response
    if webhook_response is not None and webhook_response.status_code != 200:
        error_data = json.loads(webhook_response.content.decode('utf-8'))
        return JsonResponse(error_data, status=webhook_response.status_code)
    return Response({'message': 'Webhook request initiated'}, status=status.HTTP_200_OK)

def send_webhook_request(serialized_matches, tournament_id):
    global webhook_response
    game_backend_endpoint = 'http://game:3000/createMultipleMatches'

    print("--------------------------------------\n")

    hashed_code = create_hashed_code(tournament_id)
    payload = {'matches': serialized_matches, 'hashed_code': hashed_code}
    response = requests.post(game_backend_endpoint, json=payload)

    if response.status_code == 200:
        print("Webhook request successfully sent to the game backend.")
    else:
        print("Failed to send webhook request to the game backend. Status code:", response.status_code)

    webhook_response = response

#after this APIView session need to delete token data from sessionStorage
class DeletePlayer(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, username):
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, playername = user_info
        print("username: ", username, "playername: ", playername)
        if playername != username:
            return JsonResponse({'message': "You are not authorized to delete the Player"}, status=status.HTTP_403_FORBIDDEN)
        try:
            player = get_object_or_404(Player, username=username)
        except Http404:
            return JsonResponse({'message': f'User {username} hasn\'t started any tournamet. Nothing to clear from Tournament Database'}, status=204)
        # player.username = 'Unknown'
        # player.save()
    
        tournaments = Tournament.objects.filter(players=player)
        for tournament in tournaments:
            print("tournament: ", tournament.tournament_name)
            
            if tournament.winner != 'TBD':
                tournament.winner = 'Unknown'
                tournament.save()
            is_host = False
            if tournament.host == player:
                is_host = True
            if tournament.state == 'waiting':
                tournament.players.remove(player)
                tournament.save()
                if is_host == True:                    
                    tournament.delete()
            else:
                matches = tournament.matches.filter(players=player)
                for match in matches:
                    print(f"player {player.username} deleted from match {match.id}")
                    match.players.remove(player)
                    if match.state == 'ended':
                        player.username = 'Unknown'
                        player.save()
                        match.players.add(player)
                        print(f"For ENDED match : player {player.username} added to match {match.id}")
                    if match.state == 'playing':
                        player.username = playername + '*'
                        player.save()
                        match.players.add(player)
                        print(f"For PLAYING match : player {player.username} added to match {match.id}")
                    match.save()
                    tournament.save()
                    
                if is_host == True:
                    tournament.host = player
                    # tournament.players.remove(player)
                    tournament.save()
            
        return JsonResponse({'message': f'Username for user {username} has been deleted in related tournaments.'})

class UnjoinTournament(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, tournament_id, username):
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, playername = user_info
        print("username: ", username, "playername: ", playername)
        if playername != username:
            return JsonResponse({'message': "You are not authorized to unjoin the Tournament"}, status=status.HTTP_403_FORBIDDEN)
        try:
            player = get_object_or_404(Player, username=username)
        except Http404:
            return JsonResponse({'message': f'Player {username} not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            tournament = get_object_or_404(Tournament, id=tournament_id)
        except Http404:
            return JsonResponse({'message': f'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)

        if tournament.state != 'waiting':
            return JsonResponse({'message': 'Cannot unjoin this Tournament. The Tournament has been started or finished'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if not tournament.players.filter(username=username).exists():
            return JsonResponse({'message': f'Player {username} is not a participant of <{tournament.tournament_name}> Tournament'}, status=status.HTTP_404_NOT_FOUND)
        tournament.players.remove(player)
        tournament.save()
        return JsonResponse({'message': f'Player {username} is not participating in the <{tournament.tournament_name}> Tournament anymore'})