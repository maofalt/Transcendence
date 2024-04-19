import os
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    playername = models.CharField(max_length=250, blank=True, null=True)
    email = models.CharField(max_length=250, blank=True, null=True)
    is_online = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='default_avatar.jpeg')
    friends = models.ManyToManyField('self', symmetrical=False, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    last_valid_time = models.DateTimeField(default=timezone.now)
    TWO_FACTOR_METHODS = [
        ('sms', 'SMS'),
        ('email', 'Email'),
    ]
    
    TWO_FACTOR_OPTIONS = [
        ('off', 'Off'),
        *TWO_FACTOR_METHODS
    ]
    
    two_factor_method = models.CharField(max_length=10, choices=TWO_FACTOR_OPTIONS, default='off', null=True, blank=True)

    def add_friend(self, friend):
        try:
            if friend in self   .friends.all():
                return False, 'Friend already added'
            if friend == self:
                return False, 'You cannot add yourself as a friend'
            self.friends.add(friend)
            return True, 'Friend added successfully'
        except Exception as e:
            return False, str(e)
        # self.friends.add(friend)

    def remove_friend(self, friend):
        self.friends.remove(friend)

    def __str__(self):
        return f"Username: {self.username}, Playername: {self.playername}, Email: {self.email}"