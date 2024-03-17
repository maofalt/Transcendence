from rest_framework import serializers
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType
from .models import RegistrationType, TournamentPlayer, Player, MatchParticipants

class MatchSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchSetting
        fields = fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    settings = MatchSettingSerializer()
    is_full = serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['tournament_name', 'nbr_of_player_total', 'nbr_of_player_match', 'game_type', 'tournament_type', 'registration', 'settings', 'registration_period_min', 'host_id', 'is_full' ]

    def create(self, validated_data):
        setting_data = validated_data.pop('settings')  # Extract data from MatchSetting
        settings = MatchSetting.objects.create(**setting_data)  # Create a new MatchSetting object
        tournament = Tournament.objects.create(settings=settings, **validated_data)  # Create a new Tournament object
        return tournament

    def update(self, instance, validated_data):
        setting_data = validated_data.pop('settings')
        settings = instance.settings

        instance.tournament_name = validated_data.get('tournament_name', instance.tournament_name)
        instance.nbr_of_player_total = validated_data.get('nbr_of_player_total', instance.nbr_of_player_total)
        instance.nbr_of_player_match = validated_data.get('nbr_of_player_match', instance.nbr_of_player_match)
        instance.game_type = validated_data.get('game_type', instance.game_type)
        instance.tournament_type = validated_data.get('tournament_type', instance.tournament_type)
        instance.registration = validated_data.get('registration', instance.registration)
        instance.registration_period_min = validated_data.get('registration_period_min', instance.registration_period_min)
        instance.host_id = validated_data.get('host_id', instance.host_id)
        instance.save()

        # `MatchSetting` is a one-to-one relationship with `Tournament`
        for field, value in setting_data.items():
            setattr(settings, field, value)
        settings.save()

        return instance

    def get_is_full(self, obj):
        # Serialize the result of the `is_full` method
        return obj.is_full()

class TournamentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = ['tournament_id', 'player'] # Fields to be serialized

    def create(self, validated_data):
        # Create a new TournamentPlayer object
        tournament_player = TournamentPlayer.objects.create(**validated_data)
        return tournament_player


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
