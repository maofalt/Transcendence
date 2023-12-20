from django.urls import path, include
from .views import TournamentHistoryAPIView, GameStatsAPIView

app_name = "gameHistory_microservice"

urlpatterns = [
    path('api/tournament-history/', TournamentHistoryAPIView.as_view(), name='tournament-history-api'),
    path('api/game-stats/<int:user_id>/', GameStatsAPIView.as_view(), name='game-stats-api'),
]

