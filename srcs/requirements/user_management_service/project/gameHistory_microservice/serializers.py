from rest_framework import serializers
from django.contrib.auth import get_user_model

class TournamentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = 'gameHistory_microservice.TournamentHistory'
        fields = '__all__'

class GameStatsSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.all())

    class Meta:
        model = 'gameHistory_microservice.GameStats' 
        fields = '__all__'