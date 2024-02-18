from django.db import models

class Tournament(models.Model):
    tournament_id = models.AutoField(primary_key=True)
    tournament_name = models.CharField(max_length=255, unique=True)
    game_type = models.ForeignKey('GameType', on_delete=models.PROTECT, null=False, to_field='type_id', default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    nbr_of_player = models.IntegerField(default=2)
    tournament_type = models.ForeignKey('TournamentType', on_delete=models.PROTECT, null=False, to_field='type_id', default=1)
    registration = models.ForeignKey('RegistrationType', on_delete=models.PROTECT, null=False, to_field='type_id', default=1)
    setting = models.ForeignKey('MatchSetting', on_delete=models.PROTECT, null=False, to_field='setting_id', default=0)
    registration_period_min = models.IntegerField(default=15)
    host_id = models.IntegerField()

class TournamentMatch(models.Model):
    match_id = models.AutoField(primary_key=True)
    tournament_id = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='match' )
    round_number = models.IntegerField()
    match_time = models.DateTimeField(null=True) 
    match_result = models.CharField(max_length=255)

class MatchSetting(models.Model):
    setting_id = models.AutoField(primary_key=True)
    duration_sec = models.IntegerField(default=210)
    max_score = models.IntegerField(default=5)
    nbr_of_sets = models.IntegerField(default=1)
    paddle_speed = models.IntegerField(default=10)
    ball_speed = models.IntegerField(default=10)
    nbr_of_players = models.IntegerField(default=2)

class GameType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=255)

class TournamentType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=255)

class RegistrationType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=255)

class TournamentPlayer(models.Model):
    tournament_id = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='tournament')
    player = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='player')

    class Meta:
        unique_together = ('tournament_id', 'player')

class Player(models.Model):
    player_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255)

    class Meta:
        unique_together = ('player_id', 'username')

class MatchParticipants(models.Model):
    match_id = models.ForeignKey('TournamentMatch', on_delete=models.CASCADE, related_name='participants')
    player_id = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='playeridfrommatch')
    is_winner = models.BooleanField(default=False)
    participant_score = models.IntegerField(default=0)
