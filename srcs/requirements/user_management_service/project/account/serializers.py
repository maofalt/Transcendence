from rest_framework import serializers
from .models import User, TournamentHistory, GameStats


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class TournamentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentHistory
        fields = '__all__'

class GameStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameStats
        fields = '__all__'