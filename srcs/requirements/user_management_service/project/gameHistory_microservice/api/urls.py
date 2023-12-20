
from django.urls import path
from .views import TournamentHistoryAPIView, GameStatsAPIView

urlpatterns = [
    path('tournament-history/', TournamentHistoryAPIView.as_view(), name='tournament-history-api'),
    path('game-stats/', GameStatsAPIView.as_view(), name='game-stats-api'),
]