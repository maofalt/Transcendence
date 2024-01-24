from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static

app_name = "account"

urlpatterns = [
    path("login", views.api_login_view, name="login"),
    path("logout", views.api_logout_view, name="logout"),
    path("signup", views.api_signup_view, name="signup"),
    path("friend", views.friend_view, name="friend"),
    path("add_friend/<int:pk>", views.add_friend, name="add_friend"),
    path("remove_friend/<int:pk>", views.remove_friend, name="remove_friend"),
    path("detail", views.detail_view, name="detail"),
    path("profile_update", views.profile_update_view, name="profile_update"),
    path("password_update", views.password_update_view, name="password_update"),
    path('verify_one_time_code', views.verify_one_time_code, name='verify_one_time_code'),
    path('send_one_time_code', views.send_one_time_code, name='send_one_time_code'),
    path('developer_setting', views.print_all_user_data, name='print_db')
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)