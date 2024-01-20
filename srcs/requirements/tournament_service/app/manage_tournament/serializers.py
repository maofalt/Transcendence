from rest_framework import serializers
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType
from .models import RegistrationType, TournamentPlayer, Player, MatchParticipants


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['tournament_name', 'nbr_of_player', 'game_type', 'tournament_type', 'registration', 'setting_id', 'registration_period_min', 'host_id' ]

class GameTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameType
        fields = ['type_id', 'type_name']

class TournamentMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentMatch
        fields = ['match_id', 'tournament_id', 'round_number', 'match_time', 'match_result']


class MatchSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchSetting
        fields = fields = '__all__'

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
