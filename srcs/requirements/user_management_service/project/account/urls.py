from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static
from .views import TournamentHistoryAPIView, GameStatsAPIView


app_name = "account"

urlpatterns = [
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("signup", views.signup_view, name="signup"),
    path("friend", views.friend_view, name="friend"),
    path("add_friend/<int:pk>", views.add_friend, name="add_friend"),
    path("remove_friend/<int:pk>", views.remove_friend, name="remove_friend"),
    path("detail", views.detail_view, name="detail"),
    path("profile_update", views.profile_update_view, name="profile_update"),
    path("password_update", views.password_update_view, name="password_update"),
    path('api/tournament-history/', TournamentHistoryAPIView.as_view(), name='tournament-history-api'),
    path('api/game-stats/', GameStatsAPIView.as_view(), name='game-stats-api'),
    path('admin/', admin.site.urls),
    # path('account/', include('account.urls')),
    path('api/', include('account.api.urls')),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)