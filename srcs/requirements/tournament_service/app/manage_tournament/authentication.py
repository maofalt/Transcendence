import jwt
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions
import time
import datetime
from django.http import JsonResponse
from django.conf import settings

# ------------------------ Authentication -----------------------------------
class CustomJWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # accessToken = request.headers.get('Authorization', None)
        refreshToken = request.COOKIES.get('refreshToken')
        # print("refreshToken print: ", str(refreshToken))
        if not refreshToken:
            raise exceptions.AuthenticationFailed('Refresh token is missing')
            # return None, None
        try:
            decoded_token = jwt.decode(refreshToken, settings.SECRET_KEY, algorithms=["HS256"])
            uid = decoded_token['user_id']
            return uid, refreshToken

        except jwt.ExpiredSignatureError:
            print("Access token has expired")
            # return None, None
            raise exceptions.AuthenticationFailed('Access token has expired')

        except jwt.InvalidTokenError:
            print("Invalid token")
            # return None, None
            raise exceptions.AuthenticationFailed('Invalid token')

        except Exception as e:
            print("An error occurred authentication:", e)
            # return None, None
            raise exceptions.AuthenticationFailed('An error occurred authentication')

        
