from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static


app_name = "tournament"

urlpatterns = [  
# Tournament Creation and Management:
    #   - POST /tournaments/create_and_list/ - Create a new tournament with the necessary settings and rules.
    #   - GET /tournements/create_and_list/ - show the list of tournaments
    path('create-and-list/', views.TournamentListCreate.as_view(), name='tournament-list-create'),
    #   - GET /tournaments/manage/{id}/ - Retrieve the details of a specific tournament.
    #   - PUT /tournaments/manage/{id}/ - Update the settings or rules of a specific tournament.
    #   - DELETE /tournaments/manage/{id}/ - Remove a tournament from the system.  
    path('manage/<int:pk>/', views.TournamentRetrieveUpdateDestroy.as_view(), name='tournament-retrieve-update-destroy'),
    path('<int:tournament_id>/matches/', views.TournamentMatchList.as_view(), name='tournament-match-list'),
    path('<int:tournament_id>/match-settings/', views.MatchSettingList.as_view(), name='match-setting-list'),
    path('<int:tournament_id>/game-types/', views.GameTypeList.as_view(), name='game-type-list'),
    path('<int:tournament_id>/tournament-types/', views.TournamentTypeList.as_view(), name='tournament-type-list'),
    path('<int:tournament_id>/registration-types/', views.RegistrationTypeList.as_view(), name='resgistration-type-list'),
    path('<int:tournament_id>/tournament-players/', views.TournamentPlayerList.as_view(), name='tournament-player-list'),
    path('<int:tournament_id>/tournament-players/player/', views.TournamentPlayerList.as_view(), name='player-list'),
    path('<int:tournament_id>/matches/participants/', views.MatchParticipantsList.as_view(), name='matches-participants-list'),

]
## Tournament Participation:
#    #   - POST /tournaments/{id}/participants - Register a participant for a tournament.
#    path('/<int:pk>/participants/', TournamentParticipantCreate.as_view(), name='tournament-participant-create'),
#
#    #   - DELETE /tournaments/{id}/participants/{participantId} - Deregister a participant from a tournament.
#    path('/<int:pk>/participants/<int:participant_id>/', TournamentParticipantDelete.as_view(), name='tournament-participant-delete'),
#]