from django.db import models
import logging


class TournamentHistory(models.Model):
    tournament_id = models.CharField(max_length=100, unique=True, default=1)
    winner = models.CharField(max_length=15, blank=True, null=True)
    number_of_players = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Tournament {self.tournament_id} - Winner: {self.winner.username}"

class TournamentRound(models.Model):
    tournament = models.ForeignKey(TournamentHistory, on_delete=models.CASCADE)
    round_id = models.PositiveIntegerField()
    player1 = models.CharField(max_length=15, blank=True, null=True)
    player2 = models.CharField(max_length=15, blank=True, null=True)
    date_played = models.DateField()
    winner = models.ForeignKey('account.User', related_name='round_winner', on_delete=models.CASCADE)

    def __str__(self):
        return f"Tournament {self.tournament.tournament_id} - Round {self.round_id}"

class GameStats(models.Model):
    user = models.OneToOneField('account.User', on_delete=models.CASCADE)
    username = models.CharField(max_length=15, blank=True, null=True)
    total_games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)


    def __str__(self):
        print("Entering GameStats __str__ method------------------------------------\n")
        return f"User: {self.user.username} - Total Games: {self.total_games_played}, Wins: {self.games_won}, Losses: {self.games_lost}"