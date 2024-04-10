from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework import permissions
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import TournamentMatch
from .models import TournamentPlayer
from django.conf import settings
from .utils import create_hashed_code


# ------------------------ Permissions -----------------------------------
# for MatchResult from game backend

class CustomAuthorization(BasePermission):
    def has_permission(self, request, view):
        match_id = view.kwargs.get('match_id')
        received_hashed_code = request.data.get('hashed_code')

        if not match_id or not received_hashed_code:
            return False

        expected_hashed_code = create_hashed_code(match_id)
        return received_hashed_code == expected_hashed_code

# class IsOwnerOrReadOnly(permissions.BasePermission):
#     """
#     Permission personalized to allow only the host of the tournament
#     to access the view.
#     """
#     def has_permission(self, request, view):
#         # Autorise toutes les requêtes authentifiées pour les méthodes de lecture
#         if request.method in permissions.SAFE_METHODS:
#             return request.user and request.user.is_authenticated
#         # Pour les autres méthodes, la logique spécifique à l'objet s'appliquera
#         return True

#     def has_object_permission(self, request, view, obj):
#         # Les opérations de lecture sont autorisées pour tous
#         if request.method in permissions.SAFE_METHODS:
#             return request.user and request.user.is_authenticated
#         return obj.host.username == request.user


# class IsHostOrParticipant(permissions.BasePermission):
#     """
#     Permission personalized to allow only the host of the tournament
#     or the participants to access the view.
#     """

#     def has_permission(self, request, view):
#         # Auhorize all authenticated requests for read methods
#         return True

#     def has_object_permission(self, request, view, obj):
#         # The read operations are allowed for all authenticated users.
#         if request.method in permissions.SAFE_METHODS:
#             return request.user and request.user.is_authenticated
        
#         # Verify if the user is the host of the tournament.
#         is_host = obj.host.username == request.user
        
#         # Verify if the user is a participant of the tournament.
#         is_participant = TournamentPlayer.objects.filter(tournament_id=obj, player__username=request.user).exists()
        
#         return is_host or is_participant