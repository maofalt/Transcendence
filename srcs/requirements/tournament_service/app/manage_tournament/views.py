from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType, RegistrationType, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer, GameTypeSerializer
from .serializers import TournamentTypeSerializer, RegistrationTypeSerializer, TournamentPlayerSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer, TournamentRegistrationSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from .authentication import CustomJWTAuthentication
from .permissions import  IsOwnerOrReadOnly, IsHostOrParticipant
from rest_framework.decorators import api_view
from django.contrib.auth.models import User

# ------------------------ Tournament -----------------------------------
class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]
    renderer_classes = [JSONRenderer]  # Force the response to be rendered in JSON
    permission_classes = [IsAuthenticated]  # Only authenticated users can create and list tournaments

    def perform_create(self, serializer):
        # Attribue automatiquement l'utilisateur actuel comme host du tournoi créé
        serializer.save(host=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TournamentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]  # Custom permission class for owner-only access

class TournamentRegistrationCreate(generics.CreateAPIView):
    queryset = TournamentRegistration.objects.all()
    serializer_class = TournamentRegistrationSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]  # Only authenticated users can register

    def post(self, request, *args, **kwargs):
        tournament_id = kwargs.get('id')
        tournament = get_object_or_404(Tournament, pk=id)
        player_id = request.data.get('player_id')
        player = get_object_or_404(Player, pk=player_id)

        if TournamentPlayer.objects.filter(tournament_id=tournament, player=player).exists():
            return Response({"message": "Player already registered."}, status=status.HTTP_400_BAD_REQUEST)

        tournament_player = TournamentPlayer.objects.create(tournament_id=tournament, player=player)
        # Serialize and return the new TournamentPlayer
        serializer = self.get_serializer(tournament_player)
        try:
            return super().post(request, *args, **kwargs)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"message": "Player registered successfully."}, serializer.data, status=status.HTTP_201_CREATED)


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
        # Update tournament state to start
        return Response({"status": "Tournament started"})

class TournamentEnd(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)
        # Update tournament state to end
        return Response({"status": "Tournament ended"})


# -------------------------------- Tournament Matches Progression ------------------------------------
class TournamentMatchList(APIView):
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAuthenticated] 
    def get(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)
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