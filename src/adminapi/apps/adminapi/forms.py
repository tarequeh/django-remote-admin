from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm as DjangoUserCreationForm
from django.contrib.auth.models import User


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


class UserCreationForm(DjangoUserCreationForm):
    password = forms.CharField(label="Password", widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(UserCreationForm, self).__init__(*args, **kwargs)
        self.fields.pop('password1')
        self.fields.pop('password2')

    class Meta:
        model = User

    def clean_username(self):
        cleaned_username = self.cleaned_data.get('username')
        if self.instance.pk and cleaned_username == self.instance.username:
            return cleaned_username

        return super(UserCreationForm, self).clean_username()

    def save(self, commit=True):
        user = super(DjangoUserCreationForm, self).save(commit=False)

        if not self.instance.pk or self.initial['password'] != self.cleaned_data["password"]:
            user.set_password(self.cleaned_data["password"])

        if commit:
            user.save()
        return user
