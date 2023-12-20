from django.db import models
from django.contrib.auth.models import AbstractUser
from gameHistory_microservice.models import GameStats

class User(AbstractUser):
    intra_id = models.CharField(max_length=15, blank=True, null=True)
    playername = models.CharField(max_length=15, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='default_avatar.jpeg')
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    def add_friend(self, friend):
        self.friends.add(friend)

    def remove_friend(self, friend):
        self.friends.remove(friend)
    game_stats = models.OneToOneField('gameHistory_microservice.GameStats', on_delete=models.CASCADE, null=True, blank=True, related_name='user_game_stats')
    def save(self, *args, **kwargs):
        if self.game_stats is None:
            game_stats = GameStats.objects.create(
                user=self,
                total_games_played=0,
                games_won=0,
                games_lost=0
            )
            self.game_stats = game_stats
        super().save(*args, **kwargs)
