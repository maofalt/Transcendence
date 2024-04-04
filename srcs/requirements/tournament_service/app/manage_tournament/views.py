from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from .models import Tournament, TournamentMatch, MatchSetting, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer, SimplePlayerSerializer
from .serializers import TournamentPlayerSerializer, GamemodeDataSerializer, FieldDataSerializer, PaddlesDataSerializer, BallDataSerializer, TournamentMatchRoundSerializer, TournamentMatchListSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer, TournamentRegistrationSerializer, PlayerGameStatsSerializer, SimpleTournamentSerializer
from .serializers import MatchGeneratorSerializer
from django.conf import settings
from rest_framework.views import APIView
# from rest_framework_simplejwt.authentication import JWTAuthentication
from .authentication import CustomJWTAuthentication
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
from django.core import exceptions
from django.utils.html import escape
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie

# to test
    # - bigger value for nbr_of_player_match than nbr_of_player_total
    # - webhooking
    # - account deletion view is replacing all the player name data on Tournament and Match
    # - check return 'date' data from TournamentMatchList
    # - crash between HttpResponse and framework.Response
# to do
    # - delete unused field from model (tournament_result, nbr_of_match ...) or use them

# ------------------------ Tournament -----------------------------------
class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]
  
    def get(self, request, *args, **kwargs):
        print(">> GET: loading page\n")
        tournaments = self.get_queryset()
        serializer = self.get_serializer(tournaments, many=True)
        escaped_data = escape(serializer.data)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        print(">> received POST to creat a new tournament\n")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info
        host, _ = Player.objects.get_or_create(id=uid, username=username) # created wiil return False if the player already exists

        match_setting_data = {
            'duration_sec': validated_data.get('duration_sec', 210),
            'max_score': validated_data.get('max_score', 5),
            'walls_factor': validated_data.get('walls_factor', 0),
            'size_of_goals': validated_data.get('size_of_goals', 15),
            'paddle_height': validated_data.get('paddle_height', 10),
            'paddle_speed': validated_data.get('paddle_speed', 0.5),
            'ball_speed': validated_data.get('ball_speed', 0.7),
            'ball_radius': validated_data.get('ball_radius', 1),
            'ball_color': validated_data.get('ball_color', '#000000'),
            'nbr_of_player': validated_data.get('nbr_of_player_match', 2)
        }
        match_setting = MatchSetting.objects.create(**match_setting_data)

        tournament = Tournament.objects.create(
            tournament_name=validated_data['tournament_name'],
            registration_period_min=validated_data['registration_period_min'],
            nbr_of_player_total=validated_data['nbr_of_player_total'],
            nbr_of_player_match=validated_data['nbr_of_player_match'],
            host=host,
            setting=match_setting,
            created_at=timezone.now(),
        )
        
        tournament.players.add(host)

        serialized_tournament  = TournamentSerializer(tournament)
        escaped_data = escape(serialized_tournament.data)
        return Response(serialized_tournament.data, status=status.HTTP_201_CREATED)

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

# @api_view(['POST'])
# @ensure_csrf_cookie
# @csrf_protect
# @authentication_classes([CustomJWTAuthentication])
# def match_generator(request, id):
#     # authentication_classes = [CustomJWTAuthentication]
#     # serializer_class = MatchGeneratorSerializer
#     # queryset = TournamentMatch.objects.all()

#     print("Tournament id: ", id)
#     try:
#         tournament = get_object_or_404(Tournament, id=id)
#     except Http404:
#         return JsonResponse({'error': 'Tournament not found'}, status=404)
#     user_info = request.user
#     if not isinstance(user_info, tuple) or len(user_info) != 2:
#         raise exceptions.AuthenticationFailed('User information is not in the expected format')

#     uid, username = user_info
#     if tournament.host.id != uid:
#         return Response({"message": "You are not authorized to generate Tournament."}, status=status.HTTP_403_FORBIDDEN)
#     match_setting = tournament.setting
#     tournament.calculate_nbr_of_match()
#     print("nbr_of_match of T: ", tournament.nbr_of_match)

#     # Create TournamentMatch instances
#     round = 0
#     players_total = tournament.players.count()
#     print("players_total: ", players_total)
#     players_match = tournament.nbr_of_player_match
#     print("players_match: ", players_match)
#     added_match = players_total // players_match
#     if players_total % players_match != 0:
#         added_match += 1
#     tmp = added_match
#     for _ in range(tournament.nbr_of_match):
#         print("round: ", round, "mathches: ", added_match)
#         added_match -= 1

#         tournament_match = TournamentMatch.objects.create(
#             tournament_id=tournament.id,
#             match_setting_id=match_setting.id,
#             round_number=round,
#         )
#         print("created Match: ", tournament_match)
#         tournament.matches.add(tournament_match)

#         if added_match == 0:
#             round += 1
#             winners = tmp
#             added_match = winners // players_match
#             if winners % players_match != 0:
#                 added_match += 1
#             tmp = added_match

#     players = tournament.players.all().order_by('id')
#     print("all player: ", tournament.players.count())
#     for player in players:
#         match = tournament.assign_player_to_match(player, 0)
#         if match:
#             print(f"Player {player} added to match {match}")
#         else:
#             print(f"No available matches for player {player}")

#     tournament_matches = TournamentMatch.objects.filter(tournament_id=tournament.id).order_by('id')
#     serializer = TournamentMatchSerializer(tournament_matches, many=True)

#     return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)


class MatchResult(APIView):
    authentication_classes = [CustomJWTAuthentication]

    @staticmethod
    def round_state(request, id, cur_round):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        
        matches = tournament.matches.filter(round_number=cur_round)
        print("matches: ", matches)
        
        if matches.filter(state='playing').exists() or matches.filter(state='waiting').exists():
            return False
        if matches.filter(state='ended').count() == matches.count():
            return True
        return False

    @staticmethod
    def match_update(request, tournament_id, round):
        try:
            tournament = get_object_or_404(Tournament, id=tournament_id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)

        finished_matches = tournament.matches.filter(round_number=round - 1).order_by('id')
        matches_in_progress = finished_matches.filter(Q(state="waiting") | Q(state="playing"))
        if matches_in_progress.exists():
            return Response({"message": "Cannot update next round, the previous round is on going."}, status=400)

        winners = [match.winner for match in finished_matches if match.winner is not None]
        sorted_winners = sorted(winners, key=lambda user: user.id)

        next_matches = tournament.matches.filter(round_number=round).order_by('id')
        if not next_matches.exists():
            if len(sorted_winners) == 1:
                print("sorted_winners: ", sorted_winners)
                sorted_winners[0].won_tournament.add(tournament)
                sorted_winners[0].save()

                matches_in_progress = tournament.matches.filter(Q(state="waiting") | Q(state="playing"))
                if matches_in_progress.exists():
                    return Response({"message": "Cannot end the tournament while matches are in progress."}, status=400)
                
                tournament.state = "ended"
                tournament.save()
                serializer = TournamentMatchSerializer(finished_matches, many=True)
                return JsonResponse({"data": serializer.data, "status": status.HTTP_200_OK, "message": 'The Tournament has been finished.', "winner": sorted_winners[0].username})
            else:
                return JsonResponse({'status': status.HTTP_400_BAD_REQUEST, 'message': 'An Error occurred while updating the next round matches.'})
        for winner in winners:
            match = tournament.assign_player_to_match(winner, round)
            if match:
                print(f"Player {winner.username} added to match {match.id}")
                match.save()
            else:
                print(f"No available matches for player {winner}")
        
        serializer = TournamentMatchSerializer(next_matches, many=True)
        print("serializer.data\n", serializer.data)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)


    def post(self, request, match_id, winner_username):
        print("match_id : ", match_id,  "winner_id: ", winner_username)
        try:
            match = get_object_or_404(TournamentMatch, id=match_id)
        except Http404:
            return JsonResponse({'error': 'Match not found'}, status=404)
        
        players = match.players.all()
        if not players.filter(username=winner_username).exists():
            return Response("Winner not found among participants", status=status.HTTP_404_NOT_FOUND)

        if match.state == "ended":
            return Response(f"Match {match_id} has been ended before", status=status.HTTP_400_BAD_REQUEST)
        
        match.state = "ended"
        match.save()
        winner_found = False

        for player in players:
            if player.username == winner_username:
                player.total_played += 1
                player.won_match.add(match)
                player.save()
                match.winner = player
                match.save()
            else:
                player.total_played += 1
                player.save()

        cur_round = match.round_number
        if MatchResult.round_state(request, match.tournament_id, cur_round) == False:
            # if MatchResult.round_state(request, match.tournament_id, cur_round) == False:
            return Response(status=204)
            # return JsonResponse({'message': "Winner found and updated successfully", })

        update = MatchResult.match_update(request, match.tournament_id, cur_round + 1)
        print('update: ', update)
        if update.status_code == 200:
            return JsonResponse(update.data, status=update.status_code)   # tournament finished
        elif update.status_code != 201:
            return JsonResponse(update.data, status=update.status_code)
        response = generate_round(request, match.tournament_id, cur_round + 1)
        return JsonResponse(response, status=status.HTTP_201_CREATED, safe=False)


        

# class MatchResult(APIView):
#     authentication_classes = [CustomJWTAuthentication]

#     def post(self, request, match_id, player_id, score):
#         print("match_id : ", match_id,  "player_id: ", player_id, "score: ", score)
#         match = get_object_or_404(TournamentMatch, id=match_id)

#         if match.state != "ended":
#             return Response(f"Match {match_id} is not finished")
#         try:
#             player = match.players.get(id=player_id)
#         except Player.DoesNotExist:
#             return Response(f"Player with id {player_id} not found in the match", status=status.HTTP_404_NOT_FOUND)
        
#         for participant in match.participants.all():
#             print("participant id : ", participant.player_id)
#             if participant.player_id == player_id:
#                 player.total_played += 1
#                 player.save()
#                 participant.participant_score = score
#                 participant.save()

#         score_unset = match.participants.filter(participant_score=0)

#         if not score_unset.exists():
#             winner = match.participants.order_by('-participant_score').first()
#             winner.is_winner = True
#             winner.save()
#             player = match.players.get(id=winner.player_id)
#             player.won_match.add(match)
#             player.save()
#             return Response("Winner found and updated successfully")
#         else:
#             return Response("Winner not found yet. Some players score is missing")


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

# class TournamentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
#     queryset = Tournament.objects.all()
#     serializer_class = TournamentSerializer
#     authentication_classes = [CustomJWTAuthentication]

#     def destroy(self, request, *args, **kwargs):
#         tournament_id = self.kwargs.get('tournament_id')
        
#         try:
#             tournament = Tournament.objects.get(pk=tournament_id)
#         except Tournament.DoesNotExist:
#             raise Http404("Tournament does not exist")

#         # Check if the requesting user is the host of the tournament
#         if request.user == tournament.host.id:
#             tournament.state = 'destroyed'
#             tournament.save()
#             return JsonResponse({'message': 'Tournament deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
#         else:
#             return JsonResponse({'error': 'You don\'t have permission to delete this tournament'}, status=status.HTTP_403_FORBIDDEN)

# class TournamentRegistrationCreate(generics.CreateAPIView):
#     queryset = TournamentRegistration.objects.all()
#     serializer_class = TournamentRegistrationSerializer
#     authentication_classes = [CustomJWTAuthentication]
#     permission_classes = [IsAuthenticated]  # Only authenticated users can register

#     def post(self, request, *args, **kwargs):
#         tournament_id = kwargs.get('id')
#         tournament = get_object_or_404(Tournament, pk=id)
#         player_id = request.data.get('player_id')
#         player = get_object_or_404(Player, pk=player_id)

#         if TournamentPlayer.objects.filter(tournament_id=tournament, player=player).exists():
#             return Response({"message": "Player already registered."}, status=status.HTTP_400_BAD_REQUEST)

#         tournament_player = TournamentPlayer.objects.create(tournament_id=tournament, player=player)
#         # Serialize and return the new TournamentPlayer
#         serializer = self.get_serializer(tournament_player)
#         try:
#             return super().post(request, *args, **kwargs)
#         except ValidationError as e:
#             return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
#         return Response({"message": "Player registered successfully."}, serializer.data, status=status.HTTP_201_CREATED)


# --------------------------- Tournament Participants -----------------------------------    
class TournamentParticipantList(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] # Only authenticated users can view the participant list

    def get(self, request, id):
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        # Check if the user is the tournament host or a registered participant
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info
        if tournament.host != uid:
            return Response({"message": "You are not authorized to view the participant list."}, status=status.HTTP_403_FORBIDDEN)
        
        participants = TournamentPlayer.objects.filter(tournament_id=tournament)
        serializer = TournamentPlayerSerializer(participants, many=True)
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
        try:
            tournament = get_object_or_404(Tournament, id=id)
        except Http404:
            return JsonResponse({'error': 'Tournament not found'}, status=404)
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, username = user_info

        if tournament.host.id != uid:
            return Response({"message": "Only the tournament host can start the tournament."}, status=403)
        if tournament.matches.count() == 0:
            response = self.match_generator(request, id)
            if response.status_code != 201:
                return response
            game_response = generate_round(request, id, 0)
            if game_response.status_code != 200:
                return game_response   
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

        tournament_matches = TournamentMatch.objects.filter(tournament_id=tournament.id).order_by('id')
        serializer = TournamentMatchSerializer(tournament_matches, many=True)

        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)



# class TournamentStart(APIView):
#     authentication_classes = [CustomJWTAuthentication]
#     # permission_classes = [IsAuthenticated]

#     def post(self, request, id):
#         try:
#             tournament = get_object_or_404(Tournament, id=id)
#         except Http404:
#             return JsonResponse({'error': 'Tournament not found'}, status=404)
#         user_info = request.user
#         if not isinstance(user_info, tuple) or len(user_info) != 2:
#             raise exceptions.AuthenticationFailed('User information is not in the expected format')

#         uid, username = user_info

#         if tournament.host.id != uid:
#             return Response({"message": "Only the tournament host can start the tournament."}, status=403)

#         # Update tournament state to start
#         tournament.state = "started"
#         tournament.save()
#         tournament_players = tournament.players.all()

#         round_nbr = 0
#         while True:
#             tournament = Tournament.objects.get(id=id)
#             if tournament.state == 'ended':
#                 break
#             if round_nbr != 0:
#                 match_update(request, tournament_id, round_nbr)
#             generate_round(request, tournament.id, round_nbr)
            
#             for player in tournament_players:
#                 response = stream_notification(request, player.username, player.id, tournament.name, round_nbr)
#                 if response.status_code != 200:
#                     return response
#             while round_state(request, tournament.id, round_nbr):
#                 time.sleep(1)
#             round_nbr += 1
#         return Response({"status": "Tournament finished"})
    




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
        matches = tournament.matches.all()

        if matches:
            serialized_matches = TournamentMatchSerializer(matches, many=True)
            tournament_name = tournament.tournament_name
            final_winner = matches.last().winner.username if matches.last().winner else None
            serializer = TournamentMatchListSerializer(data={
                'tournament_name': tournament_name,
                'date': tournament.created_at,
                'round': matches.last().round_number,
                'winner': final_winner,
                'matches': serialized_matches.data
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
            return Response(serializer.data, status=status.HTTP_204_NO_CONTENT)


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

# class TournamentMatchList(ListAPIView):
#     authentication_classes = [CustomJWTAuthentication]
#     # permission_classes = [IsAuthenticated] 
#     serializer_class = TournamentMatchSerializer

#     def get_queryset(self):
#         tournament_id = self.kwargs['id']
#         return TournamentMatch.objects.filter(tournament_id=tournament_id).order_by('id')


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

class MatchParticipantsList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 
    
    queryset = MatchParticipants.objects.all()
    serializer_class = MatchParticipantsSerializer

def home(request):
    return render(request, 'home.html')


class PlayerStatsView(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request, username):
        player = Player.objects.get(username=username)
        played_tournaments = Tournament.objects.filter(players__username=username)
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

# class GenerateRound(APIView):
#     authentication_classes = [CustomJWTAuthentication]

#     def post(self, request, tournament_id, round):
#         try:
#             tournament = get_object_or_404(Tournament, id=tournament_id)
#         except Http404:
#             return JsonResponse({'error': 'Tournament not found'}, status=404)
#         matches = tournament.matches.filter(round_number=round).order_by('id')

#         serialized_matches = []
#         for match in matches:
#             match.state = "playing"
#             match.save()
#             match_data = {
#                 'tournament_id': match.tournament_id,
#                 'match_id': match.id,
#                 'gamemodeData': GamemodeDataSerializer(match).data,
#                 'fieldData': FieldDataSerializer(tournament.setting).data,
#                 'paddlesData': PaddlesDataSerializer(tournament.setting).data,
#                 'ballData': BallDataSerializer(tournament.setting).data,
#                 'players': SimplePlayerSerializer(match.players.all(), many=True).data,
#             }
#             serialized_matches.append(match_data)

#         webhook_thread = Thread(target=self.send_webhook_request, args=(serialized_matches,))
#         webhook_thread.start()

#         return Response(serialized_matches, status=status.HTTP_200_OK)

#     def send_webhook_request(self, serialized_matches):
#         game_backend_endpoint = 'http://game:3000/createMultipleMatches'

#         payload = {'matches': serialized_matches}
#         response = requests.post(game_backend_endpoint, json=payload)

#         if response.status_code == 200:
#             print("Webhook request successfully sent to the game backend.")
#         else:
#             print("Failed to send webhook request to the game backend. Status code:", response.status_code)


def generate_round(request, id, round):
    try:
        tournament = get_object_or_404(Tournament, id=id)
    except Http404:
        return JsonResponse({'error': 'Tournament not found'}, status=404)
    try:
        matches = tournament.matches.filter(round_number=round).order_by('id')
    except AttributeError:
        return JsonResponse({'error': 'Matches not found or cannot be filtered.'}, status=404)
    
    serialized_matches = []
    for match in matches:
        match.state = "playing"
        match.save()
        match_data = {
            'tournament_id': match.tournament_id,
            'match_id': match.id,
            'gamemodeData': GamemodeDataSerializer(match).data,
            'fieldData': FieldDataSerializer(tournament.setting).data,
            'paddlesData': PaddlesDataSerializer(tournament.setting).data,
            'ballData': BallDataSerializer(tournament.setting).data,
            'playersData': SimplePlayerSerializer(match.players.all(), many=True).data,
        }
        serialized_matches.append(match_data)

    webhook_thread = Thread(target=send_webhook_request, args=(serialized_matches,))
    webhook_thread.start()

    # Update tournament, matches state
    tournament.state = "started"
    tournament.save()
    for match in matches:
        match.state = "playing"
        match.save()

    success, message = send_webhook_request(serialized_matches)
    if success:
        return Response(message, status=status.HTTP_200_OK)
    else:
        return Response({'error': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def send_webhook_request(serialized_matches):
    game_backend_endpoint = 'http://game:3000/createMultipleMatches'

    payload = {'matches': serialized_matches}
    response = requests.post(game_backend_endpoint, json=payload)

    if response.status_code == 200:
        print("Webhook request successfully sent to the game backend.")
        return True, "Webhook request successfully sent to the game backend."
    else:
        print("Failed to send webhook request to the game backend. Status code:", response.status_code)
        return False, "Failed to send webhook request to the game backend. Status code: " + str(response.status_code)

# @authentication_classes([CustomJWTAuthentication])
def stream_notification(request, username, user_id, tournament_name, round_nbr):
    def event_stream(username, user_id, tournament_name, round_nbr):
        countdown = 60
        round = round_nbr + 1
        while countdown >= 0:
            notification_data = f"Hello, {username}! Your next match for  Tournament < {tournament_name} >, round {round} will start in {countdown} seconds"
            event = f"data: {notification_data}\n\n"
            yield event
            time.sleep(1)
            countdown -= 1

    response = StreamingHttpResponse(event_stream(username, user_id), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response

#after this APIView session need to delete token data from sessionStorage
class DeletePlayer(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, username):
        try:
            player = Player.get_object_or_404(username=username)
        except Http404:
            return JsonResponse({'message': f'User {username} hasn\'t started any tournamet. Nothing to clear from Tournament Database'}, status=204)
        player.username = 'Unkown'
        player.save()
    
        tournaments = Tournament.object.filter(playes=player)
        for tournament in tournaments:
            matches = tournament.matches.filter(players=player)
            for match in matches:
                match.players.remove(player)
                match.players.add(player)
                match.save()

            if tournament.host == player:
                tournament.host = player
                tournament.save()
        return JsonResponse({'message': f'Username for user {username} has been deleted in related tournaments.'})

class UnjoinTournament(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, tournament_id, username):
        user_info = request.user
        if not isinstance(user_info, tuple) or len(user_info) != 2:
            raise exceptions.AuthenticationFailed('User information is not in the expected format')

        uid, playername = user_info
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