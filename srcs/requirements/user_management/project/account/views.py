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

logger = logging.getLogger(__name__)
User = get_user_model()

def home(request):
    return render(request, 'home.html')

def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username

    return str(refresh.access_token)

def privacy_policy_view(request):
    return render(request, 'privacy_policy.html')

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
            response = JsonResponse({'message': 'Password Authentication successful', 'redirect_url': redirect_url, 'requires_2fa': True})
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
                return JsonResponse({'error': 'Token has expired'}, status=400)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=400)
        else:
            print("Authentication failed")
            return JsonResponse({'error': 'Authentication failed: Wrong user data'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def generate_one_time_code():
    return get_random_string(length=6, allowed_chars='1234567890')

@csrf_exempt
def send_one_time_code(request, email=None):
    if email is None and request.method == 'POST':
        email = request.POST.get('email', None)
    one_time_code = generate_one_time_code()
    request.session['one_time_code'] = one_time_code

    print("\n\nCHECK CODE ON SESSION: ", request.session.get('one_time_code'))
    subject = 'Your Access Code for PONG'
    message = f'Your one-time code is: {one_time_code}'
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
                return JsonResponse({'success': True, 'message': 'One-time code verification successful', 'csrf_token': csrf_token})
            else:
                return JsonResponse({'success': False, 'error': 'One-time code verification failed', 'csrf_token': csrf_token}, status=400)
        else:
            return JsonResponse({'success': False, 'error': 'User authentication not found'}, status=400)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=400)

def get_serializer(user):
    if user.is_authenticated:
        return UserSerializer(user)
    else:
        return AnonymousUserSerializer()

@csrf_exempt
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
        return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def api_signup_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        playername = request.POST["playername"]
        email = request.POST["signupEmail"]

        try:
            validate_password(password, user=User(username=username))
        except ValidationError as e:
            return JsonResponse({'success': False, 'error_message': e.messages[0]})

        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'success': False, 'error_message': 'Invalid email'})

        if User.objects.filter(username=username).exists():
            return JsonResponse({'success': False, 'error_message': 'Username already exists'})

        if User.objects.filter(playername=playername).exists():
            return JsonResponse({'success': False, 'error_message': 'Playername already exists'})

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
            return JsonResponse({'success': False, 'error_message': 'User creation failed.'})

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
        return JsonResponse({'success': True})

    return JsonResponse({'success': False, 'error_message': 'Invalid request method'}, status=400)



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
                return JsonResponse({'error': 'Token has expired'}, status=400)
            except jwt.InvalidTokenError:
                return JsonResponse({'error': 'Invalid token'}, status=400)
        
        return JsonResponse({'success': True, 'message': 'Account deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
def friend_view(request):
    user = request.user
    friends = user.friends.all()

    search_query = request.GET.get('search')
    search_results = []
    if search_query:
        print(search_query)
        search_results = User.objects.filter(username__icontains=search_query)
        # friends = friends.filter(username__icontains=search_query)

    return render(request, 'friends.html', {'friends': friends, 'search_query': search_query, 'search_results': search_results})

@login_required
def detail_view(request):
    game_stats = request.user.game_stats
    return render(request, 'detail.html')

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
            return JsonResponse({'success': False, 'error': 'User not found'})

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

        return JsonResponse({'success': True, 'message': 'Password reset link sent successfully'})

    else:
        return JsonResponse({'success': False, 'error_message': 'Invalid request method'})

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
                return JsonResponse({'success': False, 'error_message': e.messages[0]}, status=400)

            if new_password1 == new_password2:
                user.set_password(new_password1)
                user.save()
                user = authenticate(request, username=user.username, password=new_password1)
                # if user is not None:
                #     login(request, user)
                return redirect('account:password_reset_done')
            else:
                return JsonResponse({'success': False, 'error_message': 'Passwords do not match'}, status=400)
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
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


def print_all_user_data(request):
    all_users = User.objects.all()
    context = {'users': all_users}

    return render(request, 'print_user_data.html', context)
