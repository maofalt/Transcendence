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
