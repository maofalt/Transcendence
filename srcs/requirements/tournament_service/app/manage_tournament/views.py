from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Tournament
from .serializers import TournamentSerializer
from rest_framework.response import Response
from rest_framework import status

class TournamentListCreate(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({"message": "Any tournament was found."}, status=status.HTTP_204_NO_CONTENT)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class TournamentDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

class TournamentRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

# Create your views here.

def home(request):
    return render(request, 'home.html')