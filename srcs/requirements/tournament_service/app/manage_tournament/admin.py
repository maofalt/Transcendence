from django.contrib import admin
from .models import Tournament, TournamentMatch, MatchSetting, GameType, TournamentType, RegistrationType, TournamentPlayer, Player, MatchParticipants

admin.site.register(Tournament)
admin.site.register(TournamentMatch)
admin.site.register(MatchSetting)
admin.site.register(GameType)
admin.site.register(TournamentType)
admin.site.register(RegistrationType)
admin.site.register(TournamentPlayer)
admin.site.register(Player)
admin.site.register(MatchParticipants)