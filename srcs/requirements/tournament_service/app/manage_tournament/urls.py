from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static


app_name = "tournament"

urlpatterns = [  
# Tournament Creation and Management:
    #   - POST /create_and_list/ - Create a new tournament with the necessary settings and rules.
    #   - GET /create_and_list/ - show the list of tournaments
    path('create-and-list/', views.TournamentListCreate.as_view(), name='tournament-list-create'),
    #   - GET /manage/{id}/ - Retrieve the details of a specific tournament.
    #   - PUT /manage/{id}/ - Update the settings or rules of a specific tournament.
    #   - DELETE /manage/{id}/ - Remove a tournament from the system.
    path('manage/<int:pk>/', views.TournamentRetrieveUpdateDestroy.as_view(), name='tournament-retrieve-update-destroy'),

# JoinTournament:
    #   - POST /add_player/{id}/ - Add a player to a specific tournament.
    path('add-player/<int:id>/', views.JoinTournament.as_view(), name='add-player'),

# Tournament Participation:
    # GET /{id}/participants/ - Show the participants list for a tournament.
    path('<int:id>/participants/', views.TournamentParticipantList.as_view(), name='tournament-participants'),
    # DELETE /{id}/participants/{participantId}/ - Deregister a participant from a tournament.
    path('<int:id>/participants/<int:participant_id>/', views.TournamentParticipantDetail.as_view(), name='tournament-participant-detail'),
    # POST /{id}/register/ - Register for a tournament.
    # path('<int:id>/register/', TournamentRegistrationCreate.as_view(), name='tournament-registration'),

# Tournament Progression:
    # GET /{id}/matches - Retrieve a list of matches for a tournament.
    # POST /{id}/matches - Create a new match within a tournament.
    path('mathch_generator/', views.MatchGenerator.as_view(), name='mathch_generator'),
    # path('<int:id>/matches/', views.TournamentMatchList.as_view(), name='tournament-matches'),
    # PUT /tournaments/{id}/matches/{matchId} - Update the status or result of a match.
    # DELETE /tournaments/{id}/matches/{matchId} - Cancel a scheduled match.
    path('<int:id>/matches/<int:match_id>/', views.TournamentMatchDetail.as_view(), name='tournament-match-detail'),
    
# Tournament Visualization:
    # GET /{id}/visualization/ - Get a visual representation or bracket of the tournament's progression.
    path('<int:id>/visualization/', views.TournamentVisualization.as_view(), name='tournament-visualization'),

# Tournament Lifecycle:
    # POST /{id}/start/ - Start the tournament, transitioning its state from setup to active.
    path('<int:id>/start/', views.TournamentStart.as_view(), name='tournament-start'),
    # POST /tournaments/{id}/end - End the tournament, finalizing its state and possibly triggering the calculation of rankings.
    path('<int:id>/end/', views.TournamentEnd.as_view(), name='tournament-end'),

# Match Operations:
    # POST /matchess/{id}/start/ - Start the tournament, transitioning its state from setup to active.
    path('matches/<int:match_id>/start/', views.MatchStart.as_view(), name='match-start'),
    # POST /tournaments/{id}/end - End the tournament, finalizing its state and possibly triggering the calculation of rankings.
    path('matches/<int:match_id>/end/', views.MatchEnd.as_view(), name='match-end'),

# All tournament types
    # Get aLL TOURNAMENT types
    # path('tournament-types/', views.TournamentTypeList.as_view(), name='tournament-type-list'),
    
# All registration types
    # Get aLL registration types
    # path('registration-types/', views.RegistrationTypeList.as_view(), name='resgistration-type-list'),
    
    # path('<int:tournament_id>/matches/', views.TournamentMatchList.as_view(), name='tournament-match-list'),
    # path('<int:tournament_id>/match-settings/', views.MatchSettingList.as_view(), name='match-setting-list'),
    # path('<int:tournament_id>/game-types/', views.GameTypeList.as_view(), name='game-type-list'),
    # path('<int:tournament_id>/tournament-types/', views.TournamentTypeList.as_view(), name='tournament-type-list'),
    # path('<int:tournament_id>/registration-types/', views.RegistrationTypeList.as_view(), name='resgistration-type-list'),
    path('<int:tournament_id>/tournament-players/', views.TournamentPlayerList.as_view(), name='tournament-player-list'),
    path('<int:tournament_id>/tournament-players/player/', views.TournamentPlayerList.as_view(), name='player-list'),
    path('<int:tournament_id>/matches/participants/', views.MatchParticipantsList.as_view(), name='matches-participants-list'),

]