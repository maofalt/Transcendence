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

    def update(self, instance, validated_data):
        setting_data = validated_data.pop('setting')
        setting = instance.setting

        instance.tournament_name = validated_data.get('tournament_name', instance.tournament_name)
        instance.nbr_of_player = validated_data.get('nbr_of_player', instance.nbr_of_player)
        instance.game_type = validated_data.get('game_type', instance.game_type)
        instance.tournament_type = validated_data.get('tournament_type', instance.tournament_type)
        instance.registration = validated_data.get('registration', instance.registration)
        instance.registration_period_min = validated_data.get('registration_period_min', instance.registration_period_min)
        instance.host_id = validated_data.get('host_id', instance.host_id)
        instance.save()

        # `MatchSetting`
        instance.setting.duration_sec = setting_data.get('duration_sec', setting.duration_sec)
        instance.setting.max_score = setting_data.get('max_score', setting.max_score)
        instance.setting.walls_factor = setting_data.get('walls_factor', setting.walls_factor)
        instance.setting.size_of_goals = setting_data.get('size_of_goals', setting.size_of_goals)
        instance.setting.paddle_height = setting_data.get('paddle_height', setting.paddle_height)
        instance.setting.paddle_speed = setting_data.get('paddle_speed', setting.paddle_speed)
        instance.setting.ball_speed = setting_data.get('ball_speed', setting.ball_speed)
        instance.setting.ball_radius = setting_data.get('ball_radius', setting.ball_radius)
        instance.setting.ball_color = setting_data.get('ball_color', setting.ball_color)
        instance.setting.save()
        for field, value in setting_data.items():
            setattr(setting, field, value)
        setting.save()

        return instance

class TournamentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = ['tournament_id', 'player']  # Assurez-vous que ces noms correspondent à ceux dans votre modèle

    def create(self, validated_data):
        # Créez une nouvelle instance TournamentPlayer avec les données validées
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
