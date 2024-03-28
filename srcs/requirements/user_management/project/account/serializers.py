from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class AnonymousUserSerializer(serializers.Serializer):
    class Meta:
        fields = []

class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'playername', 'avatar', 'is_online']

class ProfileUSerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'playername', 'avatar', 'email', 'phone', 'two_factor_method']