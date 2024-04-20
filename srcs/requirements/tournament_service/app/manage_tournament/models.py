from django.core.validators import MinValueValidator, MaxValueValidator, ValidationError, RegexValidator
from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from decimal import Decimal
from django.utils import timezone

def get_current_timestamp():
    return int(timezone.now().timestamp())

class Tournament(models.Model):
    tournament_name = models.CharField(max_length=30)
    created_at = models.IntegerField(default=get_current_timestamp)
    nbr_of_player_total = models.IntegerField(default=2, 
        validators=[MinValueValidator(2), 
        MaxValueValidator(100)
        ]
    )
    nbr_of_player_match = models.IntegerField(default=2, 
        validators=[MinValueValidator(2), 
        MaxValueValidator(8)
        ]
    )
    setting = models.ForeignKey('MatchSetting', on_delete=models.PROTECT, null=False, to_field='id', default=0)
    registration_period_min = models.IntegerField(default=15, 
        validators=[MinValueValidator(1, message="Registration period must be at least 1 minutes."), 
        MaxValueValidator(60, message="Registration period cannot exceed 60 minutes.")
        ]
    )
    
    host = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='hosted_tournaments')
    winner = models.CharField(max_length=20, default='TBD')
    players = models.ManyToManyField('Player', related_name='tournaments')  # Direct many-to-many relationship with Player
    matches = models.ManyToManyField('TournamentMatch', related_name='tournaments')
    nbr_of_match = models.IntegerField(default=0)
    state = models.CharField(max_length=15, default="waiting")

    def clean(self):
        if self.nbr_of_player_total < self.nbr_of_player_match:
            raise ValidationError(('The number of players for Tournament must be equal to or greater than the number of players per match.'))

    def calculate_nbr_of_match(self):
        # Calculate the number of matches based on total players and max players per match
        max_players_per_match = self.nbr_of_player_match
        total_players = self.players.count()
        added_match = total_players // max_players_per_match
        if total_players % max_players_per_match != 0:
            added_match += 1
        self.nbr_of_match += added_match
        while added_match > 1:
            tmp = added_match
            added_match = tmp // max_players_per_match
            if tmp % max_players_per_match != 0:
                added_match += 1
            self.nbr_of_match += added_match

    def is_full(self):
        # Check if the tournament is full (all player slots are filled).
        nbr_of_player_total = int(self.nbr_of_player_total)
        return self.players.count() >= nbr_of_player_total

    def assign_player_to_match(self, player, round):
        matches = self.matches.all().filter(round_number=round).order_by('id')

        for match in matches: 
            if match.players.count() < self.nbr_of_player_match:
                if match.state == "waiting":
                    match.players.add(player)
                    # match.nbr_of_player += 1
                    match.save()
                    return match 
        return None

class TournamentMatch(models.Model):
    tournament_id = models.IntegerField()
    match_setting_id = models.IntegerField()
    round_number = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    match_time = models.DateTimeField(null=True) 
    players = models.ManyToManyField('Player', related_name='matches')
    winner = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='match_wins', null=True)
    state = models.CharField(max_length=15, default="waiting")

    def __str__(self):
        player_count = self.players.count()
        winner_username = self.winner.username if self.winner else "None"
        return f"ID: {self.id}, Tournament: {self.tournament_id}, State: {self.state}, Winner: {winner_username}, Match Setting: {self.match_setting_id}, Round Number: {self.round_number}, Count Players: {player_count}"

class MatchSetting(models.Model):
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
    walls_factor = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.7,
        validators=[MinValueValidator(Decimal(0), message="Walls factor must be at least 0."), 
        MaxValueValidator(Decimal(2), message="Walls factor cannot exceed 2.")
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
        max_digits=3, decimal_places=2, default=0.01, 
        validators=[MinValueValidator(Decimal(0.01), message="Paddle speed must be at least 0.1."),
        MaxValueValidator(Decimal(2), message="Paddle speed cannot exceed 2.")
        ]
    )
    ball_speed = models.DecimalField(
        max_digits=3, decimal_places=2, default=0.1, 
        validators=[MinValueValidator(Decimal(0.09), message="Ball speed must be at least 0.1."),
        MaxValueValidator(Decimal(2), message="Ball speed cannot exceed 2.")
        ]
    )
    ball_radius = models.DecimalField(
        max_digits=3, decimal_places=1, default=1, 
        validators=[MinValueValidator(Decimal(0.5), message="Ball radius must be at least 0.5."),
        MaxValueValidator(Decimal(7), message="Ball radius cannot exceed 7.")
        ]
    )
    ball_color = models.CharField(max_length=8, default='0x000000', 
    validators=[RegexValidator(r'^#(?:[0-9a-fA-F]{3}){1,2}$', message="Invalid color format.")])
    ball_model = models.CharField(null=True, default='')
    ball_texture = models.CharField(null=True, default='')
    nbr_of_rounds = models.IntegerField(default=5, 
        validators=[MinValueValidator(1), 
        MaxValueValidator(10)
        ]
    )
    nbr_of_player = models.IntegerField(default=2, 
        validators=[MinValueValidator(2), 
        MaxValueValidator(8)
        ]
    )

class GameType(models.Model):
    type_name = models.CharField(max_length=255)

class TournamentType(models.Model):
    type_name = models.CharField(max_length=255)

class RegistrationType(models.Model):
    type_name = models.CharField(max_length=255)

# May not need this schema
class TournamentPlayer(models.Model):
    tournament_id = models.ForeignKey('Tournament', on_delete=models.CASCADE, related_name='tournament')
    player = models.ForeignKey('Player', on_delete=models.CASCADE, related_name='player')

    class Meta:
        unique_together = ('tournament_id', 'player')

class Player(models.Model):
    id = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=20, default='unknown')
    total_played = models.IntegerField(default=0)
    won_match = models.ManyToManyField('TournamentMatch', related_name='won_match')
    won_tournament = models.ManyToManyField('Tournament', related_name='won_tournament')

    def __str__(self):
        return f"ID: {self.id}, USERNAME: {self.username}, TOTAL: {self.total_played}, MATCH: {self.won_match}, TOURNAMENT: {self.won_tournament}"

class MatchParticipants(models.Model):
    match_id = models.IntegerField(null=False)
    round_number = models.IntegerField(null=False)
    player_id = models.IntegerField(null=False)
    is_winner = models.BooleanField(default=False)
    # participant_score = models.IntegerField(default=0)

    def __str__(self):
        return f"ID: {self.id}, Match: {self.match_id}, Round: {self.round_number}, Player: {self.player_id}, IsWinner: {self.is_winner}"
