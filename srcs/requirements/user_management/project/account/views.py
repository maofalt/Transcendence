from .models import User
from django import forms
from .forms import ProfileUpdateForm, PasswordUpdateForm
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView, PasswordResetDoneView
from gameHistory_microservice.models import GameStats
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
from django.utils import timezone
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

# from django.utils.encoding import force_bytes, force_str

#JWT
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer, AnonymousUserSerializer
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

logger = logging.getLogger(__name__)
User = get_user_model()

def home(request):
    return render(request, 'home.html')

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
            }
            return JsonResponse(user_data)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

    except jwt.ExpiredSignatureError:
        return JsonResponse({'error': 'Refresh token has expired'}, status=400)
    except jwt.InvalidTokenError:
        return JsonResponse({'error': 'Invalid refresh token'}, status=400)

# call this function from frontend everytime user calls any API
def check_refresh(request):
    accessToken = request.headers.get('Authorization', None)
    refreshToken = request.COOKIES.get('refreshToken', None)
    print("accessToken print: ", str(accessToken))
    # if not accessToken or not refreshToken:
    #     return JsonResponse({'error': 'Missing tokens'}, status=400)

    if not accessToken:
        return JsonResponse({'error': 'Authorization header is missing'}, status=400)
    if not refreshToken:
        return JsonResponse({'error': 'Refresh token is missing'}, status=400)
    
    exp_datetime = None
    try:
        decoded_token = jwt.decode(accessToken.split()[1], settings.SECRET_KEY, algorithms=["HS256"])
        local_tz = pytz.timezone('Europe/Paris')
        exp_timestamp = decoded_token['exp']
        exp_datetime = datetime.datetime.fromtimestamp(exp_timestamp, tz=pytz.utc).astimezone(local_tz).strftime('%Y-%m-%d %H:%M:%S')
        print("exp_datetime: ", exp_datetime)
        
        return JsonResponse({'message': 'Access token is still valid'})

    except jwt.ExpiredSignatureError:
        print("Access token has expired")
        try:
            decoded_refresh_token = jwt.decode(refreshToken, settings.SECRET_KEY, algorithms=["HS256"])
            print("DECODED REFRESHTOKEN: ", decoded_refresh_token)
            uid = decoded_refresh_token['user_id']
            user = User.objects.get(pk=uid)
            user.last_valid_time = timezone.now().replace(microsecond=0)
            user.save()
            refresh = RefreshToken(refreshToken)
            access = refresh.access_token
            access['username'] = user.username
            new_accessToken = str(access)

            current_time = timezone.now()
            expiration_time = datetime.datetime.fromtimestamp(access['exp'], tz=pytz.utc)
            expires_in = (expiration_time - current_time).total_seconds()
            local_tz = pytz.timezone('Europe/Paris')
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
            response = JsonResponse(response_data)
            return response
        # return JsonResponse({'error': 'Access token has expired'}, status=401)
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Access/Refresh token has expired'}, status=401)

    except jwt.InvalidTokenError:
        print("Invalid token")
        return JsonResponse({'error': 'Invalid token'}, status=401)

    except Exception as e:
        print("An error occurred:", e)
        return JsonResponse({'error': 'An error occurred while processing the request'}, status=500)

def privacy_policy_view(request):
    return render(request, 'privacy_policy.html')

@api_view(['POST'])
@ensure_csrf_cookie
@csrf_protect
def api_login_view(request):
    print("\n\n       URL:", request.build_absolute_uri())

    if request.method == "POST": 
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(username=username, password=password)
        if user is not None:
            request.session['pending_username'] = user.username
            # login(request, user)
            # print("USer logged in temporary for 2FA.")
            # Output information about the authenticated user
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

@csrf_protect
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

@csrf_protect
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

        if user.game_stats is None:
            game_stats = GameStats.objects.create(
                user=user,
                username=user.username,
                total_games_played=0,
                games_won=0,
                games_lost=0
            )
            user.game_stats = game_stats
            user.save()
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

@require_POST
@login_required
def delete_account(request):
    user = request.user
    try:
        send_notification_to_microservices(user)
        game_stats = user.game_stats
        with transaction.atomic():
            user.game_stats.delete()

        user.is_online = False
        # user.save()
        request.user.delete()

        logger.info(f"User {user.username} deleted successfully.")
        
        return JsonResponse({'success': True, 'message': escape('Account deleted successfully')})
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@login_required
@csrf_protect
def settings_view(request):
    return JsonResponse({})

@login_required
@csrf_protect
def game_history_view(requset):
    return JsonResponse({})

@login_required
@csrf_protect
def friends_view(request):
    user = request.user
    friends = user.friends.all()

    friend_data = []
    for friend in friends:
        print("friend: ", friend)
        current_time = int(timezone.now().timestamp())
        print("last_valid_time_unix_timestamp = int(last_valid_time.timestamp())", int(friend.last_valid_time.timestamp()))
        print("current_time: ", current_time)
        print("current_time - friend.last_valid_time: ", current_time - int(friend.last_valid_time.timestamp()))
        if friend.is_online == True and (current_time - int(friend.last_valid_time.timestamp())) > 300:
            friend.is_online = False
            friend.save()

        avatar_url = None
        if friend.avatar:
            with open(friend.avatar.path, "rb") as image_file:
                avatar_data = base64.b64encode(image_file.read()).decode('utf-8')
            # avatar_url = urljoin(settings.MEDIA_URL, friend.avatar.url)
            print("avatar_url: ", avatar_url)
        friend_info = {
            'username': escape(friend.username),
            'playername': escape(friend.playername),
            'avatar': avatar_data,
            'pk': friend.pk,
            'game_stats': {
                'total_games_played': friend.game_stats.total_games_played,
                'games_won': friend.game_stats.games_won,
                'games_lost': friend.game_stats.games_lost
            }
        }
        friend_data.append(friend_info)

    search_query = request.GET.get('search')
    search_results = []
    if (search_query != user.username):
        if search_query:
            print(search_query)
            search_results = User.objects.filter(username__icontains=search_query)
            print("search_resuls : ", search_results)

    return JsonResponse({'friends': friend_data, 'search_query': escape(search_query), 'search_results': search_results})
    # return render(request, 'friends.html', {'friends': friend_data, 'search_query': search_query, 'search_results': search_results})

@login_required
@csrf_protect
def detail_view(request):
    # access_token = request.headers.get('Authorization')  # Get the access token from the request headers
    # if access_token:
    #     decoded_token = jwt.decode(access_token.split()[1], settings.SECRET_KEY, algorithms=["HS256"])
    #     print("\nDECODED from detail_view: ", decoded_token)
    #     user_id = decoded_token.get('user_id')
    user = request.user
        # if user_id:
        #     user = User.objects.filter(pk=user_id).first()

    if user:
        game_stats = user.game_stats
        # Serialize user data
        data = {
            'username': user.username,
            'playername': user.playername,
            # 'email': user.email,
            'avatar': user.avatar.url if user.avatar else None,
            'friends_count': user.friends.count(),
            'two_factor_method': user.two_factor_method,
            'total_games_played': game_stats.total_games_played,
            'games_won': game_stats.games_won,
            'games_lost': game_stats.games_lost,
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
def add_friend(request, pk):
    friend = get_object_or_404(User, pk=pk)
    print("pk : ", pk)
    print("friend: ", friend)
    request.user.add_friend(friend)
    return JsonResponse({'message': 'Friend added successfully', 'friend_id': friend.pk})

@login_required
def remove_friend(request, pk):
    friend = get_object_or_404(User, pk=pk)
    request.user.friends.remove(friend)
    return JsonResponse({})

@login_required
@csrf_protect
def profile_update_view(request):
    user = request.user
    if request.method == 'POST':
        user_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        if user_form.is_valid():
            user = user_form.save(commit=False)
            if 'two_factor_method' in request.POST:
                if request.POST['two_factor_method'] == '':
                    user.two_factor_method = None
                else:
                    user.two_factor_method = request.POST['two_factor_method']
            if User.objects.filter(playername=user.playername).exclude(username=request.user.username).exists():
                return JsonResponse({'error': 'Playername already exists. Please choose a different one.'})
            else:
                user.save()    
                return JsonResponse({'success': 'Your profile has been updated.'})
        else:
            return JsonResponse({'error': 'Form is not valid.'}, status=400)
    else:
        user_form = ProfileUpdateForm(instance=request.user)
        # serialized_form = model_to_dict(user_form)
        html = render_to_string('profile_update.html', {'form': user_form})
        return JsonResponse({'html': html})
        # return render(request, 'profile_update.html', {'user_form': user_form})

@login_required
def password_update_view(request):
    if request.method == 'POST':
        form = PasswordUpdateForm(request.user, request.POST)
        if form.is_valid():
            form.save()
            request.user.save()
            messages.success(request, 'Your password has changed successfully. Please login again.')
            return JsonResponse({'success': True, 'message': "Please login again"}) # needed to redirect to login homepage
        else:
            return JsonResponse({'error': 'Form is not valid.'}, status=400)
    else:
        form = PasswordUpdateForm(request.user)
        serialized_form = model_to_dict(form)
        html = render_to_string('password_update.html')
        # return render(request, 'password_update.html', {'form': form})
        return JsonResponse({'form': serialized_form, 'html': html})


class TokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )

token_generator = TokenGenerator()

def send_password_reset_link(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        print("usernamen: ", username)
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
        return JsonResponse({'success': False, 'error': escape('Invalid request method')})

@csrf_protect
def password_reset_view(request, uidb64, token):
    print("uidb64: ", uidb64, "token: ", token)
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    print("user? : ", user.username)
    if user is not None and token_generator.check_token(user, token):
        if request.method == 'POST':
            new_password1 = request.POST.get('new_password1')
            new_password2 = request.POST.get('new_password2')
            try:
                validate_password(new_password1, user=User(username=user.username))
            except ValidationError as e:
                return JsonResponse({'success': False, 'error': e.messages[0]}, status=400)

            if new_password1 == new_password2:
                user.set_password(new_password1)
                user.save()
                user = authenticate(request, username=user.username, password=new_password1)
                # if user is not None:
                #     login(request, user)
                # return redirect('account:password_reset_done')
                return JsonResponse({'success': True, 'message': escape('Password reset successfully')})
            else:
                return JsonResponse({'success': False, 'error': escape('Passwords do not match')}, status=400)
        else:
            # return render(request, 'password_reset.html', {'uidb64': uidb64, 'token': token, 'user': user})
            html = render_to_string('password_reset.html', {'uidb64': uidb64, 'token': token, 'user': user})
            return JsonResponse({'html': html})
    else:
        # return HttpResponse('Invalid password reset link', status=400)
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
    all_users = User.objects.all()
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
