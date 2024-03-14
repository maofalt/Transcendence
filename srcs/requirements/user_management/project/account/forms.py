from django import forms
from .models import User
from django.contrib.auth.forms import PasswordChangeForm

class ProfileUpdateForm(forms.ModelForm):
    TWO_FACTOR_OPTIONS = [
        ('sms', 'SMS'),
        ('email', 'Email'),
    ]
    
    two_factor_enabled = forms.BooleanField(required=False, label='Enable 2FA')
    two_factor_method = forms.ChoiceField(choices=[], required=False, label='2FA Method')
    
    class Meta:
        model = User
        fields = ['playername', 'avatar']

    def __init__(self, *args, **kwargs):
        super(ProfileUpdateForm, self).__init__(*args, **kwargs)
        
        # Initialize choices for the 2FA method selection field
        self.fields['two_factor_method'].choices = self.TWO_FACTOR_OPTIONS

        # Hide 2FA settings if not enabled
        if not self.initial.get('two_factor_enabled'):
            self.fields['two_factor_method'].widget = forms.HiddenInput()
            self.fields['two_factor_enabled'].widget = forms.HiddenInput()


    # def clean_password(self):
    #     return self.initial.get('password')
        
class PasswordUpdateForm(PasswordChangeForm):
    class Meta:
        model = User