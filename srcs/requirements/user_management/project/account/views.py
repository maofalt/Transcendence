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
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.http import JsonResponse, HttpResponseRedirect
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
from django.contrib.auth.tokens import PasswordResetTokenGenerator
# from django.utils.encoding import force_bytes, force_str

#JWT
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer, AnonymousUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings
# 2FA
import json
from django.core.validators import validate_email
import random
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.sessions.models import Session
from django.middleware.csrf import get_token

#XSS protection
from django.utils.html import escape

logger = logging.getLogger(__name__)
User = get_user_model()

def home(request):
    return render(request, 'home.html')

# OPTION 1 check periodically calling this function form frontend
def user_is_logged_in(request):
    if request.user.is_authenticated:
        request.user.is_online = True
        request.user.save()
    else:
        request.user.is_online = False
        request.user.save()
    return JsonResponse({'isLoggedIn': request.user.is_authenticated})

# // Function to check user's login status
# function checkLoginStatus() {
#     fetch('/checkLogin')
#         .then(response => response.json())
#         .then(data => {
#             if (!data.isLoggedIn) {
#                 console.log('User is logged out');
#                 sendNotificationToServer();
#         })
#         .catch(error => {
#             console.error('Error checking login status:', error);
#         });
# }

# OPTION 2 using jwt

# def user_is_logged_in(request):
#     token = request.headers.get('Authorization', '').split('Bearer ')[-1]
#     try:
#         decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
#         username = decoded_token.get('username')
#         if username:
#             user = User.objects.get(username=username)
#             request.user = user
#             return JsonResponse({'isLoggedIn': True})
#         else:
#             return JsonResponse({'isLoggedIn': False})
#     except jwt.ExpiredSignatureError:
#         request.user.is_online = False
#         request.user.save()
#         logout(request)
#         # Token expired, perform logout operation
#         return JsonResponse({'isLoggedIn': False})
#     except jwt.InvalidTokenError:
#         # Invalid token, handle the error as needed
#         return JsonResponse({'isLoggedIn': False})



# // Periodically check user's login status (every 1 minute)
# setInterval(checkLoginStatus, 60000);
# function sendNotificationToServer() {
# }

# // Function to periodically check JWT expiration and user's login status
# function checkLoginStatus() {
#     const token = localStorage.getItem('jwtToken'); // Retrieve JWT from local storage
#     if (!token) {
#         console.log('User is not logged in');
#         return;
#     }
# const decodedToken = jwt_decode(token);
#     const currentTime = Date.now() / 1000; 

#     if (decodedToken.exp < currentTime) {
#         // JWT has expired, log out the user
#         console.log('JWT has expired, logging out user');
#         localStorage.removeItem('jwtToken'); // Remove expired JWT from local storage
#         return;
#     }

#     console.log('User is logged in');
# }
# setInterval(checkLoginStatus, 60000);


# However, even if the cookie is marked as HTTP-only, 
# the browser still includes it in subsequent HTTP requests to the server. 
# So, when the client makes requests to the server, 
# the browser automatically includes the JWT token cookie, 
# allowing the server to authenticate the user.

# In this JavaScript code for checking the login status,
# it is not directly accessing the cookie using JavaScript.
# Instead, you are retrieving the JWT token from the local storage
# (localStorage.getItem('jwtToken')).
# This approach is not affected by the httponly=True setting
# because local storage is a separate storage mechanism from cookies
# and is accessible by JavaScript.

# Therefore, you can safely use httponly=True for the JWT token cookie
# while still performing client-side JWT token checking in JavaScript


def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username

    return str(refresh.access_token)

def privacy_policy_view(request):
    return render(request, 'privacy_policy.html')

@csrf_protect
def api_login_view(request):
    print("\n\n       URL:", request.build_absolute_uri())

    secret_key = settings.SECRET_KEY
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
            
            send_one_time_code(request, user.email)
            
            token = get_token_for_user(user)
            response = JsonResponse({'message': escape('Password Authentication successful'), 'redirect_url': escape(redirect_url), 'requires_2fa': True})
            response.set_cookie(
                key='jwtToken',
                value=token,
                httponly=True,
                samesite='Lax'
            )
            print("\ntoken: ", token)
            try:
                decoded_token = jwt.decode(token, secret_key, algorithms=["HS256"])
                print("Decoded Token:", decoded_token)
                return response
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': escape('Token has expired')}, status=400)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': escape('Invalid token')}, status=400)
        else:
            print("Authentication failed")
            return JsonResponse({'error': escape('Authentication failed: Wrong user data')}, status=400)
    return JsonResponse({'error': escape('Invalid request method')}, status=400)

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
        return redirect('/api/user_management/')
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
            print("\n\nGAMES STATS : user", user.game_stats.user)
            user.save()
        print(" >>  User created successfully.")

        login(request, user)
        user.is_online = True
        print(f"Is Online: {user.is_online}")
        user.save()
        
        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error': escape('Invalid request method')}, status=400)



def send_notification_to_microservices(username):
    endpoint_url = "https://localhost:9443/api/tournament/delete_user"
    payload = {'username': username}

    try:
        # send POST request
        response = requests.post(endpoint_url, json=payload)
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
        game_stats = user.game_stats
        with transaction.atomic():
            user.game_stats.delete()

        user.is_online = False
        # user.save()
        request.user.delete()

        logger.info(f"User {user.username} deleted successfully.")

        jwt_token = request.COOKIES.get('jwtToken')
        secret_key = settings.SECRET_KEY

        if jwt_token:
            try:
                decoded_token = jwt.decode(jwt_token, secret_key, algorithms=["HS256"])
                username = decoded_token.get('username')
                send_notification_to_microservices(username)
            except jwt.ExpiredSignatureError:
                return JsonResponse({'error': escape('Token has expired')}, status=400)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': escape('Invalid token')}, status=400)
        
        return JsonResponse({'success': True, 'message': escape('Account deleted successfully')})
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
@csrf_protect
def friend_view(request):
    user = request.user
    friends = user.friends.all()

    friend_data = []
    for friend in friends:
        avatar_url = None
        if friend.avatar:
            avatar_url = urljoin(settings.MEDIA_URL, friend.avatar.url)
        friend_info = {
            'username': friend.username,
            'playername': friend.playername,
            'avatar': avatar_url,
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
    if search_query:
        print(search_query)
        search_results = User.objects.filter(username__icontains=search_query)

    return render(request, 'friends.html', {'friends': friend_data, 'search_query': search_query, 'search_results': search_results})

@login_required
@csrf_protect
def detail_view(request):
    user = request.user
    game_stats = request.user.game_stats

    data = {
        'username': user.username,
        'playername': user.playername,
        'email': user.email,
        'avatar': user.avatar.url if user.avatar else None,
        'friends_count': user.friends.count(),
        'game_stats': {
            'user': game_stats.user,
            'total_games_played': game_stats.total_games_played,
            'games_won': game_stats.games_won,
            'games_lost': game_stats.games_lost,
        }
    }
    return render(request, 'detail.html', {'data': data})

@login_required
def add_friend(request, pk):
    friend = get_object_or_404(User, pk=pk)
    request.user.add_friend(friend)
    return redirect('account:friend')

@login_required
def remove_friend(request, pk):
    friend = get_object_or_404(User, pk=pk)
    request.user.friends.remove(friend)
    return redirect('account:friend')

@login_required
@csrf_protect
def profile_update_view(request):
    if request.method == 'POST':
        user_form = ProfileUpdateForm(request.POST, request.FILES, instance=request.user)
        
        if user_form.is_valid():
            user = user_form.save(commit=False)
            if User.objects.filter(playername=user.playername).exclude(username=request.user.username).exists():
                messages.error(request, 'Playername already exists. Please choose a different one.')
                return redirect('account:profile_update')
            else:
                user.save()    
                messages.success(request, 'Your profile has update.')
                return redirect('account:detail')
    else:
        user_form = ProfileUpdateForm(instance=request.user)

    return render(request, 'profile_update.html', {'user_form': user_form})

@login_required
def password_update_view(request):
    if request.method == 'POST':
        form = PasswordUpdateForm(request.user, request.POST)
        if form.is_valid():
            form.save()
            request.user.save()
            messages.success(request, 'Your password has changed successfully. Please login again.')
            return redirect('account:login')
    else:
        form = PasswordUpdateForm(request.user)
    
    return render(request, 'password_update.html', {'form': form})


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
                return redirect('account:password_reset_done')
            else:
                return JsonResponse({'success': False, 'error': escape('Passwords do not match')}, status=400)
        else:
            return render(request, 'password_reset.html', {'uidb64': uidb64, 'token': token, 'user': user})
    else:
        return HttpResponse('Invalid password reset link', status=400)

def password_reset_done(request):
    return render(request, 'password_reset_done.html')

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
