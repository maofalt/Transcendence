from django.db import models
import logging


# Create your models here.
# from account.models import User

# class TournamentHistory(models.Model):
#     user = models.ForeignKey(account.User, on_delete=models.CASCADE)
#     tournament_name = models.CharField(max_length=255)
#     result = models.CharField(max_length=50)
#     date_played = models.DateField()

#     def __str__(self):
#         return f"{self.user.username} - {self.tournament_name} - {self.result}"

# class GameStats(models.Model):
#     user = models.OneToOneField(account.User, on_delete=models.CASCADE)
#     total_games_played = models.IntegerField(default=0)
#     games_won = models.IntegerField(default=0)
#     games_lost = models.IntegerField(default=0)

#     def __str__(self):
#         return f"{self.user.username} - Total Games: {self.total_games_played}, Wins: {self.games_won}, Losses: {self.games_lost}"

class TournamentHistory(models.Model):
    user = models.ForeignKey('account.User', on_delete=models.CASCADE)
    tournament_name = models.CharField(max_length=255)
    result = models.CharField(max_length=50)
    date_played = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.tournament_name} - {self.result}"

class GameStats(models.Model):
    user = models.OneToOneField('account.User', on_delete=models.CASCADE)
    total_games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)


    def __str__(self):
        print("Entering GameStats __str__ method------------------------------------\n")
        return f"User: {self.user.username} - Total Games: {self.total_games_played}, Wins: {self.games_won}, Losses: {self.games_lost}"