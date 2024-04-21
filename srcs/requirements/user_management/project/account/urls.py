from django.urls import path, include
from django.contrib import admin
from . import views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth import views as auth_views
# from .views import CustomPasswordResetConfirmView, CustomPasswordResetDoneView


app_name = "account"

urlpatterns = [
    path('', views.home, name='home'),
    path("init", views.init_view, name="init"),
    path("login", views.api_login_view, name="login"),
    path("logout", views.api_logout_view, name="logout"),
    path("validate_username", views.validate_username_view, name="validate_username"),
    path("validate_email", views.validate_email_view, name="validate_email"),
    path("validate_playername", views.validate_player_name_view, name="validate_playername"),
    path("validate_password", views.validate_password_view, name="validate_password"),
    path("signup", views.api_signup_view, name="signup"),
    path('policy', views.privacy_policy_view, name='privacy_policy'),
    path("friends", views.friends_view, name="friends"),
    path("settings", views.settings_view, name="settings"),
    path("add_friend/<str:username>", views.add_friend, name="add_friend"),
    path("remove_friend/<str:username>", views.remove_friend, name="remove_friend"),
    path("detail/<str:username>", views.detail_view, name="detail"),
    path("detail/", views.detail_view, name="detail"),
    path("profile_update", views.ProfileUpdateView.as_view(), name="profile_update"),
    path("PasswordChangeForm", views.PasswordUpdateView.as_view(), name="password_update"),
    # path('password_reset_confirm/<uidb64>/<token>/', CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password_reset/done', views.password_reset_done, name='password_reset_done'),
    path('send_reset_link', views.SendResetLinkView.as_view(), name='send_resetLink'),
    path('password_reset/<uidb64>/<token>/', views.PasswordResetView.as_view(), name='password_reset'),
    # path('passwordResetForm/', CustomPasswordResetView.as_view(), name='password_reset'),
    # path('password_reset/done/', CustomPasswordResetDoneView.as_view(), name='password_reset_done'),
    # path('password_reset_done/', custom_password_reset_done, name='password_reset_done'),
    path('verify_code', views.verify_one_time_code, name='verify_one_time_code'),
    path('access_code', views.send_one_time_code, name='send_one_time_code'),
    path('delete_account', views.delete_account, name='delete_account'),
    path('developer_setting', views.print_all_user_data, name='print_db'),
    path('check_refresh', views.check_refresh, name='check_refresh'),
    path('smsTest', views.smsTest, name='smsTest'),
    path('sendCodeSMS', views.send_sms_code, name='sendCodeSMS'),
    path('updatePhone', views.update_phone, name='updatePhone'),
    path('updateSandbox', views.update_sandbox, name='updateSandbox'),
    path('verifySandBox', views.verify_sandBox, name='verifySandBox'),
    path('getUser', views.get_user, name='getUser'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)