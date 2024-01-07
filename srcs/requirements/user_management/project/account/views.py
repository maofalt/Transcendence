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
from django.views.decorators.csrf import csrf_exempt # CSRF (Cross-Site Request Forgery) protection middleware. 

# microservice connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer, AnonymousUserSerializer

# Create your views here.

def home(request):
    return render(request, 'home.html')

def api_login_view(request):
    print("\n\n       URL:", request.build_absolute_uri())

    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            user.is_online = True
            user.save()
            print(request.user.username, ": is_online status", request.user.is_online)

            # Output information about the authenticated user
            print("User Information:")
            print(f"Username: {request.user.username}")
            print(f"Intra ID: {request.user.intra_id}")
            print(f"Playername: {request.user.playername}")
            print(f"Is Online: {user.is_online}")
            print(f"Date Joined: {user.date_joined}")
            serializer = UserSerializer(user)
            redirect_url = '/api/user_management/'
            return JsonResponse({'message': 'Authentication successful', 'user': serializer.data, 'redirect_url': redirect_url})

        else:
            print("Authentication failed")
            return JsonResponse({'error': 'Authentication failed: Wrong user data'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

# This is useful in cases where you intentionally want to allow certain requests without requiring the usual CSRF token.
# In your specific example, the @csrf_exempt decorator is applied to the api_logout_view view.
# This means that the CSRF protection will not be enforced for the api_logout_view view,
# allowing you to make POST requests without including the CSRF token in the request headers.
# It's important to use csrf_exempt with caution, especially when dealing with sensitive operations like authentication and logout.
# If CSRF protection is disabled, you need to ensure that proper security measures are in place
# to prevent potential security vulnerabilities.

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
        intra_id = request.POST["intra_id"]

        try:
            validate_password(password, user=User(username=username))
        except ValidationError as e:
            return JsonResponse({'success': False, 'error_message': e.messages[0]})

        user = User(
            username=username,
            password=make_password(password),
            playername=playername,
            intra_id=intra_id
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


