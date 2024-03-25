import os
from django.db import models
from django.contrib.auth.models import AbstractUser
# from gameHistory_microservice.models import GameStats

class User(AbstractUser):
    token = models.CharField(max_length=255, blank=True, null=True)
    playername = models.CharField(max_length=30, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='default_avatar.jpeg')
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    last_valid_time = models.DateTimeField(null=True, blank=True)
    TWO_FACTOR_METHODS = [
        ('sms', 'SMS'),
        ('email', 'Email'),
    ]
    
    TWO_FACTOR_OPTIONS = [
        (None, 'Off'),
        *TWO_FACTOR_METHODS
    ]
    
    two_factor_method = models.CharField(max_length=10, choices=TWO_FACTOR_OPTIONS, default=None, null=True, blank=True)

    def add_friend(self, friend):
        self.friends.add(friend)

    def remove_friend(self, friend):
        self.friends.remove(friend)

