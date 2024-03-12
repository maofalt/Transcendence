from django.core.validators import MinValueValidator, MaxValueValidator, ValidationError, RegexValidator
from django.db import models
from django.conf import settings

class Tournament(models.Model):
    tournament_id = models.AutoField(primary_key=True)
    tournament_name = models.CharField(max_length=255, unique=True)
    game_type = models.ForeignKey('GameType', on_delete=models.PROTECT, null=False, to_field='type_id', default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    nbr_of_player = models.IntegerField(default=2, 
        validators=[MinValueValidator(2), 
        MaxValueValidator(100)
        ]
    )
    tournament_type = models.ForeignKey('TournamentType', on_delete=models.PROTECT, null=False, to_field='type_id', default=1)
    re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gistration = models.ForeignKey('RegistrationType', on_delete=models.PROTECT, null=False, to_field='type_id', default=1)
    setting = models.ForeignKey('MatchSetting', on_delete=models.PROTECT, null=False, to_field='setting_id', default=0)
    registration_period_min = models.IntegerField(default=15, 
        validators=[MinValueValidator(1, message="Registration period must be at least 1 minutes."), 
        MaxValueValidator(60, message="Registration period cannot exceed 60 minutes.")
        ]
    )
    host = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tournaments')
    players = models.ManyToManyField('Player', through='TournamentPlayer', related_name='tournaments')
    matchs = models.ManyToManyField('TournamentMatch', related_name='tournaments')
    nbr_of_match = models.IntegerField(default=0)

    def calculate_nbr_of_match(self):
        # Calculate the number of matches based on total players and max players per match
        max_players_per_match = self.setting.nbr_of_player
        total_players = self.nbr_of_player
        add_match = total_players // max_players_per_match
        if total_players % max_players_per_match != 0:
            add_match += 1
        self.nbr_of_match += add_match
        while add_match > 1:
            tmp = add_match
            add_match = tmp // max_players_per_match
            if tmp % max_players_per_match != 0:
                add_match += 1
            self.nbr_of_match += add_match

# i set when there is a plyer left after generate the other matches,
# it also counted as a match with a single player which means the player will win automatically
#             (t//m + (t%m != 0)) +  ...
# 20 / 3 => 11(3, 3, 3, 3, 3, 3, 2 > 3, 3, 1 > 3)
# 15 / 4 => 5(4, 4, 4, 3 > 4)            
# 8 / 2 => 7(2, 2, 2, 2 > 2, 2 > 2)
# 8 / 3 => 4(3, 3, 2 > 3)
# 5 / 3 => 3(3, 2 > 2)
# 4 / 3 => 2(3, 1 > 2)

class TournamentMatch(models.Model):
    match_id = models.AutoField(primary_key=True)
    tournament_id = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='match' )
    round_number = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    match_time = models.DateTimeField(null=True) 
    match_result = models.CharField(max_length=255)
    players = models.ManyToManyField('Player', through='TournamentPlayer', related_name='tournaments')
    match_setting = models.ForeignKey('MatchSetting', on_delete=models.PROTECT, null=False, related_name='matches')
    # nbr_of_player = models.IntegerField(default=1)
    def max_number_of_players_validator(value):
        # Get max number of players from MatchSetting instance
        max_players = self.match_setting.nbr_of_player
        if value < 1 or value > max_players:
            raise ValidationError(f'Number of players must be between 2 and {max_players}.')

    nbr_of_player = models.IntegerField(default=1, validators=[max_number_of_players_validator])

class MatchSetting(models.Model):
    setting_id = models.AutoField(primary_key=True)
    duration_sec = models.IntegerField(default=210, 
        validators=[MinValueValidator(60, message="Duration must be at least 60 seconds."), 
        MaxValueValidator(300, message="Duration cannot exceed 300 seconds.")
        ]
    )
    max_score = models.IntegerField(default=5, 
        validators=[MinValueValidator(1, message="Max score must be at least 1."), 
        MaxValueValidator(10, message="Max score cannot exceed 10.")
        ]
    )
    walls_factor = models.IntegerField(default=0,
        validators=[MinValueValidator(0, message="Walls factor must be at least 0."), 
        MaxValueValidator(2, message="Walls factor cannot exceed 2.")
        ]
    )
    size_of_goals = models.IntegerField(default=15, 
        validators=[MinValueValidator(15, message="Size of goal must be at least 10."),
        MaxValueValidator(30, message="Size of goal cannot exceed 30.")
        ]
    )
    paddle_height = models.IntegerField(default=10, 
        validators=[MinValueValidator(1, message="Paddle height must be at least 1."),
        MaxValueValidator(12, message="Paddle height cannot exceed 12.")
        ]
    )
    paddle_speed = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.5, 
        validators=[MinValueValidator(0.1, message="Paddle speed must be at least 0.1."),
        MaxValueValidator(2, message="Paddle speed cannot exceed 2.")
        ]
    )
    ball_speed = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.7, 
        validators=[MinValueValidator(0.1, message="Ball speed must be at least 0.1."),
        MaxValueValidator(2, message="Ball speed cannot exceed 2.")
        ]
    )
    ball_radius = models.DecimalField(
        max_digits=3, decimal_places=2, default=1, 
        validators=[MinValueValidator(0.5, message="Ball radius must be at least 0.5."),
        MaxValueValidator(7, message="Ball radius cannot exceed 7.")
        ]
    )
    ball_color = models.CharField(max_length=7, default='#000000', 
    validators=[RegexValidator(r'^#(?:[0-9a-fA-F]{3}){1,2}$', message="Invalid color format.")])
    nbr_of_player = models.IntegerField(default=2, 
        validators=[MinValueValidator(2), 
        MaxValueValidator(8)
        ]
    )

class GameType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=255)

class TournamentType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=255)

class RegistrationType(models.Model):
    type_id = models.AutoField(primary_key=True)
    type_name = models.CharField(max_length=255)

class TournamentPlayer(models.Model):
    tournament_id = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='tournament')
    player = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='player')

    class Meta:
        unique_together = ('tournament_id', 'player')

class Player(models.Model):
    player_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255)

    class Meta:
        unique_together = ('player_id', 'username')

class MatchParticipants(models.Model):
    match_id = models.ForeignKey('TournamentMatch', on_delete=models.CASCADE, related_name='participants')
    player_id = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='playeridfrommatch')
    is_winner = models.BooleanField(default=False)
    participant_score = models.IntegerField(default=0)
