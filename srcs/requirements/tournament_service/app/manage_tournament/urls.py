from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static


app_name = "tournament"

urlpatterns = [  
# Tournament Creation and Management:
    #   - POST /create_and_list/ - Create a new tournament with the necessary settings and rules.
    #   - GET /create_and_list/ - show the list of tournament
    path('create-and-list/', views.TournamentListCreate.as_view(), name='tournament-list-create'),
    #   - GET /manage/{id}/ - Retrieve the details of a specific tournament.
    #   - PUT /manage/{id}/ - Update the settings or rules of a specific tournament.
    #   - DELETE /manage/{id}/ - Remove a tournament from the system.
    path('manage/<int:pk>/', views.TournamentRetrieveUpdateDestroy.as_view(), name='tournament-retrieve-update-destroy'),

# JoinTournament:
    #   - POST /add_player/{tournament_id}/{player_id}/ - Add a player to a specific tournament.
    path('add-player/<int:tournament_id>/<int:player_id>/', views.JoinTournament.as_view(), name='add-player'),

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
    path('<int:tournament_id>/match-generator/', views.MatchGenerator.as_view(), name='mathch-generator'),
    path('<int:id>/matches/', views.TournamentMatchList.as_view(), name='tournament-matches'),
    # DELETE /tournament/{id}/matches/{matchId} - Cancel a scheduled match.
    path('<int:id>/matches/<int:match_id>/', views.TournamentMatchDetail.as_view(), name='tournament-match-detail'),
    
# Tournament Visualization:
    # GET /{id}/visualization/ - Get a visual representation or bracket of the tournament's progression.
    path('<int:id>/visualization/', views.TournamentVisualization.as_view(), name='tournament-visualization'),

# Tournament Lifecycle:
    # POST /{id}/start/ - Start the tournament, transitioning its state from setup to active.
    path('<int:id>/start/', views.TournamentStart.as_view(), name='tournament-start'),
    # POST /tournament/{id}/end - End the tournament, finalizing its state and possibly triggering the calculation of rankings.
    path('<int:id>/end/', views.TournamentEnd.as_view(), name='tournament-end'),

# Match Operations:
    # POST /matchess/{id}/start/ - Start the tournament, transitioning its state from setup to active.
    path('matches/<int:match_id>/start/', views.MatchStart.as_view(), name='match-start'),
    # POST /tournament/{id}/end - End the tournament, finalizing its state and possibly triggering the calculation of rankings.
    path('matches/<int:match_id>/end/', views.MatchEnd.as_view(), name='match-end'),
    # PUT /tournament/{match_id}/{winner_id}/matches/ - Update the status or result of a match.
    path('matches/<int:match_id>/<int:winner_id>/', views.MatchResult.as_view(), name='match-result'),
    # PUT /tournament/{match_id}/{player_id}/{participant_score}/matches/ - Update the status or result of a match.
    # path('matches/<int:match_id>/<int:player_id>/<int:score>/', views.MatchResult.as_view(), name='match-result'),
    
    path('matches/<int:tournament_id>/<int:round>/update/', views.MatchUpdate.as_view(), name='match-update'),


# RoundStateCheck:
    # GET /tournament/{tournament_id}/round/ - Check Tournament Status
    path('<int:tournament_id>/round/', views.TournamentRoundState.as_view(), name='round'),

# All tournament types
    # Get aLL TOURNAMENT types
    # path('tournament-types/', views.TournamentTypeList.as_view(), name='tournament-type-list'),

# All registration types
    # Get aLL registration types
    # path('registration-types/', views.RegistrationTypeList.as_view(), name='resgistration-type-list'),
    
    path('<int:tournament_id>/matches/', views.TournamentMatchList.as_view(), name='tournament-match-list'),
    # path('<int:tournament_id>/match-settings/', views.MatchSettingList.as_view(), name='match-setting-list'),
    # path('<int:tournament_id>/game-types/', views.GameTypeList.as_view(), name='game-type-list'),
    # path('<int:tournament_id>/tournament-types/', views.TournamentTypeList.as_view(), name='tournament-type-list'),
    # path('<int:tournament_id>/registration-types/', views.RegistrationTypeList.as_view(), name='resgistration-type-list'),
    path('<int:tournament_id>/tournament-players/', views.TournamentPlayerList.as_view(), name='tournament-player-list'),
    path('<int:tournament_id>/tournament-players/player/', views.PlayerList.as_view(), name='player-list'),
    path('<int:tournament_id>/matches/participants/', views.MatchParticipantsList.as_view(), name='matches-participants-list'),
    path('stats/<int:user_id>', views.PlayerStatsView.as_view(), name='player-stat'),

]

# 1. Create Tourenament with Host player.
# 2. Join the tournament with non-player user.
# 3. Generate matches for tournament id with Host.
# 4. Set Tournament State as started.
# 5. Set Matches State as started(playing).
# 6. When each match finished, set the Match State as ended.
# 7. Send match result to back-end for each player with score.
# 8. Update matches to the next round. (extract winner from previous round and set on next round)
# 9. when tournament finished, set Tournament State as ended.
#    > GET /tournament/{tournament_id}/round/ - Return Tournament Status, if all round finished, it returns 'is_tournamentFinish': True
#      when a round finised, it returns 'round': last_match.round_number
#      when still a round is playing, returns 'round': None

