from .models import User
from django import forms
from .forms import CustomPasswordResetForm, ProfileUpdateForm, PasswordUpdateForm, CustomPasswordChangeForm, CustomPasswordResetForm
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView, PasswordResetDoneView
from django.db.utils import IntegrityError
from django.core import signing
from django.core.exceptions import ValidationError
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt, csrf_protect, ensure_csrf_cookie
from django.http import JsonResponse, HttpResponseRedirect, HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db import transaction
from django.urls import reverse, reverse_lazy
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode
from django.views.generic.edit import FormView
from urllib.parse import urljoin
import secrets
import requests
import logging
import base64
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.forms.models import model_to_dict
from .authentication import CustomJWTAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import serializers, generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.generics import ListAPIView
from django.http import Http404

# from django.utils.encoding import force_bytes, force_str

#JWT
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import SendResetLinkSerializer, PasswordResetSerializer, SimpleUserSerializer, PasswordResetSerializer, PasswordChangeSerializer, FriendUserSerializer, UserSerializer, AnonymousUserSerializer, ProfileUSerSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from datetime import datetime, timedelta
import datetime
import pytz
from django.conf import settings
from django.utils import timezone

# 2FA
import json
from django.core.validators import validate_email
import random
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.sessions.models import Session
from django.middleware.csrf import get_token
import boto3
import re
from botocore.exceptions import ClientError

#XSS protection
from django.utils.html import escape


custom_jwt_auth = CustomJWTAuthentication()


logger = logging.getLogger(__name__)
User = get_user_model()

def home(request):
    return render(request, 'home.html')

@ensure_csrf_cookie
@csrf_protect
def get_user(request):
    refreshToken = request.COOKIES.get('refreshToken', None)
    try:
        decoded_refresh_token = jwt.decode(refreshToken, settings.SECRET_KEY, algorithms=["HS256"])
        print("DECODED REFRESHTOKEN: ", decoded_refresh_token)
        uid = decoded_refresh_token['user_id']
        try:
            user = User.objects.get(pk=uid)
            avatar_data = None
            if user.avatar:
                with open(user.avatar.path, "rb") as image_file:
                    avatar_data = base64.b64encode(image_file.read()).decode('utf-8')
            user_data = {
                'user_id': user.id,
                'username': user.username,
                'last_valid_time': user.last_valid_time,
                'avatar': avatar_data,
                'playername': user.playername
            }
            return JsonResponse(user_data)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Refresh token has expired'}, status=400)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid refresh token'}, status=400)

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
# call this function from frontend everytime user calls any API
def check_refresh(request):
    accessToken = request.headers.get('Authorization', None)
    refreshToken = request.COOKIES.get('refreshToken', None)
    # print("accessToken print: ", str(accessToken))

    if not accessToken:
        return JsonResponse({'error': 'Authorization header is missing'}, status=400)
    if not refreshToken:
        return JsonResponse({'error': 'Refresh token is missing'}, status=400)
    
    exp_datetime = None
    try:
        decoded_token = jwt.decode(accessToken.split()[1], settings.SECRET_KEY, algorithms=["HS256"])
        # print("decoded_token: ", decoded_token)
        local_tz = pytz.timezone('Europe/Paris')
        exp_timestamp = decoded_token['exp']
        exp_datetime = datetime.datetime.fromtimestamp(exp_timestamp, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("exp_datetime: ", exp_datetime)

        response = refresh_accessToken(request, accessToken, refreshToken)
        return response
        # return JsonResponse({'message': 'Access token is still valid'})

    except jwt.ExpiredSignatureError:
        print("Access token has expired")
        response_data = refresh_accessToken(request, accessToken, refreshToken)
        response = JsonResponse(response_data)
        return response        

    except jwt.InvalidTokenError:
        print("from here>>??")
        print("Invalid token")
        return JsonResponse({'error': 'Invalid token'}, status=401)

    except Exception as e:
        print("An error occurred:", e)
        return JsonResponse({'error': 'An error occurred while processing the request'}, status=500)

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
def refresh_accessToken(request, accessToken, refreshToken):
    try:
        decoded_refresh_token = jwt.decode(refreshToken, settings.SECRET_KEY, algorithms=["HS256"])
        # print("DECODED REFRESHTOKEN: ", decoded_refresh_token)
        uid = decoded_refresh_token['user_id']
        user = get_object_or_404(User, pk=uid)
        local_tz = pytz.timezone('Europe/Paris')
        user.last_valid_time = timezone.now().astimezone(local_tz).replace(microsecond=0)
        # user.last_valid_time = timezone.now().replace(microsecond=0)
        user.save()
        refresh = RefreshToken(refreshToken)
        access = refresh.access_token
        access['username'] = user.username
        new_accessToken = str(access)

        current_time = timezone.now()
        expiration_time = datetime.datetime.fromtimestamp(access['exp'], tz=pytz.utc)
        expires_in = (expiration_time - current_time).total_seconds()
        exp_datetime = datetime.datetime.fromtimestamp(access['exp'], tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        # Set new access token in response body
        response_data = {
            'message': 'New access token generated',
            'access_token': new_accessToken,
            'token_type': 'Bearer',
            'expires_in': expires_in,
            'exp_datetime': exp_datetime
        }
        print("expires_in: ", expires_in, "exp_datetime: ", exp_datetime)
        return JsonResponse(response_data)
    except Http404:
        return JsonResponse({'error': 'User not found'}, status=404)
    except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Access/Refresh token has expired'}, status=401)

@authentication_classes([])
@permission_classes([AllowAny])
def privacy_policy_view(request):
    return render(request, 'privacy_policy.html')

@api_view(['POST'])
# @require_POST
@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
def api_login_view(request):
    print("\n\n       URL:", request.build_absolute_uri())

    if request.method == "POST": 
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(username=username, password=password)
        if user is not None:
            request.session['pending_username'] = user.username
            print("User Information:")
            print(f"Username: {user.username}")
            print(f"email: {user.email}")
            print(f"Playername: {user.playername}")
            print(f"Is Online: {user.is_online}")
            print(f"Date Joined: {user.date_joined}")
            serializer = UserSerializer(user)
            redirect_url = '/api/user_management/'
            if (user.two_factor_method != None):
                if (user.two_factor_method == 'email'):
                    send_one_time_code(request, user.email)
                elif(user.two_factor_method == 'sms'):
                    send_sms_code(request, user.phone)
            return generate_tokens_and_response(request, user)
        else:
            print("Authentication failed")
            return JsonResponse({'error': escape('Authentication failed: Wrong user data')}, status=400)
    return JsonResponse({'error': escape('Invalid request method')}, status=400)

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
def generate_tokens_and_response(request, user):
    accessToken = AccessToken.for_user(user)
    accessToken['username'] = user.username
    print("---> ACCESS TOKEN: ", str(accessToken))
    if user.two_factor_method == '' or user.two_factor_method is None:
        twoFA = False
        login(request, user)
        user.is_online = True
        user.save()
    else:
        twoFA = True
    refreshToken = RefreshToken.for_user(user)
    exp_accessToken = None
    try:
        secret_key = settings.SECRET_KEY
        decodedToken = jwt.decode(str(accessToken), secret_key, algorithms=["HS256"])
        local_tz = pytz.timezone('Europe/Paris')
        exp_timestamp_accessToken = decodedToken['exp']
        exp_accessToken = datetime.datetime.fromtimestamp(exp_timestamp_accessToken, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("Expiration time of ACCESS token:", exp_accessToken)
        user.last_valid_time = timezone.now().replace(microsecond=0)
        user.save()

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': escape('Token has expired')}, status=400)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': escape('Invalid token')}, status=400)

    current_time = timezone.now()
    expiration_time = datetime.datetime.fromtimestamp(accessToken['exp'], tz=pytz.utc)
    expires_in = (expiration_time - current_time).total_seconds()
    response_data = {
        'success': True,
        'requires_2fa': twoFA,
        'access_token': str(accessToken),
        'token_type': 'Bearer',
        'expires_in': expires_in,
        'exp_datetime': exp_accessToken
    }
    
    print("expires_in: ", expires_in,  "exp_datetime : ", exp_accessToken)
    response = JsonResponse(response_data)
    response.set_cookie('refreshToken', refreshToken, httponly=True, secure=True, samesite='Strict')
    
    return response

def generate_one_time_code():
    return get_random_string(length=6, allowed_chars='1234567890')

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
def send_one_time_code(request, email=None):
    if email is None and request.method == 'POST':
        email = request.POST.get('email', None)
    one_time_code = generate_one_time_code()
    request.session['one_time_code'] = one_time_code

    print("\n\nCHECK CODE ON SESSION: ", request.session.get('one_time_code'))
    subject = 'Your Access Code for PONG'
    message = f'Your one-time code is: {escape(one_time_code)}'
    from_email = 'no-reply@student.42.fr' 
    to_email = email
    send_mail(subject, message, from_email, [to_email])
    return JsonResponse({'success': True})

@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([])
@permission_classes([AllowAny])
def verify_one_time_code(request):
    if request.method == 'POST':
        csrf_token = get_token(request)
        print("\n\nCSRF Token from request:", request.headers.get('X-CSRFToken'))
        submitted_code = request.POST.get('one_time_code')
        stored_code = request.session.get('one_time_code')
        context = request.POST.get('context')
        print("REQUEST CODE: ", request.POST)
        print("\n\ncode from Session : ", stored_code)
        print("code from User : ", submitted_code, '\n\n')
        pending_username = request.session.get('pending_username')
        if pending_username or True :
            if submitted_code == stored_code:
                del request.session['one_time_code']
                if context == 'login':
                    user = User.objects.get(username=pending_username)
                    login(request, user)
                    user.is_online = True
                    print(f"Is Online: {user.is_online}")
                    user.save()
                return JsonResponse({'success': True, 'message': escape('One-time code verification successful'), 'csrf_token': csrf_token})
            else:
                return JsonResponse({'success': False, 'error': escape('One-time code verification failed'), 'csrf_token': csrf_token}, status=400)
        else:
            return JsonResponse({'success': False, 'error': escape('User authentication not found')}, status=400)

    return JsonResponse({'success': False, 'error': escape('Invalid request method')}, status=400)

def get_serializer(user):
    if user.is_authenticated:
        return UserSerializer(user)
    else:
        return AnonymousUserSerializer()

@csrf_protect
@login_required
# @require_POST
@authentication_classes([CustomJWTAuthentication])
def api_logout_view(request):
    if request.method == 'POST':
        request.user.is_online = False
        request.user.save()
        print(request.user.username, ": is_online status", request.user.is_online)
        logout(request)
        serializer = get_serializer(request.user)
        redirect_url = "/api/user_management/"
        response_data = {'redirect_url': escape(redirect_url)}
        return JsonResponse(response_data)
    else:
        return JsonResponse({'error': escape('Invalid request method')}, status=400)

@csrf_protect
# @require_POST
@authentication_classes([])
@permission_classes([AllowAny])
def api_signup_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        playername = request.POST["playername"]
        email = request.POST["signupEmail"]

        try:
            validate_password(password, user=User(username=username))
        except ValidationError as e:
            return JsonResponse({'success': False, 'error': e.messages[0]})

        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'success': False, 'error': escape('Invalid email')})

        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error': escape('Username already exists')})

        if User.objects.filter(playername=playername).exists():
            return JsonResponse({'success': False, 'error': escape('Playername already exists')})

        user = User(
            username=username,
            email=email,
            password=make_password(password),
            playername=playername,
        )
        print("PASSWORD : ", password)

        try:
            user.save()
        except IntegrityError as e:
            return JsonResponse({'success': False, 'error': escape('User creation failed.')})

        print(" >>  User created successfully.")

        login(request, user)
        user.is_online = True
        user.save()
        return generate_tokens_and_response(request, user)
        # return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error': escape('Invalid request method')}, status=400)



def send_notification_to_microservices(user):
    endpoint_url = f"https://localhost:9443/api/tournament/{user.id}/delete_user"
    # payload = {'username': username}

    try:
        # send POST request
        response = requests.post(endpoint_url)
        if response.status_code == 200:
            logger.info("successfully sent request to delete user from tournament")
        else:
            logger.error("failed to send request to delete user from tournament")
    except Exception as e:
        logger.error(f"Error sending POST request to tournament: {str(e)}")

# @require_POST
@login_required
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
def delete_account(request):
    user = request.user
    try:
        send_notification_to_microservices(user)
        user.is_online = False
        # user.save()
        request.user.delete()

        logger.info(f"User {user.username} deleted successfully.")
        
        return JsonResponse({'success': True, 'message': escape('Account deleted successfully')})
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['GET'])
def settings_view(request):
    return JsonResponse({})

@login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
def friends_view(request):
    user = request.user
    friends = user.friends.all()

    friend_data = FriendUserSerializer(friends, many=True).data

    current_time = int(timezone.now().timestamp())
    for friend_info in friend_data:
        if friend_info['is_online'] and (current_time - int(friend_info['last_valid_time'])) > 300:
            friend_info['is_online'] = False

        if friend_info['avatar']:
            friend_info['avatar'] = urljoin(settings.MEDIA_URL, friend_info['avatar'])

    search_query = request.GET.get('search')
    search_results = []
    if (search_query != user.username):
        if search_query:
            print(search_query)
            # search_results = User.objects.filter(username__icontains=search_query)
            search_results = list(User.objects.filter(username__icontains=search_query).values())
            print("search_resuls : ", search_results)
    search_results_serialized = FriendUserSerializer(search_results, many=True).data
    return JsonResponse({'friends': friend_data, 'search_query': escape(search_query), 'search_results': search_results_serialized})
    # return render(request, 'friends.html', {'friends': friend_data, 'search_query': search_query, 'search_results': search_results})

@login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
def detail_view(request):
    user = request.user
    print("user: ", user)
    if user:
        # Serialize user data
        data = {
            'username': user.username,
            'playername': user.playername,
            'email': user.email,
            'avatar': user.avatar.url if user.avatar else None,
            'friends_count': user.friends.count(),
            'two_factor_method': user.two_factor_method,

        }
        # return render(request, 'detail.html', {'data': data})
        return JsonResponse(data)
    else:
        return JsonResponse({'error': 'User not found'}, status=404)
    # else:
    #     return JsonResponse({'error': 'User ID not found in token'}, status=401)
    # else:
    #     return JsonResponse({'error': 'Access token is missing'}, status=401)
    # return render(request, 'detail.html', {'data': data})

@login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([CustomJWTAuthentication])
def add_friend(request, username):
    try:
        friend = get_object_or_404(User, username=username)
        request.user.add_friend(friend)
        return JsonResponse({'message': 'Friend added successfully', 'added_friend': friend.username})
    except Http404:
        return JsonResponse({'error': 'Friend not found'}, status=404)
    
@login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([CustomJWTAuthentication])
def remove_friend(request, username):
    try:
        friend = get_object_or_404(User, username=username)
        request.user.friends.remove(friend)
        return JsonResponse({f'message': '{username} removed from your friend list successfully', 'removed_friend': username})
    except Http404:
        return JsonResponse({'error': 'Friend not found'}, status=404)

# @login_required
# @ensure_csrf_cookie
# @csrf_protect
# @api_view(['GET', 'POST'])
# @authentication_classes([CustomJWTAuthentication])
# def profile_update_view(request):
#     user = request.user
#     if request.method == 'POST':
#         user_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
#         if user_form.is_valid():
#             user = user_form.save(commit=False)
#             if 'two_factor_method' in request.POST:
#                 if request.POST['two_factor_method'] == '':
#                     user.two_factor_method = None
#                 else:
#                     user.two_factor_method = request.POST['two_factor_method']
#             if User.objects.filter(playername=user.playername).exclude(username=request.user.username).exists():
#                 return JsonResponse({'error': 'Playername already exists. Please choose a different one.'})
#             else:
#                 user.save()    
#                 return JsonResponse({'success': 'Your profile has been updated.'})
#         else:
#             return JsonResponse({'error': 'Form is not valid.'}, status=400)
#     else:
#         user_form = ProfileUpdateForm(instance=request.user)
#         print("user_form: ", user_form)
#         # serialized_form = model_to_dict(user_form.instance)
#         serialized_form = model_to_dict(user_form.instance, fields=['id', 'username', 'playername', 'avatar', 'email', 'phone', 'two_factor_method'])
#         if 'avatar' in serialized_form:
#             avatar_url = request.build_absolute_uri(user_form.instance.avatar.url)
#             serialized_form['avatar'] = avatar_url
#         return JsonResponse({'form': serialized_form})


class ProfileUpdateView(generics.ListCreateAPIView):
    serializer_class = ProfileUSerSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_form = ProfileUpdateForm(instance=request.user)
        serialized_form = model_to_dict(user_form.instance, fields=['id', 'username', 'playername', 'avatar', 'email', 'phone', 'two_factor_method'])
        if 'avatar' in serialized_form:
            avatar_url = request.build_absolute_uri(user_form.instance.avatar.url)
            serialized_form['avatar'] = avatar_url
        serialized_form['username'] = user_form.instance.username
        # return JsonResponse({'form': serialized_form})
        return Response(serialized_form)

    def post(self, request):
        user = request.user
        print("request.FILES: ", request.POST)
        user_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        print("user_form: ", user_form)
        if user_form.is_valid():
            user = user_form.save(commit=False)
            if 'two_factor_method' in request.POST:
                if request.POST['two_factor_method'] == '':
                    user.two_factor_method = None
                else:
                    user.two_factor_method = request.POST['two_factor_method']
            if request.POST['playername'] != '':
                if User.objects.filter(playername=user.playername).exclude(username=request.user.username).exists():
                    return JsonResponse({'error': 'Playername already exists. Please choose a different one.'})
            else:
                user.save()    
                return JsonResponse({'success': 'Your profile has been updated.'})
        else:
            return JsonResponse({'error': 'Form is not valid.'}, status=400)

class PasswordUpdateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def get_queryset(self):
        return []
    def get(self, request):
        serializer = self.get_serializer(data={})
        serializer.is_valid(raise_exception=True)
        fields = serializer.data
        return Response(fields)

    def post(self, request):
        form = CustomPasswordChangeForm(request.user, request.POST)
        if form.is_valid():
            form.save()
            request.user.save()
            messages.success(request, 'Your password has changed successfully. Please login again.')
            return JsonResponse({'success': True, 'message': "Please login again"}) # needed to redirect to login homepage
        else:
            errors = form.error_messages
            return JsonResponse({'error': f'Form is not valid: {errors}'}, status=400)


class TokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )

token_generator = TokenGenerator()

# @ensure_csrf_cookie
# @csrf_protect
# # @require_POST
# @authentication_classes([])
# @permission_classes([AllowAny])
# def send_password_reset_link(request):
class SendResetLinkView(generics.ListCreateAPIView):
    token_generator = TokenGenerator()  

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SimpleUserSerializer
        elif self.request.method == 'POST':
            return SendResetLinkSerializer
        return SimpleUserSerializer

    def get(self, request):
        fields = {
            'username': 'username',
            }
        serializer = SimpleUserSerializer(data=request.data)
        if serializer.is_valid():
            return Response({'message': 'Reset link sent successfully'}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
    # if request.method == 'POST':
        serializer = SendResetLinkSerializer(data=request.POST)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return JsonResponse({'success': False, 'error': escape('User not found')})

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = token_generator.make_token(user)

            reset_url = request.build_absolute_uri(reverse_lazy('account:password_reset', kwargs={'uidb64': uid, 'token': token}))
            print("reset_link: ", reset_url)

            print("\n\nCHECK UNIQUE TOKEN: ", token)
            subject = 'Pong Password Reset'
            email_content = render_to_string('password_reset_email.html', {'reset_url': reset_url, 'user': user})
            from_email = 'no-reply@student.42.fr' 
            to_email = user.email
            send_mail(subject, email_content, from_email, [to_email], fail_silently=False)

            return JsonResponse({'success': True, 'message': escape('Password reset link sent successfully')})
        else:
            return JsonResponse({'success': False, 'errors': serializer.errors}, status=400)


class PasswordResetView(generics.ListCreateAPIView):
    token_generator = TokenGenerator()  
    serializer_class = PasswordResetSerializer
    # permission_classes = [IsAuthenticated]

    def post(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and self.token_generator.check_token(user, token):
            form = CustomPasswordResetForm(user=user, data=request.POST)
            if form.is_valid():
                form.save()
                user = authenticate(request, username=user.username, password=form.cleaned_data['new_password1'])
                return JsonResponse({'success': True, 'message': escape('Password reset successfully')})
            else:
                return JsonResponse({'success': False, 'error': escape(form.errors)}, status=400)
        else:
            return JsonResponse({'success': False, 'error': escape('Invalid password reset link')}, status=400)

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            print("uid:::: ", uid)
            user = User.objects.get(id=uid)
            print("user: ", user)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and self.token_generator.check_token(user, token):
            serializer = self.get_serializer(data={})
            serializer.is_valid(raise_exception=True)
            fields = serializer.data
            return Response(fields)
        else:
            return JsonResponse({'success': False, 'error': escape('Invalid password reset link')}, status=400)


        
        

def password_reset_done(request):
    html = render_to_string('password_reset_done.html')
    # return render(request, 'password_reset_done.html')
    return JsonResponse({'html': html})

class UserAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # queryset = User.objects.all()
        # serializer = UserSerializer(queryset, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"detail": escape("User not found")}, status=status.HTTP_404_NOT_FOUND)


def print_all_user_data(request):
    all_users = User.objects.all().order_by('id')
    context = {'users': all_users}

    return render(request, 'print_user_data.html', context)

def smsTest(request):
    return render(request, 'smsTest.html')


sns_client = boto3.client('sns',
                          aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                          aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                          region_name=settings.AWS_REGION)

def is_valid_phone_number(phone_number):
    phone_number_pattern = r'^\+\d{1,15}$'
    return bool(re.match(phone_number_pattern, phone_number))


@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([])
@permission_classes([AllowAny])
def send_sms_code(request, phone_number=None):
    if request.method == 'POST':
        if phone_number is None:
            phone_number = request.POST.get('phone_number', '')
        print("Send SMS Func, phone_number: ", phone_number)
        if not is_valid_phone_number(phone_number):
            return JsonResponse({'success': False, 'error': 'Invalid phone number format'}, status=400)

        one_time_code = generate_one_time_code()
        request.session['one_time_code'] = one_time_code

        print("\n\nCHECK CODE ON SESSION: ", request.session.get('one_time_code'))
        message = f'Pong! Your one-time code is: {one_time_code}'

        subscription_arn = subscribe_user_to_sns_topic(phone_number)
        
        if subscription_arn:
            try:
                response = sns_client.publish(
                    PhoneNumber=phone_number,
                    Message=message,
                )
                print("SMS message sent successfully:")
                return JsonResponse({'success': True, 'message': 'SMS message sent successfully'})
            except Exception as e:
                print("Error sending SMS message:", e)
                return JsonResponse({'success': False, 'error': 'Failed to send SMS message'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)

def subscribe_user_to_sns_topic(phone_number):
    try:
        topic_arn = 'arn:aws:sns:eu-west-3:637423363839:verification_code_for_Pong'

        subscriptions = sns_client.list_subscriptions_by_topic(TopicArn=topic_arn)['Subscriptions']
        for subscription in subscriptions:
            if subscription['Protocol'] == 'sms' and subscription['Endpoint'] == phone_number:
                print(f"User is already subscribed with subscription ARN: {subscription['SubscriptionArn']}")
                return subscription['SubscriptionArn']

        response = sns_client.subscribe(
            TopicArn=topic_arn,
            Protocol='sms',
            Endpoint=phone_number
        )
        subscription_arn = response['SubscriptionArn']
        print(f"User subscribed successfully! Subscription ARN: {subscription_arn}")

        return subscription_arn

    except Exception as e:
        print("Error subscribing user:", e)
        return None

@login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([CustomJWTAuthentication])
def update_sandbox(request, phone_number=None):
    if request.method == 'POST':
        if phone_number is None:
            phone_number = request.POST.get('phone_number', '')
            print("phone_number: ", phone_number)
        if phone_number == request.user.phone:
            return JsonResponse({'success': True, 'message': 'Your number is already verified', 'verified': True})
        if not is_valid_phone_number(phone_number):
            return JsonResponse({'success': False, 'error': 'Invalid phone number format'}, status=400)
        if is_phone_number_verified(phone_number):
            return JsonResponse({'success': True, 'message': 'Your number is already verified', 'verified': True})
        # Add phone number to 'Sandbox destination phone numbers andd send OTP'
        try:
            sns_client.create_sms_sandbox_phone_number(
                PhoneNumber=phone_number,
                LanguageCode='en-US'  # Adjust language code as needed
            )
            print("Phone number added to Sandbox destination phone numbers and OTP sent successfully:")
            return JsonResponse({'success': True, 'message': 'SMS message sent successfully'})
        except Exception as e:
            print("Error adding phone number to Sandbox destination phone numbers:", e)
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

@login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([])
@permission_classes([AllowAny])
def verify_sandBox(request, otp=None, phone_number=None):
    print("\n--Verify SandBox\n")
    if request.method == 'POST':
        if phone_number is None:
            phone_number = request.POST.get('phone_number', '')
            print("phone_number: ", phone_number)
        if otp is None:
            otp = request.POST.get('otp', '')
            print("otp: ", otp)
        # Verify phone number in the SMS sandbox
        try:
            response = sns_client.verify_sms_sandbox_phone_number(
                PhoneNumber=phone_number,
                OneTimePassword=otp
            )
            print("Phone number verified in the SMS sandbox:", phone_number)
            return JsonResponse({'success': True, 'message': 'Phone number verified'})
        except Exception as e:
            print("Error verifying phone number in the SMS sandbox:", e)
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def is_phone_number_verified(phone_number):
    try:
        response = sns_client.list_sms_sandbox_phone_numbers()
        phone_numbers = response.get('PhoneNumbers', [])
        for number in phone_numbers:
            if number['PhoneNumber'] == phone_number and number['Status'] == 'Verified':
                return True
        return False
    except Exception as e:
        print("Error listing SMS sandbox phone numbers:", e)
        return False

@login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@authentication_classes([CustomJWTAuthentication])
def update_phone(request, phone_number=None):
    user = request.user
    if phone_number is None:
        phone_number = request.POST.get('phone_number', '')
        print("phone_number: ", phone_number)
    try:
        user.phone = phone_number
        user.save()
        return JsonResponse({})
    except Exception as e:
        print("Error saving phone number message:", e)
        return JsonResponse({}, status=400) 
