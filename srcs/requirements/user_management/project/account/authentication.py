import jwt
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions
from rest_framework.exceptions import AuthenticationFailed
import time
import datetime
from django.http import JsonResponse
from django.conf import settings

User = get_user_model()

# ------------------------ Authentication -----------------------------------
class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        accessToken = request.headers.get('Authorization', None)
        # print(">>   accessToken: ", accessToken)
        if not accessToken:
            return None
        
        try:
            token = accessToken.split()[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            username = payload['username']
            user = User.objects.get(username=username)
            return (user, None)
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired. Please obtain a new one.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token. Please provide a valid token.')
        except User.DoesNotExist:
            raise AuthenticationFailed('No such user found.')