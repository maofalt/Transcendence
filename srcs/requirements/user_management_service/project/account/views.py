from django.contrib.auth import authenticate, login, logout, get_user_model
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from .forms import ProfileUpdateForm, PasswordUpdateForm



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
        print(request.POST)
        username = request.POST["username"]
        password = request.POST["password"]
        playername = request.POST["playername"]
        intra_id = request.POST["intra_id"]

        user = User.objects.create_user(username, "", password)
        user.playername = playername
        user.intra_id = intra_id
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
    # if request.user == user:
    #     messages.warning(request, 'You cannot be a friend with yourself.')
    #     return redirect('account:detail', pk)
    
    # # if push it again unset friend
    # if request.user in user.friends.all():
    #     user.friends.remove(request.user)

    # else:
    #     user.friends.add(request.user)

    # return redirect('account:detail', pk)

def detail_view(request):
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
from .models import User, TournamentHistory, GameStats
from .serializers import UserSerializer, TournamentHistorySerializer, GameStatsSerializer

class UserAPIView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = User.objects.all()
        serializer = UserSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TournamentHistoryAPIView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = TournamentHistory.objects.all()
        serializer = TournamentHistorySerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = TournamentHistorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GameStatsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = GameStats.objects.all()
        serializer = GameStatsSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = GameStatsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)