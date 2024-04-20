from rest_framework import serializers
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType
from .models import RegistrationType, TournamentPlayer, Player, MatchParticipants
from decimal import Decimal

class MatchSettingSerializer(serializers.ModelSerializer):
    ball_model = serializers.CharField(default='', allow_blank=True, required=False)
    ball_texture = serializers.CharField(default='', allow_blank=True, required=False)

    class Meta:
        model = MatchSetting
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    setting = MatchSettingSerializer()
    is_full = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()
    host_name =  serializers.SerializerMethodField()

    class Meta:
        model = Tournament
        fields = ['id', 'tournament_name', 'nbr_of_player_total', 'nbr_of_player_match', 'setting', 'registration_period_min', 'host_id', 'joined', 'is_full', 'state', 'host_name']

    def to_internal_value(self, data):
        print("In to_internal_value:", data)
        return super().to_internal_value(data)
        
    def validate(self, data):
        nbr_of_player_total = data.get('nbr_of_player_total')
        nbr_of_player_match = data.get('nbr_of_player_match')

        if nbr_of_player_match > nbr_of_player_total:
            raise serializers.ValidationError("The number of players per match cannot be greater than the total number of players", code='custom_error')
        return data

    def get_host_name(self, obj):
        return obj.host.username

    # def create(self, validated_data):
    #     # setting_data = validated_data.pop('setting')  # Extract data from MatchSetting
    #     # setting = MatchSetting.objects.create(**setting_data)  # Create a new MatchSetting object
    #     tournament = Tournament.objects.create(setting=setting, **validated_data)  # Create a new Tournament object

    #     return tournament

    # def update(self, instance, validated_data):
    #     setting_data = validated_data.pop('setting')
    #     setting = instance.setting

    #     instance.id = validated_data.get('id', instance.id)
    #     instance.tournament_name = validated_data.get('tournament_name', instance.tournament_name)
    #     instance.nbr_of_player_total = validated_data.get('nbr_of_player_total', instance.nbr_of_player_total)
    #     instance.nbr_of_player_match = validated_data.get('nbr_of_player_match', instance.nbr_of_player_match)
    #     instance.registration_period_min = validated_data.get('registration_period_min', instance.registration_period_min)
    #     # instance.host_id = validated_data.get('host_id', instance.host_id)
    #     instance.save()

    #     # `MatchSetting` is a one-to-one relationship with `Tournament`
    #     for field, value in setting_data.items():
    #         setattr(setting, field, value)
    #     setting.save()

    #     return instance

    def get_joined(self, obj):
        return obj.players.count()

    def get_is_full(self, obj):
        return obj.is_full()
    
    def get_host(self, obj):
        return obj.host.username

class TournamentRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentPlayer
        fields = ['tournament_id', 'player'] # Fields to be serialized

    def create(self, validated_data):
        # Create a new TournamentPlayer object
        tournament_player = TournamentPlayer.objects.create(**validated_data)
        return tournament_player

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

# class BasicPlayerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Player
#         fields = ['id', 'username']

class TournamentPlayerSerializer(serializers.ModelSerializer):
    tournament_id = serializers.IntegerField(source='id')
    players_id = serializers.PrimaryKeyRelatedField(source='players', many=True, queryset=Player.objects.all())
    players_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Tournament
        fields = ['tournament_id', 'tournament_name', 'players_id', 'players_username']

    def get_players_username(self, obj):
        return [player.username for player in obj.players.all()]

class MatchGeneratorSerializer(serializers.Serializer):
    tournament_id = serializers.IntegerField()
    class Meta:
        model = Tournament
        fields = ['id']

    def create(self, validated_data):
        tournament_id = validated_data.get('tournament_id')
        return tournament_id

    def update(self, instance, validated_data):
        instance.tournament_id = validated_data.get('tournament_id', instance.tournament_id)
        return instance

# class GameTypeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = GameType
#         fields = ['id', 'type_name']

class TournamentMatchSerializer(serializers.ModelSerializer):
    winner_username = serializers.CharField(source='winner.username', read_only=True)
    players = PlayerSerializer(many=True)
    # players = serializers.SerializerMethodField()
    tournament_name = serializers.SerializerMethodField()

    def get_tournament_name(self, obj):
        try:
            tournament = Tournament.objects.get(id=obj.tournament_id)
            return tournament.tournament_name
        except Tournament.DoesNotExist:
            return None

    
    # def get_players(self, obj):
    #     players = obj.players.all().order_by('id')
    #     return [player.username for player in players]

    class Meta:
        model = TournamentMatch
        fields = ['id', 'state', 'tournament_name', 'winner_username', 'round_number', 'players']

class TournamentMatchListSerializer(serializers.Serializer):
    tournament_name = serializers.CharField()
    date = serializers.CharField(source='created_at')
    round = serializers.IntegerField()
    nbr_player_setting = serializers.IntegerField()
    winner = serializers.CharField()
    matches = TournamentMatchSerializer(many=True)
    
class GamemodeDataSerializer(serializers.ModelSerializer):
    nbrOfRounds = serializers.SerializerMethodField() 
    nbrOfPlayers = serializers.SerializerMethodField() # it is returning not a nbr_of_player for match setting, it returns actaul number of payer for a current match
    timeLimit = serializers.IntegerField(default=5)
    gameType = serializers.IntegerField(default=0)

    class Meta:
        model = TournamentMatch
        fields = ['nbrOfPlayers', 'nbrOfRounds', 'timeLimit', 'gameType']

    def get_nbrOfPlayers(self, obj):
        return obj.players.count()
    
    def get_nbrOfRounds(self, obj):
        setting = MatchSetting.objects.get(id=obj.match_setting_id)
        return setting.nbr_of_rounds

class FieldDataSerializer(serializers.ModelSerializer):
    wallsFactor = serializers.DecimalField(max_digits=3, decimal_places=2, source='walls_factor')
    sizeOfGoals = serializers.IntegerField(source='size_of_goals')

    class Meta:
        model = MatchSetting
        fields = ['wallsFactor', 'sizeOfGoals']

class PaddlesDataSerializer(serializers.ModelSerializer):
    width = serializers.IntegerField(default=1)
    height = serializers.IntegerField(source='paddle_height')
    speed = serializers.DecimalField(max_digits=3, decimal_places=2, source='paddle_speed')

    class Meta:
        model = MatchSetting
        fields = ['width', 'height', 'speed']
    
class BallDataSerializer(serializers.ModelSerializer):
    speed = serializers.DecimalField(max_digits=3, decimal_places=2, source='ball_speed')
    radius = serializers.DecimalField(max_digits=3, decimal_places=2, source='ball_radius')
    color = serializers.CharField(source='ball_color')
    model = serializers.CharField(source='ball_model')
    texture = serializers.CharField(source='ball_texture')
    
    class Meta:
        model = MatchSetting
        fields = ['speed', 'radius', 'color', 'model', 'texture']

class SimplePlayerSerializer(serializers.ModelSerializer):
    accountID = serializers.CharField(source='username')
    assigned_colors = [
        '0xFF0000',  # Red
        '0x0000FF',  # Blue
        '0x00FF00',  # Green
        '0xFFFF00',  # Yellow
        '0x444444',  # Dark Grey
        '0xFFC0CB',  # Magenta
        '0x00FFFF',  # Cyan
        '0xFFFFFF',  # White
    ]

    class Meta:
        model = Player
        fields = ['id', 'accountID']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        queryset = Player.objects.all()
        player_count = queryset.count()
        index = list(queryset).index(instance)  # Get the index of the instance in the queryset
        color_index = index % len(self.assigned_colors)
        representation['color'] = self.assigned_colors[color_index]
        return representation

class TournamentMatchRoundSerializer(serializers.ModelSerializer):
    gamemodeData = GamemodeDataSerializer()
    fieldData = FieldDataSerializer()
    paddlesData = PaddlesDataSerializer()
    ballData = BallDataSerializer()
    players = SimplePlayerSerializer(many=True)
    matchID = serializers.IntegerField(source='id')

    class Meta:
        model = TournamentMatch
        fields = ['tournament_id', 'matchID', 'gamemodeData', 'fieldData', 'paddlesData', 'ballData', 'players']

class SimpleTournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'tournament_name', 'created_at', 'winner']
    
class SimpleMatchSerializer(serializers.ModelSerializer):
    winner = serializers.SerializerMethodField()
    players = serializers.SerializerMethodField()
    
    class Meta:
        model = TournamentMatch
        fields = ['id', 'tournament_id', 'round_number', 'players', 'winner']

    def get_players(self, obj):
        players = obj.players.all().order_by('id')
        return [player.username for player in players]

    def get_winner(self, obj):
        winner = obj.winner
        if winner:
            return winner.username
        return None


class PlayerGameStatsSerializer(serializers.Serializer):
    played_tournaments = SimpleTournamentSerializer(many=True, read_only=True)
    played_matches = SimpleMatchSerializer(many=True, read_only=True)

    total_played = serializers.IntegerField()
    nbr_of_lost_matches = serializers.IntegerField()
    nbr_of_won_matches = serializers.IntegerField()
    nbr_of_won_tournaments = serializers.IntegerField()
