from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType, RegistrationType, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer, GameTypeSerializer
from .serializers import TournamentTypeSerializer, RegistrationTypeSerializer, TournamentPlayerSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer, TournamentRegistrationSerializer
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
    # authentication_classes = [CustomJWTAuthentication]
    # renderer_classes = [JSONRenderer]  # Force the response to be rendered in JSON
    # permission_classes = [IsAuthenticated]  # Only authenticated users can create and list tournaments

    def get(self, request, *args, **kwargs):
        tournaments = self.get_queryset()
        serializer = self.get_serializer(tournaments, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # Attribue automatiquement l'utilisateur actuel comme host du tournoi créé
        data = request.data
        tournament_name = data.get('tournament_name')
        # settings = data.get('settings')
        registration_type = data.get('registration_type')
        registration_period_min = data.get('registration_period_min')
        nbr_of_player_total = data.get('nbr_of_player_total')
        nbr_of_player_match = data.get('nbr_of_player_match')
        host = request.user

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
            registration=registration_type,
            registration_period_min=registration_period_min,
            nbr_of_player_total=nbr_of_player_total,
            nbr_of_player_match=nbr_of_player_match,
            host=host,
            settings=match_setting,
            created_at=timezone.now(),
            # nbr_of_player   will be assigned when user joining the tournament
        )

        tournament.calculate_nbr_of_match()

        # Create TournamentMatch instances
        round = 1
        added_match = nbr_of_player_total // nbr_of_player_match
        if nbr_of_player_total % nbr_of_player_match != 0:
            added_match += 1
        for _ in range(tournament.nbr_of_match):
            added_match -= 1

            tournament_match = TournamentMatch.objects.create(
                tournament_id=tournament.id,
                match_setting_id=match_setting.id,
                round_number=round,
                max_players=nbr_of_player_match,
            )
            tournament.matches.add(tournament_match)

            if added_match == 0:
                round += 1
                winners = added_match
                added_match = winners // nbr_of_player_match
                if winners % nbr_of_player_match != 0:
                    added_match += 1

        serializer = self.get_serializer(tournament)
        return JsonResponse(serializer.data, status=status.HTTP_201_CREATED)

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

class JoinTournament(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        username = request.user.username

        tournament_id = request.data.get('tournament_id')
        tournament = get_object_or_404(Tournament, id=tournament_id)

        if tournament.is_full():
            return JsonResponse({'message': 'Tournament is full'}, status=status.HTTP_400_BAD_REQUEST)

        player, created = Player.objects.get_or_create(username=username) # created wiil return False if the player already exists
        tournament.players.add(player)
        tournament.assign_player_to_match(player)

        serializer = TournamentSerializer(tournament)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)





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
        tournament = get_object_or_404(Tournament, pk=id)
        
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
        tournament = get_object_or_404(Tournament, pk=id)
        participant = get_object_or_404(TournamentPlayer, tournament_id=tournament, player__player_id=participant_id)

        if request.user != tournament.host.username and request.user != participant.player.username:
            return Response({"message": "You do not have permission to deregister this participant."}, status=status.HTTP_403_FORBIDDEN)

        participant.delete()
        return Response({"message": "Participant deregistered successfully."}, status=status.HTTP_204_NO_CONTENT)


# -------------------------------- Tournament Visualization --------------------------------------
class TournamentVisualization(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated, IsHostOrParticipant]

    def get(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)

        # Verify the permissions of the user object
        self.check_object_permissions(request, tournament)

        matches = TournamentMatch.objects.filter(tournament_id=tournament)
        matches_serializer = TournamentMatchSerializer(matches, many=True)
        data = {"matches": matches_serializer.data}
        return Response(data)


# -------------------------------- Tournament Lifecycle --------------------------------------
class TournamentStart(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)

         # Verify if the user is the host of the tournament
        if tournament.host.username != request.user:
            return Response({"message": "Only the tournament host can start the tournament."}, status=403)

        # Update tournament state to start
        tournament.state = "started"
        tournament.save()
        return Response({"status": "Tournament started"})


class TournamentEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)

        # Verify if the user is the host of the tournament
        if tournament.host.username != request.user:
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
        tournament = get_object_or_404(Tournament, pk=id)
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
    permission_classes = [IsAuthenticated]
    
    def put(self, request, id, match_id):
        match = get_object_or_404(TournamentMatch, pk=match_id, tournament_id=id)
        serializer = TournamentMatchSerializer(match, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, match_id):
        match = get_object_or_404(TournamentMatch, pk=match_id, tournament_id=id)
        match.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class TournamentMatchList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 
    serializer_class = TournamentMatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['tournament_id']
        return TournamentMatch.objects.filter(tournament_id=tournament_id)


# ---------------------------- Match Operations -------------------------------
class MatchStart(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    def post(self, request, match_id):
        match = get_object_or_404(TournamentMatch, pk=match_id)
        # Mettre à jour l'état du match pour le démarrer
        return Response({"status": "Match started"})

class MatchEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    def post(self, request, match_id):
        match = get_object_or_404(TournamentMatch, pk=match_id)
        # Enregistrer les résultats du match et mettre à jour son état
        return Response({"status": "Match ended"})


# class MatchSettingList(generics.ListCreateAPIView):
#     queryset = MatchSetting.objects.all()
#     serializer_class = MatchSettingSerializer

#     def perform_create(self, serializer):
#         serializer.save()

class GameTypeList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    queryset = GameType.objects.all()
    serializer_class = GameTypeSerializer

class TournamentTypeList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    queryset = TournamentType.objects.all()
    serializer_class = TournamentTypeSerializer

class RegistrationTypeList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    queryset = TournamentType.objects.all()
    # queryset = RegistrationType.objects.all()
    serializer_class = TournamentTypeSerializer

class TournamentPlayerList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer

class PlayerList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class MatchParticipantsList(ListAPIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 
    
    queryset = MatchParticipants.objects.all()
    serializer_class = MatchParticipantsSerializer

def home(request):
    return render(request, 'home.html')