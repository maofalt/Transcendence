from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TournamentHistory, GameStats
from .serializers import TournamentHistorySerializer, GameStatsSerializer
from django.shortcuts import get_object_or_404
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

class GameStatsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        # Retrieve GameStats instances based on user ID
        logging.debug("Entering GET method------------------------------------\n")
        logging.debug("print kwargs: ", kwargs)
        user_id = kwargs.get('user_id')
        
        game_stats = get_object_or_404(GameStats, user_id=user_id)
        serializer = GameStatsSerializer(game_stats)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, user_id, *args, **kwargs):
        # Fetch user details directly without using UserDetailsAPIView
        try:
            user = get_user_model().objects.get(id=user_id)
        except get_user_model().DoesNotExist:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        print(f"Received user_id: {user_id}")


        user_id = kwargs.get('user_id')
        print(f"받은 사용자 ID: {user_id}")
        game_stats = get_object_or_404(GameStats, user_id=user_id)
        print(f"GameStats 객체 검색: {game_stats}")

        serializer = GameStatsSerializer(game_stats)
        print(f"시리얼라이즈된 GameStats 데이터: {serializer.data}")
        game_stats_data = {
            "total_games_played": 5,
            "games_won": 3,
            "games_lost": 2,
        }

        user_instance, created = get_user_model().objects.get_or_create(id=user.id)

        # Update or create GameStats based on user ID
        game_stats, created = GameStats.objects.update_or_create(
            user=user_instance,
            defaults=game_stats_data
        )

        serializer = GameStatsSerializer(game_stats)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
