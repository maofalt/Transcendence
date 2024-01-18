from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from .models import User

class UserAdmin(BaseUserAdmin):

    list_display = ('username', 'email', 'playername', 'is_online', 'avatar_tag', 'date_joined', 'last_login')

    search_fields = ('username', 'playername')

    ordering = ('playername',)

    list_filter = ('is_online',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email', 'playername', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    # add_fieldsets: sections for add user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'playername'),
        }),
    )

    def avatar_tag(self, obj):
        return format_html('<img src="{}" width="30" height="30" />', obj.avatar.url)
    # avatar_tag.allow_tags = True
    avatar_tag.short_description = 'Avatar'

# Register your models here.
# admin.site.register(User)
    
admin.site.register(User, UserAdmin)

