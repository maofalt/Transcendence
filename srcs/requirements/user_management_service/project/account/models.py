from django.db import models

# Create your models here.

from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    intra_id = models.CharField(max_length=15, blank=True, null=True)
    playername = models.CharField(max_length=15, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='default_avatar.jpeg')
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    # first_name = None
    # last_name = None
    def add_friend(self, friend):
        self.friends.add(friend)

    def remove_friend(self, friend):
        self.friends.remove(friend)

class TournamentHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tournament_name = models.CharField(max_length=255)
    result = models.CharField(max_length=50)
    date_played = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.tournament_name} - {self.result}"

class GameStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_games_played = models.IntegerField(default=0)
    games_won = models.IntegerField(default=0)
    games_lost = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - Total Games: {self.total_games_played}, Wins: {self.games_won}, Losses: {self.games_lost}"