from django import forms
import re
from .models import User
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth import password_validation
from django.utils.translation import gettext as _
from django.conf import settings
import jwt


# def is_valid_phone_number(phone_number):
#     phone_number_pattern = r'^\+\d{1,15}$'
#     return bool(re.match(phone_number_pattern, phone_number))

class ProfileUpdateForm(forms.ModelForm):
    two_factor_method = forms.ChoiceField(choices=User.TWO_FACTOR_OPTIONS, required=False)  # Include None value

    class Meta:
        model = User
        fields = ['playername', 'avatar', 'email', 'phone', 'two_factor_method']

    def clean_avatar(self):
        avatar = self.cleaned_data['avatar']
        if avatar:
            if not avatar.name.endswith(('.jpg', '.jpeg', '.png', '.gif')):
                raise forms.ValidationError('Only image files are allowed.')
        return avatar

    def clean(self):
        cleaned_data = super().clean()
        two_factor_method = cleaned_data.get('two_factor_method')
        if two_factor_method == 'Off':
            cleaned_data['two_factor_method'] = '' 
        
        for field in ['playername', 'avatar', 'email', 'phone', 'two_factor_method']:
            if not cleaned_data.get(field):
                del cleaned_data[field]
        print("Cleaned data:", cleaned_data)
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        if commit:
            instance.save()
        if instance.pk is not None and 'phone' in self.changed_data and self.cleaned_data['phone'] != self.initial['phone']:
            # Remove the old phone number from the sandbox
            remove_phone_number_from_sandbox(self.initial['phone'])
        return instance

# class ProfileUpdateForm(forms.ModelForm):
#     TWO_FACTOR_OPTIONS = [
#         ('', '---------'),
#         ('sms', 'SMS'),
#         ('email', 'Email'),
#     ]
#     two_factor_method = forms.ChoiceField(choices=TWO_FACTOR_OPTIONS, required=False, label='2FA Method')
#     two_factor_enabled = forms.ChoiceField(choices=[(True, 'On'), (False, 'Off')], label='Enable 2FA', required=False)

#     class Meta:
#         model = User
#         fields = ['playername', 'avatar', 'two_factor_enabled', 'two_factor_method', 'phone']

#     def clean(self):
#         cleaned_data = super().clean()
#         if cleaned_data.get('two_factor_enabled') == True:
#             del cleaned_data['two_factor_enabled']
#         if cleaned_data.get('two_factor_enabled') == False:
#             del cleaned_data['two_factor_method']
#             del cleaned_data['two_factor_enabled']
#         if cleaned_data.get('two_factor_method') == '':
#             del cleaned_data['two_factor_method']
#         if not cleaned_data.get('playername'):
#             del cleaned_data['playername']
#         if not cleaned_data.get('avatar'):
#             del cleaned_data['avatar']
#         if not cleaned_data.get('phone'):
#             del cleaned_data['phone']
#         return cleaned_data

#     def save(self, commit=True):
#         # Override the save method to not include 'two_factor_enabled' when saving
#         instance = super().save(commit=False)
#         instance.two_factor_enabled = None  # Ignore 'two_factor_enabled' field
#         if commit:
#             instance.save()
#         return instance

#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#         self.fields['two_factor_method'].widget = forms.HiddenInput()

#         if hasattr(self.instance, 'two_factor_enabled'):
#             if self.instance.two_factor_enabled:
#                 self.initial['two_factor_enabled'] = True
#             else:
#                 self.initial['two_factor_enabled'] = False
#         # if self.instance.two_factor_enabled == True:
#         #     self.fields['two_factor_method'].widget = forms.Select(choices=self.TWO_FACTOR_OPTIONS)

class PasswordUpdateForm(PasswordChangeForm):
    class Meta:
        model = User

class CustomPasswordChangeForm(SetPasswordForm):
    error_messages = {
        'password_mismatch': "The two password fields didn't match.",
        'password_incorrect': "Your old password was entered incorrectly. Please enter it again.",
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