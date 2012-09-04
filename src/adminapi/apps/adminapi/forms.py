from django import forms
from django.contrib.auth.forms import AuthenticationForm


class LoginForm(AuthenticationForm):
    username = forms.CharField(
        label='Username',
        max_length=30,
        min_length=6,
        help_text='This is your django username'
    )
    password = forms.CharField(
        label='Password',
        widget=forms.PasswordInput,
        max_length=128,
        min_length=6
    )
