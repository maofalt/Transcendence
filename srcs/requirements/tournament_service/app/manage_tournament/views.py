from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType, RegistrationType, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer
from .serializers import TournamentPlayerSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer, TournamentRegistrationSerializer
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




# ------------------------ Tournament -----------------------------------
class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]
    # renderer_classes = [JSONRenderer]  # Force the response to be rendered in JSON
    # permission_classes = [IsAuthenticated]  # Only authenticated users can create and list tournaments

    def get(self, request, *args, **kwargs):
        print(">> GET: loading page\n")
        tournaments = self.get_queryset()
        serializer = self.get_serializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        print(">> received POST to creat a new tournament\n")
        # Attribue automatiquement l'utilisateur actuel comme host du tournoi créé
        data = request.data
        print("POSTED DATA: ", data)
        tournament_name = data.get('tournament_name')
        # settings = data.get('settings')
        # registration_type = data.get('registration_type')
        registration_period_min = data.get('registration_period_min')
        nbr_of_player_total = data.get('nbr_of_player_total')
        nbr_of_player_match = data.get('nbr_of_player_match')
        # username = 'tempHost'
        uid = request.user
        host, created = Player.objects.get_or_create(id=uid) # created wiil return False if the player already exists

        # print("host username: ", host.username)


        # Create MatchSetting instance
        match_setting = MatchSetting.objects.create(
            duration_sec=data.get('duration_sec', 210),
            max_score=data.get('max_score', 5),
            walls_factor=data.get('walls_factor', 0),
            size_of_goals=data.get('size_of_goals', 15),
            paddle_height=data.get('paddle_height', 10),
            paddle_speed=data.get('paddle_speed', 0.5),
            ball_speed=data.get('ball_speed', 0.7),
            ball_radius=data.get('ball_radius', 1),
            ball_color=data.get('ball_color', '#000000'),
            nbr_of_player=data.get('nbr_of_player_match', 2)    # this is about how it set not actual played player 
        )

        # Create Tournament instance
        tournament = Tournament.objects.create(
            tournament_name=tournament_name,
            # registration=registration_type,
            registration_period_min=registration_period_min,
            nbr_of_player_total=nbr_of_player_total,
            nbr_of_player_match=nbr_of_player_match,
            host=host,
            setting=match_setting,
            created_at=timezone.now(),
            # nbr_of_player   will be assigned when user joining the tournament
        )
        
        tournament.players.add(host)

        serializer = TournamentSerializer(tournament)
        # tournament.calculate_nbr_of_match()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


        # serializer.save(host=self.request.user)
    # permission_classes = [permissions.IsAuthenticated] #add more permissions if is necessary
    

    #from Miguel's changes
    # def list(self, request, *args, **kwargs):
    #     queryset = self.get_queryset()
    #     if not queryset.exists():
    #         return Response({"message": "NO tournament was found."}, status=status.HTTP_204_NO_CONTENT)

    #Orignal code
    # def list(self, request, *args, **kwargs):
    #     queryset = self.get_queryset()
    #     if not queryset.exists():
    #         return Response([], status=status.HTTP_200_OK)

    #     serializer = self.get_serializer(queryset, many=True)
    #     return Response(serializer.data)
    # def generate_tree


# ------------------------ Assigning Players on the Tournament Tree -----------------------------------

class JoinTournament(generics.ListCreateAPIView):
    authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 401 comes from here
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer

    def get(self, request, *args, **kwargs):
        print("request.user: ", request.user)
        return self.list(request, *args, **kwargs)

    def post(self, request, id):
        print("request.user: ", request.user)
        if id != request.user:
            return JsonResponse({'message': "You are not authorized to join the Tournament"}, status=status.HTTP_403_FORBIDDEN)
        print("All Tournaments:")
        for tournament in Tournament.objects.all():
            print(tournament.id)
        print("POSTED DATA: ", request.data)
        # username = request.data.get('username')

        tournament_id = request.data.get('tournament_id')
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

        # tournament.assign_player_to_match(player)

        serializer = TournamentSerializer(tournament)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)


class MatchGenerator(generics.ListCreateAPIView):
    serializer_class = MatchGeneratorSerializer

    def get(self, request, *args, **kwargs):
        form_data = {
            "tournament_id": None
        }
        return Response(form_data)

    def post(self, request, tournament_id):

        print("Tournament id: ", tournament_id)
        tournament = get_object_or_404(Tournament, id=tournament_id)
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
        for participant in match.participants.all():
            print("participant id : ", participant.player_id)
            if participant.player_id == winner_id:
                participant.is_winner = True
                participant.save()
                winner_found = True
            else:
                winner_found = False

        if winner_found:
            return Response("Winner found and updated successfully")
        else:
            return Response("Winner not found among participants", status=status.HTTP_404_NOT_FOUND)

class MatchUpdate(APIView):
    authentication_classes = [CustomJWTAuthentication]
    serializer_class = MatchGeneratorSerializer
    # queryset = Tournament.objects.all()


    def post(self, request, tournament_id, round):
        tournament = get_object_or_404(Tournament, id=tournament_id)
        next_matches = tournament.matches.filter(round_number=round).order_by('id')
        finished_matches = tournament.matches.filter(round_number=round - 1).order_by('id')
        finished_match_ids = finished_matches.values_list('id', flat=True)

        participants = MatchParticipants.objects.filter(is_winner=True, match_id__in=finished_match_ids)
        print("Filtered participants: ", participants)
        # Filter out winners from participants
        winners = participants.filter(is_winner=True)

        # Extract player IDs of winners
        winner_player_ids = sorted(winners.values_list('player_id', flat=True))
        print("winner_player_ids: ", winner_player_ids)

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

        for match in matches:
            if match.state == 'playing':
                # If any match is still ongoing, return None
                return Response({'round': None})
        
        # If all matches of the round are finished, return the round number of the last match
        last_match = matches.filter(state='ended').order_by('-round_number').first()
        if last_match:
            return Response({'round': last_match.round_number})
        else:
            return Response({'round': None, "message": "An Error occurred while checking Round state"})


class TournamentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]  # Custom permission class for owner-only access

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
    permission_classes = [IsAuthenticated] # Only authenticated users can view the participant list

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated, IsHostOrParticipant]

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

        # Update tournament state to end
        tournament.state = "ended"
        tournament.save()
        return Response({"status": "Tournament ended"})


# -------------------------------- Tournament Matches Progression ------------------------------------
class TournamentMatchList(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated, IsHostOrParticipant]

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
        match.state = "palying"
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

class TournamentTypeList(ListAPIView):
    #authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 
    def list(self, request, *args, **kwargs):
        tournament_types = Tournament.TOURNAMENT_TYPE
        return JsonResponse({'tournament_types': tournament_types})

class RegistrationTypeList(ListAPIView):
    # authentication_classes = [CustomJWTAuthentication]
    # permission_classes = [IsAuthenticated] 
    def list(self, request, *args, **kwargs):
        registration_types = Tournament.REGISTRATION_TYPE
        return JsonResponse({'registration_types': registration_types})

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