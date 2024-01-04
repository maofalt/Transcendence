from django import forms
from .models import User
from django.contrib.auth.forms import PasswordChangeForm

class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['playername', 'avatar']

    # def clean_password(self):
    #     # 사용자가 비밀번호를 변경하지 않도록 설정
    #     return self.initial.get('password')
        
class PasswordUpdateForm(PasswordChangeForm):
    class Meta:
        model = User