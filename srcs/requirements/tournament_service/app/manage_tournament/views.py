from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType, RegistrationType, TournamentPlayer, Player, MatchParticipants
from .serializers import TournamentSerializer, TournamentMatchSerializer, MatchSettingSerializer, GameTypeSerializer
from .serializers import TournamentTypeSerializer, RegistrationTypeSerializer, TournamentPlayerSerializer
from .serializers import PlayerSerializer, MatchParticipantsSerializer

class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    # permission_classes = [permissions.IsAuthenticated] #add more permissions if is necessary
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "Any tournament was found."}, status=status.HTTP_204_NO_CONTENT)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TournamentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    #permission_classes = [IsTournamentOrganizer] #add more permissions if is necessary

class TournamentMatchList(ListAPIView):
    serializer_class = TournamentMatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs['tournament_id']
        return TournamentMatch.objects.filter(tournament_id=tournament_id)

class MatchSettingList(generics.ListCreateAPIView):
    queryset = MatchSetting.objects.all()
    serializer_class = MatchSettingSerializer

    def perform_create(self, serializer):
        serializer.save()

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

# -------------------------- Participants -------------------------------

#class TournamentParticipantCreate(APIView):
#    def post(self, request, pk):
#        try:
#            tournament = Tournament.objects.get(pk=pk)
#        except Tournament.DoesNotExist:
#            return Response(status=status.HTTP_404_NOT_FOUND)
#
#        serializer = ParticipantSerializer(data=request.data)
#        if serializer.is_valid():
#            serializer.save(tournament=tournament)
#            return Response(serializer.data, status=status.HTTP_201_CREATED)
#            
#class TournamentParticipantDelete(APIView):
#    def delete(self, request, pk, participant_id):
#        try:
#            participant = Participant.objects.get(pk=participant_id, tournament__pk=pk)
#        except Participant.DoesNotExist:
#            return Response(status=status.HTTP_404_NOT_FOUND)
#
#        participant.delete()
#        return Response(status=status.HTTP_204_NO_CONTENT)
#    
#
## Create your views here.

def home(request):
    return render(request, 'home.html')