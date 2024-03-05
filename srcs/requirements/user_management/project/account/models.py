import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from gameHistory_microservice.models import GameStats

class User(AbstractUser):
    token = models.CharField(max_length=255, blank=True, null=True)
    playername = models.CharField(max_length=30, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='default_avatar.jpeg')
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    game_stats = models.OneToOneField('gameHistory_microservice.GameStats', on_delete=models.CASCADE, null=True, blank=True, related_name='user_game_stats')
    phone = models.CharField(max_length=10, blank=True, null=True)
    # reset_token = models.CharField(max_length=100, blank=True, null=True)

    def add_friend(self, friend):
        self.friends.add(friend)

    def remove_friend(self, friend):
        self.friends.remove(friend)

    # def save(self, *args, **kwargs):
    #     creating_superuser = os.environ.get('creating_superuser', False)

    #     if self.game_stats is None and not creating_superuser:
    #         game_stats = GameStats.objects.create(
    #             user=self,
    #             total_games_played=0,
    #             games_won=0,
    #             games_lost=0
    #         )
    #         self.game_stats = game_stats

    #     try:
    #         super().save(*args, **kwargs)
    #     except IntegrityError:
    #         # Handle the case where IntegrityError occurs (e.g., user already exists)
    #         # You might want to redirect to a different page or display an error message
    #         pass