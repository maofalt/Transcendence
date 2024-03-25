from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, TournamentMatch, MatchSetting, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer
from .serializers import TournamentPlayerSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer, TournamentRegistrationSerializer, PlayerGameStatsSerializer, SimpleTournamentSerializer
from .serializers import MatchGeneratorSerializer
from django.conf import settings
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from .authentication import CustomJWTAuthentication
from .permissions import  IsOwnerOrReadOnly, IsHostOrParticipant
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from collections import defaultdict
from django.http import JsonResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q


    # compare total player > match player
    # check is user generate tournament is host user,
    # is user who start tournament is host user,
    # registration time put or is_full tornament, send alert and start.
    # deletion
    # jwt token



# ------------------------ Tournament -----------------------------------
class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]
  
    def get(self, request, *args, **kwargs):
        print(">> GET: loading page\n")
        tournaments = self.get_queryset()
        serializer = self.get_serializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        print(">> received POST to creat a new tournament\n")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        host, _ = Player.objects.get_or_create(id=request.user) # created wiil return False if the player already exists

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
        print("request.user: ", request.user)
        if player_id != request.user:
            return JsonResponse({'message': "You are not authorized to join the Tournament"}, status=status.HTTP_403_FORBIDDEN)
        print("All Tournaments:")
        for tournament in Tournament.objects.all():
            print(tournament.id)
        print("tournament_id: ", tournament_id)
        tournament = get_object_or_404(Tournament, id=tournament_id)

        if tournament.is_full():
            return JsonResponse({'message': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        uid = request.user
        player, created = Player.objects.get_or_create(id=uid) # created wiil return False if the player already exists
        tournament.players.add(player)
        if created:
            print("New Player joined\n")
        
        print("Players in the tournament:")
        for player in tournament.players.all():
            print(player.id)

        serializer = TournamentSerializer(tournament)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)


class MatchGenerator(generics.ListCreateAPIView):
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = MatchGeneratorSerializer
    queryset = TournamentMatch.objects.all()

    def post(self, request, tournament_id):

        print("Tournament id: ", tournament_id)
        tournament = get_object_or_404(Tournament, id=tournament_id)
        print("request.user: ", request.user, "tournament.host.id: ", tournament.host.id)
        if tournament.host.id != request.user:
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
        print("all player: ", tournament.players.count())
        for player in players:
            match = tournament.assign_player_to_match(player, 0)
            if match:
                print(f"Player {player} added to match {match}")
                participant, created = MatchParticipants.objects.get_or_create(
                    match_id=match.id,
                    player_id=player.id,
                    round_number=0
                )       
                if created:
                    print(f"Participant {participant} created with player ID: {player.id}")
                else:
                    print(f"Participant {participant} already exists for match {match.id}")            
                match.participants.add(participant)
                match.save()
            else:
                print(f"No available matches for player {player}")

        tournament_matches = TournamentMatch.objects.filter(tournament_id=tournament.id).order_by('id')
        serializer = TournamentMatchSerializer(tournament_matches, many=True)

        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)
    
class MatchResult(APIView):
    authentication_classes = [CustomJWTAuthentication]

    def post(self, request, match_id, winner_id):
        print("match_id : ", match_id,  "winner_id: ", winner_id)
        match = get_object_or_404(TournamentMatch, id=match_id)
        if match.state != "ended":
            return Response(f"Match {match_id} is not finished")
        for participant in match.participants.all():
            print("participant id : ", participant.player_id)
            try:
                player = match.players.get(id=player_id)
            except Player.DoesNotExist:
                return Response(f"Player with id {player_id} not found in the match", status=status.HTTP_404_NOT_FOUND)
            
            if participant.player_id == winner_id:
                if participant.is_winner == False:
                    participant.is_winner = True
                    participant.save()
                    player.total_played += 1
                    player.won_match.add(match)
                    player.save()
                winner_found = True
            else:
                player.total_played += 1
                player.save()
                winner_found = False

        if winner_found:
            return Response("Winner found and updated successfully")
        else:
            return Response("Winner not found among participants", status=status.HTTP_404_NOT_FOUND)

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
        tournament = get_object_or_404(Tournament, id=tournament_id)
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
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED, safe=False)

class TournamentRoundState(APIView):
    authentication_classes = [CustomJWTAuthentication]
    
    def get(self, request, tournament_id):
        tournament = get_object_or_404(Tournament, id=tournament_id)
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
        tournament = get_object_or_404(Tournament, id=id)
        
        # Check if the user is the tournament host or a registered participant
        if tournament.host != request.user and not TournamentPlayer.objects.filter(tournament_id=tournament, player=request.user).exists():
            return Response({"message": "You are not authorized to view the participant list."}, status=status.HTTP_403_FORBIDDEN)
        
        participants = TournamentPlayer.objects.filter(tournament_id=tournament)
        serializer = TournamentPlayerSerializer(participants, many=True)
        return Response(serializer.data)


class TournamentParticipantDetail(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def delete(self, request, id, participant_id):
        tournament = get_object_or_404(Tournament, id=id)
        participant = get_object_or_404(TournamentPlayer, tournament_id=tournament, player__player_id=participant_id)

        if request.user != tournament.host.id and request.user != participant.player.id:
            return Response({"message": "You do not have permission to deregister this participant."}, status=status.HTTP_403_FORBIDDEN)

        participant.delete()
        return Response({"message": "Participant deregistered successfully."}, status=status.HTTP_204_NO_CONTENT)


# -------------------------------- Tournament Visualization --------------------------------------
class TournamentVisualization(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated, IsHostOrParticipant]

    def get(self, request, id):
        tournament = get_object_or_404(Tournament, id=id)

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
        tournament = get_object_or_404(Tournament, id=id)

         # Verify if the user is the host of the tournament
        if tournament.host.id != request.user:
            return Response({"message": "Only the tournament host can start the tournament."}, status=403)

        # Update tournament state to start
        tournament.state = "started"
        tournament.save()
        return Response({"status": "Tournament started"})


class TournamentEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)

        # Verify if the user is the host of the tournament
        if tournament.host.id != request.user:
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
        tournament = get_object_or_404(Tournament, id=id)
        self.check_object_permissions(request, tournament)
        matches = TournamentMatch.objects.filter(tournament_id=tournament)
        serializer = TournamentMatchSerializer(matches, many=True)
        return Response(serializer.data)

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
        match = get_object_or_404(TournamentMatch, id=match_id, tournament_id=id)
        serializer = TournamentMatchSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, match_id):
        match = get_object_or_404(TournamentMatch, id=match_id, tournament_id=id)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TournamentMatchList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 
    serializer_class = TournamentMatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['id']
        return TournamentMatch.objects.filter(tournament_id=tournament_id).order_by('id')


# ---------------------------- Match Operations -------------------------------
class MatchStart(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 

    def post(self, request, match_id):
        match = get_object_or_404(TournamentMatch, id=match_id)
        match.state = "playing"
        match.save()
        # Mettre à jour l'état du match pour le démarrer
        return Response({"status": "Match started"})

class MatchEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 

    def post(self, request, match_id):
        match = get_object_or_404(TournamentMatch, id=match_id)
        match.state="ended"
        match.save()
        # Enregistrer les résultats du match et mettre à jour son état
        return Response({"status": "Match ended"})


# class MatchSettingList(generics.ListCreateAPIView):
#     queryset = MatchSetting.objects.all()
#     serializer_class = MatchSettingSerializer

#     def perform_create(self, serializer):
#         serializer.save()

# class GameTypeList(ListAPIView):
#     authentication_classes = [CustomJWTAuthentication]
#     # permission_classes = [IsAuthenticated] 

#     queryset = GameType.objects.all()
#     serializer_class = GameTypeSerializer

# class TournamentTypeList(ListAPIView):
#     #authentication_classes = [CustomJWTAuthentication]
#     # permission_classes = [IsAuthenticated] 
#     def list(self, request, *args, **kwargs):
#         tournament_types = Tournament.TOURNAMENT_TYPE
#         return JsonResponse({'tournament_types': tournament_types})

# class RegistrationTypeList(ListAPIView):
#     # authentication_classes = [CustomJWTAuthentication]
#     # permission_classes = [IsAuthenticated] 
#     def list(self, request, *args, **kwargs):
#         registration_types = Tournament.REGISTRATION_TYPE
#         return JsonResponse({'registration_types': registration_types})

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

    def get(self, request, user_id):
        player = Player.objects.get(id=user_id)
        played_tournaments = Tournament.objects.filter(players__id=user_id)
        played_matches = TournamentMatch.objects.filter(players__id=user_id)

        total_played = player.total_played
        nbr_of_won_matches = player.won_match.count()
        nbr_of_won_tournaments = player.won_tournament.count()

        # Calculate the average score
        total_scores = 0
        highest_score = 0
        for match in played_matches:
            if match.participants.filter(player_id=user_id).exists():
                participant = match.participants.get(player_id=user_id)
                total_scores += participant.participant_score
                highest_score = max(highest_score, participant.participant_score)
        average_score = total_scores / total_played if total_played > 0 else 0

        serialized_tournaments = SimpleTournamentSerializer(played_tournaments, many=True)

        player_stats_data = {
            'played_tournaments': serialized_tournaments.data,
            'played_matches': played_matches,
            'total_played': total_played,
            'nbr_of_lost_matches': total_played - nbr_of_won_matches
            'nbr_of_won_matches': nbr_of_won_matches,
            'nbr_of_won_tournaments': nbr_of_won_tournaments,
            'average_score': average_score,
            'highest_score': highest_score
        }

        serializer = PlayerGameStatsSerializer(player_stats_data)
        return Response(serializer.data)