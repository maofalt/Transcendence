from django.contrib.auth import authenticate, login, logout, get_user_model
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from .forms import ProfileUpdateForm, PasswordUpdateForm
from gameHistory_microservice.models import GameStats
from django.db.utils import IntegrityError



print(make_password("1234")) 
print(check_password("1234", "pbkdf2_sha256$720000$3Ic0AO1QtmzznCEoyCml96$wcExZGGuUboFrsn7geDFMjNK9AM12wtAZCAHKdfq6D0="))

# Create your views here.

def home(request):
    return render(request, 'home.html')

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(username=username, password=password)
        if user is not None:
            print("Authentication successful")
            login(request, user)
            request.user.is_online = True
            request.user.save()
            print(request.user.username, ": is_online status", request.user.is_online)
            

            # Output information about the authenticated user
            print("User Information:")
            print(f"Username: {request.user.username}")
            print(f"Email: {user.email}")
            print(f"Intra ID: {request.user.intra_id}")
            print(f"Playername: {request.user.playername}")
            print(f"Is Online: {user.is_online}")
            print(f"Date Joined: {user.date_joined}")


        else:
            print("Authentication failed")
            messages.error(request, 'Authentication failed: Wrong user data')
    return render(request, "login.html")

@login_required
def logout_view(request):
    if request.user.is_authenticated:
        request.user.is_online = False
        request.user.save()
        print(request.user.username, ": is_online status", request.user.is_online)
        logout(request)
    return redirect("account:login")

def signup_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        playername = request.POST["playername"]
        intra_id = request.POST["intra_id"]

        user = User(
            username=username,
            password=make_password(password),
            playername=playername,
            intra_id=intra_id
        )

        try:
            user.save()
        except IntegrityError as e:
            # IntegrityError가 발생하는 경우 처리 (예: 사용자가 이미 존재하는 경우)
            # 다른 페이지로 리디렉션하거나 오류 메시지를 표시할 수 있습니다
            return render(request, "signup.html", {"error_message": "User creation failed."})

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

        return redirect("account:login")

    return render(request, "signup.html")

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


# microservice connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer

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