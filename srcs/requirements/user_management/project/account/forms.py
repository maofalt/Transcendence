from django import forms
from .models import User
from django.contrib.auth.forms import PasswordChangeForm

class ProfileUpdateForm(forms.ModelForm):
    TWO_FACTOR_OPTIONS = [
        ('sms', 'SMS'),
        ('email', 'Email'),
    ]
    two_factor_method = forms.ChoiceField(choices=TWO_FACTOR_OPTIONS, required=False)

    class Meta:
        model = User
        fields = ['playername', 'avatar']

    # def clean_password(self):
    #     return self.initial.get('password')
        
class PasswordUpdateForm(PasswordChangeForm):
    class Meta:
        model = User