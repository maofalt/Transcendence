from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS
from rest_framework import permissions

# ------------------------ Permissions -----------------------------------
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Les opérations de lecture sont autorisées pour les utilisateurs authentifiés.
    Les opérations d'écriture sont seulement autorisées au host du tournoi.
    """
    def has_permission(self, request, view):
        # Autorise toutes les requêtes authentifiées pour les méthodes de lecture
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # Pour les autres méthodes, la logique spécifique à l'objet s'appliquera
        return True

    def has_object_permission(self, request, view, obj):
        # Les opérations de lecture sont autorisées pour tous
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return obj.host == request.user


