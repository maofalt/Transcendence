from django.urls import path, include
from .views import TournamentHistoryAPIView, GameStatsAPIView
from .views import get_current_user_info


app_name = "gameHistory_microservice"

urlpatterns = [
    path('get-current-user-info/', get_current_user_info, name='get-current-user-info'),
    path('api/tournament-history/', TournamentHistoryAPIView.as_view(), name='tournament-history-api'),
    path('api/game-stats/<str:username>/', GameStatsAPIView.as_view(), name='game-stats-api'),
]

