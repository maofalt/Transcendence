from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import BasePermission
from rest_framework.permissions import SAFE_METHODS
from rest_framework import permissions

# ------------------------ Permissions -----------------------------------
class IsOwnerOrRegisterOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Les opérations de lecture sont autorisées pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        # Les opérations d'écriture sont seulement autorisées au créateur du tournoi
        return obj.host.username == request.user.username

class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.host == request.user

class CanRegister(BasePermission):
    """
    Custom permission to only allow authenticated users to register.
    """
    def has_permission(self, request, view):
        # Only authenticated users can register
        return request.user and request.user.is_authenticated

