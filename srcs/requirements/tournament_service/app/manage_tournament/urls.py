from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static


app_name = "tournament"

urlpatterns = [  
    # Tournament Creation and Management:
    #   - POST /tournaments/create_and_list/ - Create a new tournament with the necessary settings and rules.
    #   - GET /tournements/create_and_list/ - show the list of tournaments
    path('create_and_list/', views.TournamentListCreate.as_view(), name='tournament-list-create'),
    #   - GET /tournaments/manage/{id}/ - Retrieve the details of a specific tournament.
    #   - PUT /tournaments/manage/{id}/ - Update the settings or rules of a specific tournament.
    #   - DELETE /tournaments/manage/{id}/ - Remove a tournament from the system.  
    path('manage/<int:pk>/', views.TournamentRetrieveUpdateDestroy.as_view(), name='tournament-retrieve-update-destroy'),
]