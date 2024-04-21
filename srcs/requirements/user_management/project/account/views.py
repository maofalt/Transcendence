from .models import User
from django import forms
from .forms import CustomPasswordResetForm, ProfileUpdateForm, PasswordUpdateForm, CustomPasswordChangeForm, CustomPasswordResetForm
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView, PasswordResetDoneView
from django.db.utils import IntegrityError
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
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
import re
import hashlib
from urllib.parse import urlencode
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.forms.models import model_to_dict
from .authentication import CustomJWTAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import serializers, generics, permissions, status, authentication, exceptions, viewsets
from rest_framework.generics import ListAPIView
# from rest_framework.exceptions import AuthenticationFailed
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

def init_view(request):
    print("===Now serveer has running with CSRF protection===")
    return JsonResponse({'csrfToken': get_token(request)}, status=200)

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([CustomJWTAuthentication])
@api_view(['GET'])
# @permission_classes([IsAuthenticated])
def get_user(request):

    user = request.user
    # print("User: ", user.username)
    avatar_data = None
    try:
        if user.avatar:
            with open(user.avatar.path, "rb") as image_file:
                avatar_data = base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

    secret_key = settings.SECRET_KEY
    original_playername = jwt.decode(user.playername, secret_key, algorithms=['HS256'])['playername']

    user_data = {
        'user_id': user.id,
        'username': user.username,
        'last_valid_time': user.last_valid_time.timestamp(),
        'avatar': avatar_data,
        'playername': original_playername
    }
    return JsonResponse(user_data)

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
# call this function from frontend everytime user calls any API
def check_refresh(request):
    refreshToken = request.COOKIES.get('refreshToken', None)

    if not refreshToken:
        return JsonResponse({'error': 'Refresh token is missing'}, status=400)
    
    exp_datetime = None
    response = refresh_accessToken(request, refreshToken)
    return response


@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
def refresh_accessToken(request, refreshToken):
    try:
        decoded_refresh_token = jwt.decode(refreshToken, settings.SECRET_KEY, algorithms=["HS256"])
        # print("DECODED REFRESHTOKEN: ", decoded_refresh_token)
        uid = decoded_refresh_token['user_id']
        user = get_object_or_404(User, pk=uid)
        local_tz = pytz.timezone('Europe/Paris')
        user.last_valid_time = timezone.now()
        user.save()
        last_valid_time = user.last_valid_time.timestamp()
        print_time = datetime.datetime.fromtimestamp(last_valid_time, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("User last_valid_time updated: ", print_time)
        # user.last_valid_time = timezone.now().replace(microsecond=0)
        
        refresh = RefreshToken(refreshToken)
        access_token_lifetime = timezone.now() + timedelta(minutes=3)  
        access = refresh.access_token
        access['username'] = user.username
        access['exp'] = int(access_token_lifetime.replace(tzinfo=pytz.UTC).timestamp())
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
            print("2FA : ", user.two_factor_method)
            if (user.two_factor_method != 'off'):
                if (user.two_factor_method == 'email'):
                    original_email = jwt.decode(user.email, settings.SECRET_KEY, algorithms=['HS256'])['email']
                    response = send_one_time_code(request, original_email)
                    print("RESPONSE: ", response)
                    if response.status_code == 200:
                        return JsonResponse({'success': True, 'requires_2fa': True})
                elif(user.two_factor_method == 'sms'):
                    response = send_sms_code(request, user.phone)
                    if response.status_code == 200:
                        return JsonResponse({'success': True, 'requires_2fa': True})
                return JsonResponse({'success': False, 'requires_2fa': True}, status=400)
            else:
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
    access_token_lifetime = timezone.now() + timedelta(minutes=3)  
    accessToken = AccessToken.for_user(user)
    accessToken['username'] = user.username
    accessToken['exp'] = int(access_token_lifetime.replace(tzinfo=pytz.UTC).timestamp())
    print("---> ACCESS TOKEN: ", str(accessToken))
    if user.two_factor_method == 'off':
        twoFA = False
        login(request, user)
        user.is_online = True
        user.save()
    else:
        twoFA = True
    refresh_token_lifetime = timezone.now() + timedelta(days=14)
    refreshToken = RefreshToken.for_user(user)
    refreshToken['exp'] = int(refresh_token_lifetime.replace(tzinfo=pytz.UTC).timestamp())

    exp_accessToken = None
    try:
        secret_key = settings.SECRET_KEY
        decodedToken = jwt.decode(str(accessToken), secret_key, algorithms=["HS256"])
        local_tz = pytz.timezone('Europe/Paris')
        exp_timestamp_accessToken = decodedToken['exp']
        exp_accessToken = datetime.datetime.fromtimestamp(exp_timestamp_accessToken, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("Expiration time of ACCESS token:", exp_accessToken)
        # user.last_valid_time = timezone.now().replace(microsecond=0)
        user.last_valid_time = timezone.now()
        last_valid_time = user.last_valid_time.timestamp()
        print_time = datetime.datetime.fromtimestamp(last_valid_time, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("User last_valid_time updated: ", print_time)
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
        'message': 'User authenticated successfully',
        'requires_2fa': twoFA,
        'access_token': str(accessToken),
        'token_type': 'Bearer',
        'expires_in': expires_in,
        'exp_datetime': exp_accessToken
    }
    
    print("expires_in: ", expires_in,  "exp_datetime : ", exp_accessToken)
    response = JsonResponse(response_data, status=200)
    response.set_cookie('refreshToken', refreshToken, httponly=True, secure=True, samesite='Strict')
    
    return response

def generate_one_time_code():
    return get_random_string(length=6, allowed_chars='1234567890')

@ensure_csrf_cookie
@csrf_protect
@authentication_classes([])
@permission_classes([AllowAny])
def send_one_time_code(request, email=None):
    print("\n\nEMAIL SENDING")
    if email is None and request.method == 'POST':
        email = request.POST.get('email', None)
    
    one_time_code = generate_one_time_code()
    request.session['one_time_code'] = one_time_code

    print("\n\nCHECK CODE ON SESSION: ", request.session.get('one_time_code'))
    subject = 'Your Access Code for PONG'
    message = f'Pong! Your one-time code is: {escape(one_time_code)}'
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
        # csrf_token = get_token(request)
        submitted_code = request.POST.get('one_time_code')
        stored_code = request.session.get('one_time_code')
        context = request.POST.get('context')
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
                    return generate_tokens_and_response(request, user)
                if context == 'update' or context == 'signup':
                    if 'email' in request.POST:
                        email = request.POST['email']
                        request.session['verified_email'] = email
                    else:
                        return JsonResponse({'success': False, 'error': escape('missing email for verify_one_time_code')}, status=400)
                    return JsonResponse({'success': True, 'message': escape('One-time code verification successful')}, status=200)
            else:
                return JsonResponse({'success': False, 'error': escape('One-time code verification failed')}, status=400)
        else:
            return JsonResponse({'success': False, 'error': escape('User authentication not found')}, status=400)

    return JsonResponse({'success': False, 'error': escape('Invalid request method')}, status=400)

def get_serializer(user):
    if user.is_authenticated:
        return UserSerializer(user)
    else:
        return AnonymousUserSerializer()

@csrf_protect
# @login_required
# @require_POST
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def api_logout_view(request):
    if request.method == 'POST':
        request.user.is_online = False
        request.user.save()
        print(request.user.username, ": is_online status", request.user.is_online)
        logout(request)
        serializer = get_serializer(request.user)
        redirect_url = "/"
        response_data = {'redirect_url': escape(redirect_url)}
        return JsonResponse(response_data)
    else:
        return JsonResponse({'error': escape('Invalid request method')}, status=400)


# ---------------------- API signup functions ------------------------------
def validate_not_contains_forbidden_word(value):
    forbidden_words = ["admin", "root", "superuser"]
    if any(forbidden_word in value.lower() for forbidden_word in forbidden_words):
        raise ValidationError("Username contains a forbidden word.")

def validate_username(username):
    validators = [
        MinLengthValidator(3, message="Username must be at least 3 characters long."),  # Minimum length
        MaxLengthValidator(20, message="Username must be less than 20 characters long."),  # Maximum length
        RegexValidator(r'^\w+$', message="Username must be alphanumeric."),  # Alphanumeric characters only
        validate_not_contains_forbidden_word,
    ]

    # Run each validator on the username
    for validator in validators:
        try:
            validator(username)
        except ValidationError as e:
            return False, e.message

    if User.objects.filter(username=username).exists():
        return False, "Username already exists."

    return True, None

def is_email_valid(email):
    try:
        validate_email(email)
    except ValidationError:
        return False, "Invalid email format."

    encoded_email = jwt.encode({'email': email}, settings.SECRET_KEY, algorithm='HS256')
    if User.objects.filter(email=encoded_email).exists():
        return False, "Email already in use."

    return True, None  # No error message needed on success

def validate_user_password(password, username=""):
    try:
        # Assuming the user instance might be useful for some validators
        user = User(username=username) if username else None
        validate_password(password, user=user)
        return True, None  # No error message needed on success
    except ValidationError as e:
        # Join all error messages into a single string or handle them as you see fit
        error_message = " ".join(e.messages)
        return False, error_message

def validate_player_name(playername):
    # This regex allows alphanumeric characters, dashes, and underscores
    if re.match(r'^[\w\s-]+$', playername):
        return True, None
    return False, "Player name contains invalid characters."

# --------------------------------- API functions views ---------------------------

def validate_username_view(request):
    if request.method == "POST":
        username = request.POST.get("username", "")
        valid, error_message = validate_username(username)
        if valid:
            return JsonResponse({'valid': True})
        else:
            return JsonResponse({'valid': False, 'error': error_message}, status=400)
    return JsonResponse({'error': escape('Invalid request method')}, status=400)

def validate_email_view(request):
    if request.method == "POST":
        email = request.POST.get("email", "")
        valid, error_message = is_email_valid(email)
        if valid:
            return JsonResponse({'valid': True})
        else:
            return JsonResponse({'valid': False, 'error': error_message}, status=400)
    return JsonResponse({'error': escape('Invalid request method')}, status=400)

def validate_password_view(request):
    if request.method == "POST":
        password = request.POST.get("password", "")
        valid, error_message = validate_user_password(password)
        if valid:
            return JsonResponse({'valid': True})
        else:
            return JsonResponse({'valid': False, 'error': error_message}, status=400)
    return JsonResponse({'error': escape('Invalid request method')}, status=400)

def validate_player_name_view(request):
    if request.method == "POST":
        playername = request.POST.get("playername", "")
        valid, error_message = validate_player_name(playername)
        if valid:
            return JsonResponse({'valid': True})
        else:
            return JsonResponse({'valid': False, 'error': error_message}, status=400)
    return JsonResponse({'error': escape('Invalid request method')}, status=400)

@csrf_protect
# @require_POST
# create a function for each element, take the input as a argument and returns true of false and create a endpoint for each elements
@authentication_classes([])
@permission_classes([AllowAny])
def api_signup_view(request):
    if request.method == "POST":
        username = request.POST["username"] #unique need to be verified
        password = request.POST["password"]
        playername = request.POST["playername"] 
        email = request.POST["signupEmail"]

        # Validate each field using the utility functions
        valid, error_message = validate_username(username)
        if not valid:
            return JsonResponse({'success': False, 'error': error_message}, status=400)

        valid, error_message = is_email_valid(email)
        if not valid:
            return JsonResponse({'success': False, 'error': error_message}, status=400)

        valid, error_message = validate_user_password(password, username)
        if not valid:
            return JsonResponse({'success': False, 'error': error_message}, status=400)

        valid, error_message = validate_player_name(playername)
        if not valid:
            return JsonResponse({'success': False, 'error': error_message}, status=400)

        if not (username and password and playername and email):
            return JsonResponse({'success': False, 'error': escape('All fields are required')}, status=400)

        verified_email = request.session.get('verified_email')
        print("verified_email: ", verified_email)
        if verified_email:
            if verified_email != email:
                # del request.session['verified_email']
                return JsonResponse({'error': 'Submitted email does not match the verified email.'})
            del request.session['verified_email']
        else:
            return JsonResponse({'error': 'verify your email'}, status=400)

        secret_key = settings.SECRET_KEY
        tokenized_playername = jwt.encode({'playername': playername}, secret_key, algorithm='HS256')
        tokenized_email = jwt.encode({'email': email}, secret_key, algorithm='HS256')

        # Create the user
        user = User(
            username=username,
            email=tokenized_email,
            password=make_password(password),
            playername=tokenized_playername,
        )

        try:
            user.save()
        except IntegrityError as e:
            return JsonResponse({'success': False, 'error': escape('User creation failed.')}, status=400)

        print(" >>  User created successfully.")
        print("User: ", user)

        login(request, user)
        user.is_online = True
        user.save()
        return generate_tokens_and_response(request, user)
        # return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error': escape('Invalid request method')}, status=400)


# @require_POST
# @login_required
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_account(request):
    user = request.user
    try:
        request.user.delete()
        logger.info(f"User {user.username} deleted successfully.")
        
        return JsonResponse({'success': True, 'message': escape('Account deleted successfully')})
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

# @login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def settings_view(request):
    return JsonResponse({})

# @login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def friends_view(request):
    user = request.user
    friends = user.friends.all()

    friend_data = FriendUserSerializer(friends, many=True).data

    current_time = int(timezone.now().timestamp())
    for friend_info in friend_data:
        friend = friends.get(username=friend_info['username'])
        last_valid_time = friend.last_valid_time.timestamp()
        local_tz = pytz.timezone('Europe/Paris')
        print_time = datetime.datetime.fromtimestamp(last_valid_time, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("Freinds : last_valid_time: ", print_time)
        print("difference: ", (current_time - last_valid_time))
        if friend.is_online == True and (current_time - last_valid_time) > 185:
            friend_info['is_online'] = False
            friend.is_online = False
            friend.save()

        if friend_info['avatar']:
            friend_info['avatar'] = urljoin(settings.MEDIA_URL, friend_info['avatar'])

    search_query = request.GET.get('search')
    search_results = []
    print("search_query: ", search_query, "user.username: ", user.username)
    if search_query is not None and search_query != user.username:
        if search_query:
            print(search_query)
            # search_results = User.objects.filter(username__icontains=search_query)
            search_results = list(User.objects.filter(username__icontains=search_query).values())
            print("search_resuls : ", search_results)
        search_results_serialized = FriendUserSerializer(search_results, many=True).data
        return JsonResponse({'friends': friend_data, 'search_query': escape(search_query), 'search_results': search_results_serialized})
    return JsonResponse({'friends': friend_data})

    # return render(request, 'friends.html', {'friends': friend_data, 'search_query': search_query, 'search_results': search_results})

# @login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['GET'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([AllowAny])
def detail_view(request, username=None):
    try:
        if username:
            try:
                user = get_object_or_404(User, username=username)
            except Http404:
                return JsonResponse({'error': 'User not found'}, status=404)
        else:
            user = request.user
            
        secret_key = settings.SECRET_KEY
        email = jwt.decode(user.email, secret_key, algorithms=['HS256'])['email'] if username is None else None
        phone = user.phone if username is None else None
        original_playername = jwt.decode(user.playername, secret_key, algorithms=['HS256'])['playername']

        # print("user: ", user)
        data = {
            'username': user.username,
            'playername': original_playername,
            'email': email,
            'phone': phone,
            'avatar': user.avatar.url if user.avatar else None,
            'friends_count': user.friends.count(),
            'two_factor_method': user.two_factor_method,
        }
        return JsonResponse(data)
    except Http404:
        return JsonResponse({'error': 'User not found'}, status=404)


# @login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def add_friend(request, username):
    try:
        friend = get_object_or_404(User, username=username)
        ret, message = request.user.add_friend(friend)
        if not ret:
            return JsonResponse({'error': message}, status=400)
        return JsonResponse({'message': 'Friend added successfully', 'added_friend': friend.username})
    except Http404:
        return JsonResponse({'error': 'User not found'}, status=404)
    
# @login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
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


class ProfileUpdateView(APIView):
    serializer_class = ProfileUSerSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_form = ProfileUpdateForm(instance=request.user)
        serialized_form = model_to_dict(user_form.instance, fields=['id', 'username', 'playername', 'avatar', 'email', 'phone', 'two_factor_method'])
        if 'avatar' in serialized_form:
            avatar_url = request.build_absolute_uri(user_form.instance.avatar.url)
            serialized_form['avatar'] = avatar_url
        serialized_form['username'] = user_form.instance.username
        print("serialized_form: \n", serialized_form)
        return Response(serialized_form)

    # def post(self, request):
    #     user = request.user
    #     user_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
    #     print ("avartar : ", user.avatar)
    #     print("POST data received:", request.POST)
    #     try:
    #         print("-----------------------------------------------------")
    #         print("user_form: ", user_form)
    #         user_form.is_valid()
    #         print("-----------------------------------------------------")
    #         if 'playername' in request.POST and request.POST['playername'] != '':
    #             valid, error_message = validate_player_name(request.POST.get('playername'))
    #             if not valid:
    #                 return JsonResponse({'error': error_message}, status=400)
    #         if 'email' in request.POST and request.POST['email'] != '':    
    #             valid, error_message = is_email_valid(request.POST.get('email'))
    #             if not valid:
    #                 return JsonResponse({'error': error_message}, status=400)
    #             verified_email = request.session.get('verified_email')
    #             submitted_email = request.POST.get('email')
    #             if verified_email:
    #                 if submitted_email and verified_email != submitted_email:
    #                     # del request.session['verified_email']
    #                     return JsonResponse({'error': 'Submitted email does not match the verified email.'}, status=400)
    #                 del request.session['verified_email']
    #             else:
    #                 return JsonResponse({'error': 'verify your email'}, status=400)

    #         if 'phone' in request.POST and request.POST['phone'] != '':
    #             if not is_valid_phone_number(request.POST.get('phone')):
    #                 return JsonResponse({'error': 'Invalid phone number format'}, status=400)
 
    #             verified_phone = request.session.get('verified_phone')
    #             submitted_phone = request.POST.get('phone')
    #             if verified_phone:
    #                 if submitted_phone and verified_phone != submitted_phone:
    #                     return JsonResponse({'error': 'Submitted phone number does not match the verified phone number'}, status=400)
    #                 del request.session['verified_phone']
    #             else:
    #                 return JsonResponse({'error': 'verify your phone number'}, status=400)
    #         print("-----------------------------------------------------")
    #         user_form.save()
    #         return JsonResponse({'success': 'Your profile has been updated.'})
    #     except ValidationError as e:
    #         return JsonResponse({'error': str(e)}, status=400)
    #     except Exception as e:
    #         print("Error: ", e)
    #         return JsonResponse({'error': 'Form is not valid.'}, status=400)

    def post(self, request):
        user = request.user
        
        # Validate playername
        if 'playername' in request.POST and request.POST['playername'] != '':
            valid, error_message = validate_player_name(request.POST.get('playername'))
            if not valid:
                return JsonResponse({'error': error_message}, status=400)
        
        # Validate email
        if 'email' in request.POST and request.POST['email'] != '':
            valid, error_message = is_email_valid(request.POST.get('email'))
            if not valid:
                return JsonResponse({'error': error_message}, status=400)
            
            verified_email = request.session.get('verified_email')
            submitted_email = request.POST.get('email')
            if verified_email:
                if submitted_email and verified_email != submitted_email:
                    # del request.session['verified_email']
                    return JsonResponse({'error': 'Submitted email does not match the verified email.'}, status=400)
                del request.session['verified_email']
            else:
                return JsonResponse({'error': 'verify your email'}, status=400)

        # Validate phone
        if 'phone' in request.POST and request.POST['phone'] != '':
            if not is_valid_phone_number(request.POST.get('phone')):
                return JsonResponse({'error': 'Invalid phone number format'}, status=400)

            verified_phone = request.session.get('verified_phone')
            submitted_phone = request.POST.get('phone')
            if verified_phone:
                if submitted_phone and verified_phone != submitted_phone:
                    return JsonResponse({'error': 'Submitted phone number does not match the verified phone number'}, status=400)
                del request.session['verified_phone']
            else:
                return JsonResponse({'error': 'verify your phone number'}, status=400)
        
        mutable_post = request.POST.copy()
        playername = request.POST.get('playername')
        email = request.POST.get('email')
        print("POST data received:", request.POST)
        # Encode the playername and email
        if playername and playername != '':
            encoded_playername = jwt.encode({'playername': playername}, settings.SECRET_KEY, algorithm='HS256')
            mutable_post['playername'] = encoded_playername
        if email and email != '':
            encoded_email = jwt.encode({'email': email}, settings.SECRET_KEY, algorithm='HS256')
            mutable_post['email'] = encoded_email
        
        user_form = ProfileUpdateForm(mutable_post, request.FILES, instance=request.user)

        try:
            if user_form.is_valid():
                user_form.save()
                return JsonResponse({'success': 'Your profile has been updated.'})
            else:
                print("Form errors:", user_form.errors)
                return JsonResponse({'errors': user_form.errors}, status=400)
        except ValidationError as e:
            print("Validation Error:", e)
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            print("Save Error:", e)
            return JsonResponse({'error': 'An error occurred while updating your profile.'}, status=500)


class PasswordUpdateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def get_queryset(self):
        return []
    def get(self, request):
        serializer = self.get_serializer(data={})
        serializer.is_valid(raise_exception=True)
        fields = escape(serializer.data)
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
            
            # reset_url = request.build_absolute_uri(reverse_lazy('account:password_reset', kwargs={'uidb64': uid, 'token': token}))
            reset_url = request.build_absolute_uri('/forgot?{}'.format(urlencode({'token': token, 'uidb': uid})))
            print("reset_link: ", reset_url)
            
            secret_key = settings.SECRET_KEY
            original_email = jwt.decode(user.email, secret_key, algorithms=['HS256'])['email']

            print("\n\nCHECK UNIQUE TOKEN: ", token)
            subject = 'Pong Password Reset'
            email_content = render_to_string('password_reset_email.html', {'reset_url': reset_url, 'user': user})
            from_email = 'no-reply@student.42.fr' 
            to_email = original_email
            send_mail(subject, email_content, from_email, [to_email], fail_silently=False)

            return JsonResponse({'success': True, 'message': escape('Password reset link sent successfully')})
        else:
            return JsonResponse({'success': False, 'errors': serializer.errors}, status=400)


class PasswordResetView(generics.ListCreateAPIView):
    token_generator = TokenGenerator()  
    serializer_class = PasswordResetSerializer
    authentication_classes = []
    # permission_classes = [IsAuthenticated]

    def post(self, request, uidb64, token):
        # uidb64 = request.query_params.get('uidb')
        # token = request.query_params.get('token')
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
        # uidb64 = request.query_params.get('uidb')
        # token = request.query_params.get('token')
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            # print("uid:::: ", uid)
            user = User.objects.get(id=uid)
            # print("user: ", user)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and self.token_generator.check_token(user, token):
            serializer = self.get_serializer(data={})
            serializer.is_valid(raise_exception=True)
            fields = escape(serializer.data)
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
            escaped_data = escape(serializer.data)
            return Response(escaped_data, status=status.HTTP_200_OK)
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
@api_view(['POST'])
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
        message = f'Pong! Your one-time code is: {escape(one_time_code)}'

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

# @login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def update_sandbox(request, phone_number=None):
    if request.method == 'POST':
        if phone_number is None:
            phone_number = request.POST.get('phone_number', '')
            print("phone_number: ", phone_number)
        if not is_valid_phone_number(phone_number):
            return JsonResponse({'success': False, 'error': 'Invalid phone number format'}, status=400)
        if phone_number == request.user.phone or is_phone_number_verified(phone_number):
            request.session['verified_phone'] = phone_number
            return JsonResponse({'success': True, 'message': 'Your number is already verified', 'verified': True})

        # if is_phone_number_verified(phone_number):
        #     return JsonResponse({'success': True, 'message': 'Your number is already verified', 'verified': True})
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

# @login_required
@ensure_csrf_cookie
@csrf_protect
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_sandBox(request, phone_number=None, otp=None):
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
            request.session['verified_phone'] = phone_number
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

# @login_required
@ensure_csrf_cookie
@csrf_protect
# @require_POST
@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsAuthenticated])
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
