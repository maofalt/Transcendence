import logging
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from django.views import View
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import TournamentHistory, GameStats
from .serializers import TournamentHistorySerializer, GameStatsSerializer
from django.contrib.auth import get_user_model
from account.models import User



def tournament_detail(request, tournament_id):
    # Get the TournamentHistory instance for the specified tournament_id
    tournament = TournamentHistory.objects.get(tournament_id=tournament_id)

    # Get all rounds for the specified tournament
    rounds_for_tournament = tournament.tournamentround_set.all()

    # Render the template with the tournament and its rounds
    return render(request, 'tournament_detail.html', {'tournament': tournament, 'rounds': rounds_for_tournament})

# Create your views here.
class TournamentHistoryAPIView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = TournamentHistory.objects.all()
        serializer = TournamentHistorySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = TournamentHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



logger = logging.getLogger(__name__)


def get_current_user_info(request):
    # Assume you have a way to get the currently logged-in user
    # Adjust this part based on your authentication mechanism
    user = request.user
    print("\n\nCURRENT with USER: ", user.username)
    # Assuming your user model has a 'username' field
    if user.is_authenticated:
        return JsonResponse({'username': user.username})
    else:
        return JsonResponse({'username': None})

class GameStatsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        user = request.user

        print("RECEIVED GET REQUEST with USER: ", user.username)
        username = user.username
        
        return render(request, 'gameStatTest.html', {'username': username})

    def post(self, request, *args, **kwargs):

        username = request.user.username

        print("\n\nRECEIVED POST REQUEST with USER: ", username, "\n\n")
        total_games_played = int(request.POST.get("total_games_played", 0))
        games_won = int(request.POST.get("games_won", 0))
        games_lost = int(request.POST.get("games_lost", 0))

        print("\nDATA CHECK: ", total_games_played, games_won, games_lost, "\n\n")

        # game_stats = get_object_or_404(GameStats, user__username=username)
        game_stats = GameStats.objects.filter(user=request.user).first()

        # Update the GameStats object with the received data
        if game_stats is not None:
            game_stats.total_games_played = total_games_played
            game_stats.games_won = games_won
            game_stats.games_lost = games_lost
            game_stats.save()
        else:
            return JsonResponse({'message': 'Game stats updated failed'}, status=status.HTTP_404_NOT_FOUND)


        return JsonResponse({'message': 'Game stats updated successfully'}, status=status.HTTP_200_OK)