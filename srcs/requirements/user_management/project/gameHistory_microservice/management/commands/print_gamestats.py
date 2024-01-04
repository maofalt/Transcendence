from django.core.management.base import BaseCommand
from gameHistory_microservice.models import GameStats

class Command(BaseCommand):
    help = 'Prints the string representation of a GameStats instance'

    def handle(self, *args, **options):
        game_stats_instance = GameStats.objects.first()
        print(game_stats_instance)