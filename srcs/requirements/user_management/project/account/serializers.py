from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class AnonymousUserSerializer(serializers.Serializer):
    class Meta:
        fields = []

class FriendUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'playername', 'avatar', 'is_online', 'last_valid_time']

class ProfileUSerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'playername', 'avatar', 'email', 'phone', 'two_factor_method']
        extra_kwargs = {
            'two_factor_method': {'allow_null': True}
        }


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(max_length=128, required=True)
    new_password1 = serializers.CharField(max_length=128, required=True)
    new_password2 = serializers.CharField(max_length=128, required=True)

    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError("The new passwords do not match.")
        return data

class PasswordResetSerializer(serializers.Serializer):
    new_password1 = serializers.CharField(max_length=128, required=True)
    new_password2 = serializers.CharField(max_length=128, required=True)

    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError("The new passwords do not match.")
        return data

class SendResetLinkSerializer(serializers.Serializer):
    username = serializers.CharField()

    def validate_username(self, value):
        try:
            user = User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")

        return value

    def create(self, validated_data):
        return {}

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']


