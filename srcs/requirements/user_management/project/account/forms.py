from django import forms
from .models import User
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth import password_validation
from django.utils.translation import gettext as _

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

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if not username:
            return self.instance.username
        return username

class PasswordUpdateForm(PasswordChangeForm):
    class Meta:
        model = User

class CustomPasswordChangeForm(SetPasswordForm):
    error_messages = {
        'password_mismatch': "The two password fields didn't match.",
    }

    old_password = forms.CharField(
        label="Old password",
        strip=False,
        widget=forms.PasswordInput(attrs={'autofocus': True}),
    )

    new_password1 = forms.CharField(
        label="New password",
        strip=False,
        widget=forms.PasswordInput,
        help_text=password_validation.password_validators_help_text_html(),
    )

    new_password2 = forms.CharField(
        label="New password confirmation",
        strip=False,
        widget=forms.PasswordInput,
    )

    def clean_old_password(self):
        old_password = self.cleaned_data["old_password"]
        if not self.user.check_password(old_password):
            raise forms.ValidationError(
                self.error_messages['password_incorrect'],
                code='password_incorrect',
            )
        return old_password

    def clean_new_password2(self):
        new_password1 = self.cleaned_data.get('new_password1')
        new_password2 = self.cleaned_data.get('new_password2')
        if new_password1 and new_password2 and new_password1 != new_password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )
        return new_password2

class CustomPasswordResetForm(forms.Form):
    username = forms.CharField()

    def clean_username(self):
        username = self.cleaned_data.get('username')
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise forms.ValidationError("User not found")

        return username

class CustomPasswordResetForm(SetPasswordForm):
    error_messages = {
        'password_mismatch': _("The two password fields didn't match."),
    }

    new_password1 = forms.CharField(
        label=_("New password"),
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'class': 'form-control'}),
        strip=False,
        help_text=password_validation.password_validators_help_text_html(),
    )
    new_password2 = forms.CharField(
        label=_("New password confirmation"),
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'class': 'form-control'}),
    )

    def clean_new_password2(self):
        password1 = self.cleaned_data.get('new_password1')
        password2 = self.cleaned_data.get('new_password2')
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )
        password_validation.validate_password(password2, self.user)
        return password2