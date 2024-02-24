from rest_framework import serializers
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType
from .models import RegistrationType, TournamentPlayer, Player, MatchParticipants

class MatchSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchSetting
        fields = fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    setting = MatchSettingSerializer()
    class Meta:
        model = Tournament
        fields = ['tournament_name', 'nbr_of_player', 'game_type', 'tournament_type', 'registration', 'setting', 'registration_period_min', 'host_id' ]

    def create(self, validated_data):
        setting_data = validated_data.pop('setting')  # Extrait les données de setting
        setting = MatchSetting.objects.create(**setting_data)  # Crée un nouvel objet MatchSetting
        tournament = Tournament.objects.create(setting=setting, **validated_data)  # Crée un nouvel objet Tournament avec le MatchSetting créé
        return tournament

class GameTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameType
        fields = ['type_id', 'type_name']

class TournamentMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentMatch
        fields = ['match_id', 'tournament_id', 'round_number', 'match_time', 'match_result']


class TournamentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentType
        fields = ['type_id', 'type_name']

class RegistrationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationType
        fields = ['type_id', 'type_name']

class TournamentPlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = ['tournament_id', 'player']

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['player_id', 'username']

class MatchParticipantsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchParticipants
        fields = ['match_id', 'player_id', 'is_winner', 'participant_score']
