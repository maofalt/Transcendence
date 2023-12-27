from django.urls import path, include
from .views import TournamentHistoryAPIView, GameStatsAPIView
from .views import get_current_user_info, tournament_detail



app_name = "gameHistory_microservice"

urlpatterns = [
    path('get-current-user-info/', get_current_user_info, name='get-current-user-info'),
    path('api/tournament-history/', TournamentHistoryAPIView.as_view(), name='tournament-history-api'),
    path('tournament/<str:tournament_id>/', tournament_detail, name='tournament_detail'),
    path('api/game-stats/<str:username>/', GameStatsAPIView.as_view(), name='game_stats-api'),
]

