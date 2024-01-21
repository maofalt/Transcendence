from django.contrib.auth import authenticate, login, logout, get_user_model
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from .forms import ProfileUpdateForm, PasswordUpdateForm
from gameHistory_microservice.models import GameStats
from django.db.utils import IntegrityError
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt, csrf_protect

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer, AnonymousUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings
# 2FA
import random
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.sessions.models import Session
from django.middleware.csrf import get_token

def home(request):
    return render(request, 'home.html')

def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    refresh['username'] = user.username

    return str(refresh.access_token)

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
            response = JsonResponse({'message': 'Password Authentication successful', 'user': serializer.data, 'redirect_url': redirect_url, 'requires_2fa': True})
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

def send_one_time_code(request, email):
    one_time_code = generate_one_time_code()
    request.session['one_time_code'] = one_time_code

    print("\n\nCHECK CODE ON SESSION: ", request.session.get('one_time_code'))
    subject = 'Your Access Code for PONG'
    message = f'Your one-time code is: {one_time_code}'
    from_email = 'no-reply@student.42.fr' 
    to_email = email
    send_mail(subject, message, from_email, [to_email])

@csrf_protect
def verify_one_time_code(request):
    if request.method == 'POST':
        csrf_token = get_token(request)
        print("\n\nCSRF Token from request:", request.headers.get('X-CSRFToken'))
        submitted_code = request.POST.get('one_time_code')
        stored_code = request.session.get('one_time_code')
        print("\n\ncode from Session : ", stored_code)
        print("code from User : ", submitted_code, '\n\n')
        pending_username = request.session.get('pending_username')
        if pending_username:
            user = User.objects.get(username=pending_username)
            if submitted_code == stored_code:
                del request.session['one_time_code']
                login(request, user)
                user.is_online = True
                user.save()
                return JsonResponse({'message': 'One-time code verification successful', 'csrf_token': csrf_token})
            else:
                return JsonResponse({'error': 'One-time code verification failed', 'csrf_token': csrf_token}, status=400)
        else:
            return JsonResponse({'error': 'User authentication not found'}, status=400)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

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
        email = request.POST["email"]
        # email = request.POST["email"]

        try:
            validate_password(password, user=User(username=username))
        except ValidationError as e:
            return JsonResponse({'success': False, 'error_message': e.messages[0]})

        user = User(
            username=username,
            email=email,
            password=make_password(password),
            playername=playername,
        )

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


