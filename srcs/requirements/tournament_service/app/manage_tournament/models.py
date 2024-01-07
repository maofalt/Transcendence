from django.db import models


class Tournament(models.Model):
    tournament_id = models.AutoField(primary_key=True)
    tournement_name = models.CharField(max_length=255, unique=True)
    game_type = models.ForeignKey('GameType', on_delete=models.SET_NULL, null=True, to_field='type_id')
    created_at = models.DateTimeField(auto_now_add=True)
    nbr_of_player = models.IntegerField(default=2)
    tournament_type = models.ForeignKey('TournamentType', on_delete=models.SET_NULL, null=True, to_field='type_id')
    registration = models.ForeignKey('RegistrationType', on_delete=models.SET_NULL, null=True, to_field='type_id')
    settings_id = models.ForeignKey('MatchSetting', on_delete=models.SET_NULL, null=True)
    end_date = models.DateField()
    rules = models.TextField()

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
    tournament_id = models.ForeignKey('Tournament', on_delete=models.CASCADE)
    player = models.ForeignKey('Player', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('tournament_id', 'player')

class Player(models.Model):
    player_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255)



CREATE TABLE "tournaments_list" (
#   "tournament_id" integer PRIMARY KEY,
#   "game_type" integer,
#   "tournament_name" varchar(255) UNIQUE NOT NULL,
#   "created_at" timestamp DEFAULT (now()),
#   "nbr_of_player" integer NOT NULL DEFAULT 2,
#   "tournament_type_id" integer,
#   "registration" integer,
#   "setting_id" integer,
  "registration_period_min" integer NOT NULL DEFAULT 15,
  "host_id" integer NOT NULL
);