from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType, RegistrationType, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer, GameTypeSerializer
from .serializers import TournamentTypeSerializer, RegistrationTypeSerializer, TournamentPlayerSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer

# ------------------------ Tournament -----------------------------------
class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    renderer_classes = [JSONRenderer]  # Force the response to be rendered in JSON

    # permission_classes = [permissions.IsAuthenticated] #add more permissions if is necessary
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If the data is not valid, return a 400 response with the error details
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "NO tournament was found."}, status=status.HTTP_204_NO_CONTENT)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TournamentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer


# --------------------------- Tournament Participants -----------------------------------    
class TournamentParticipantList(APIView):
    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)
        player_id = request.data.get('player_id')
        player = get_object_or_404(Player, pk=player_id)

        # check if player is already registered
        if TournamentPlayer.objects.filter(tournament_id=tournament, player=player).exists():
            return Response({"message": "Player already registered."}, status=status.HTTP_400_BAD_REQUEST)

        tournament_player = TournamentPlayer.objects.create(tournament_id=tournament, player=player)
        return Response({"message": "Player registered successfully."}, status=status.HTTP_201_CREATED)


class TournamentParticipantDetail(APIView):
    def delete(self, request, id, participant_id):
        tournament = get_object_or_404(Tournament, pk=id)
        participant = get_object_or_404(TournamentPlayer, tournament_id=tournament, player__player_id=participant_id)
        participant.delete()
        return Response({"message": "Participant deregistered successfully."}, status=status.HTTP_204_NO_CONTENT)


# -------------------------------- Tournament Visualization --------------------------------------
class TournamentVisualization(APIView):
    def get(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)
        matches = TournamentMatch.objects.filter(tournament_id=tournament)
        # Construisez ici la structure de données pour le bracket du tournoi
        data = {"matches": matches}
        return Response(data)


# -------------------------------- Tournament Lifecycle --------------------------------------
class TournamentStart(APIView):
    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)
        # Update tournament state to start
        return Response({"status": "Tournament started"})

class TournamentEnd(APIView):
    def post(self, request, id):
        tournament = get_object_or_404(Tournament, pk=id)
        # Update tournament state to end
        return Response({"status": "Tournament ended"})


# -------------------------------- Tournament Matches Progression ------------------------------------
class TournamentMatchList(APIView):
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
    serializer_class = TournamentMatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['tournament_id']
        return TournamentMatch.objects.filter(tournament_id=tournament_id)

# ---------------------------- Match Operations -------------------------------
class MatchStart(APIView):
    def post(self, request, match_id):
        match = get_object_or_404(TournamentMatch, pk=match_id)
        # Mettre à jour l'état du match pour le démarrer
        return Response({"status": "Match started"})

class MatchEnd(APIView):
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
    queryset = GameType.objects.all()
    serializer_class = GameTypeSerializer

class TournamentTypeList(ListAPIView):
    queryset = TournamentType.objects.all()
    serializer_class = TournamentTypeSerializer

class RegistrationTypeList(ListAPIView):
    queryset = TournamentType.objects.all()
    serializer_class = TournamentTypeSerializer

class TournamentPlayerList(ListAPIView):
    queryset = TournamentPlayer.objects.all()
    serializer_class = TournamentPlayerSerializer

class PlayerList(ListAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

class MatchParticipantsList(ListAPIView):
    queryset = MatchParticipants.objects.all()
    serializer_class = MatchParticipantsSerializer

def home(request):
    return render(request, 'home.html')