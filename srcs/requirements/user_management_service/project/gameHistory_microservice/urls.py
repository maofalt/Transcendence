from django.urls import path, include
from .views import TournamentHistoryAPIView, GameStatsAPIView
from .views import GameStatTestView


app_name = "gameHistory_microservice"

urlpatterns = [
    path('api/tournament-history/', TournamentHistoryAPIView.as_view(), name='tournament-history-api'),
    path('api/game-stats/<int:id>/', GameStatsAPIView.as_view(), name='game-stats-api'),
    path('game-stat-test/', GameStatTestView.as_view(), name='game-stat-test'),
]

