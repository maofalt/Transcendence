import logging
from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from django.views import View
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from .models import TournamentHistory, GameStats
from .serializers import TournamentHistorySerializer, GameStatsSerializer
from django.contrib.auth import get_user_model
from account.models import User


# from .views import UserDetailsAPIView



# Create your views here.
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

# class GameStatsAPIView(APIView):
#     def get(self, request, *args, **kwargs):
#         queryset = GameStats.objects.all()
#         serializer = GameStatsSerializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def post(self, request, *args, **kwargs):
#         serializer = GameStatsSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

logger = logging.getLogger(__name__)

class GameStatTestView(View):
    def get(self, request, *args, **kwargs):
        username = request.data.get('username')
        return render(request, 'gameStatTest.html', {'username': username})

class GameStatsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        username = request.data.get('username')
        print("/n/njjjj/n/n")
        logger.info(f'GET 요청이 받아들여진 사용자 ID: {username}')
        return render(request, 'gameStatTest.html', {'username': username})
    def post(self, request, *args, **kwargs):
        # Get the username from the request data
        # username = request.data.get('222')

        print("\n\nBANANA\n\n")
        # logger.info(f'POST 요청이 받아들여진 사용자 ID: {username}')

        user_instance = get_object_or_404(User, id=6)


        total_games_played = request.POST.get("total_games_played", 0)
        games_won = request.POST.get("games_won", 0)
        games_lost = request.POST.get("games_lost", 0)
        # Get the user object using the username
        try:
            user = User.objects.get(id=6)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        total_games_played = int(total_games_played)
        games_won = int(games_won)
        games_lost = int(games_lost)

        # Get or create the GameStats instance for the user
        game_stats, created = GameStats.objects.update_or_create(
            user=user_instance,
            defaults={
                "total_games_played": total_games_played,
                "games_won": games_won,
                "games_lost": games_lost,
            }
        )

        # Save the updated GameStats instance
        game_stats.save()

        return Response({'success': 'GameStats updated successfully'}, status=status.HTTP_200_OK)

# class GameStatsAPIView(APIView):
#     def get(self, request, *args, **kwargs):
#         return render(request, 'gameStatTest.html')

#     def post(self, request, *args, **kwargs):
#         user_id = request.user.username  # 실제 사용자 ID로 대체하거나 동적으로 가져오도록 수정하세요.
#         user_instance = get_object_or_404(User, id=user_id)
        
#         # 폼에서 값 가져오기
#         total_games_played = request.POST.get("total_games_played", 0)
#         games_won = request.POST.get("games_won", 0)
#         games_lost = request.POST.get("games_lost", 0)

#         # 사용자 ID를 기반으로 GameStats 업데이트
#         game_stats, created = GameStats.objects.update_or_create(
#             user=user_instance,
#             defaults={
#                 "total_games_played": total_games_played,
#                 "games_won": games_won,
#                 "games_lost": games_lost,
#             }
#         )

#         serializer = GameStatsSerializer(game_stats)
#         return JsonResponse(serializer.data)

# class GameStatsAPIView(APIView):
#     def get(self, request, *args, **kwargs):
#         # Retrieve GameStats instances based on user ID
#         logging.debug("Entering GET method------------------------------------\n")
#         logging.debug("print kwargs: ", kwargs)
#         user_id = kwargs.get('user_id')
        
#         game_stats = get_object_or_404(GameStats, user_id=user_id)
#         serializer = GameStatsSerializer(game_stats)
        
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     def post(self, request, user_id, *args, **kwargs):
#         # Fetch user details directly without using UserDetailsAPIView
#         try:
#             user = get_user_model().objects.get(id=user_id)
#         except get_user_model().DoesNotExist:
#             return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

#         print(f"Received user_id: {user_id}")


#         user_id = kwargs.get('user_id')
#         print(f"받은 사용자 ID: {user_id}")
#         game_stats = get_object_or_404(GameStats, user_id=user_id)
#         print(f"GameStats 객체 검색: {game_stats}")

#         serializer = GameStatsSerializer(game_stats)
#         print(f"시리얼라이즈된 GameStats 데이터: {serializer.data}")
#         game_stats_data = {
#             "total_games_played": 5,
#             "games_won": 3,
#             "games_lost": 2,
#         }

#         user_instance, created = get_user_model().objects.get_or_create(id=user.id)

#         # Update or create GameStats based on user ID
#         game_stats, created = GameStats.objects.update_or_create(
#             user=user_instance,
#             defaults=game_stats_data
#         )

#         serializer = GameStatsSerializer(game_stats)

#         return Response(serializer.data, status=status.HTTP_201_CREATED)
