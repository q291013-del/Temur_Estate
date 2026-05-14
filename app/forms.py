from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User
from django.contrib.auth.forms import AuthenticationForm
from django import forms
from django import forms
from app.models import Order

class RegisterForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("email", "first_name")

    def clean_email(self):
        email = self.cleaned_data["email"].lower()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("Bu email allaqachon ro‘yxatdan o‘tgan")
        return email

#login---------------------------------------------------------------------------------------------------------


class EmailLoginForm(AuthenticationForm):
    username = forms.EmailField()

#--------------------------------------------------------------------------------------------------------------cart


class CheckoutForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['first_name', 'last_name', 'phone', 'email', 'call_time', 'comment']

    def clean(self):
        cleaned_data = super().clean()
        phone = cleaned_data.get('phone')
        first_name = cleaned_data.get('first_name')

        if not phone:
            self.add_error('phone', "Пожалуйста, укажите номер телефона для связи.")

        if not first_name:
            self.add_error('first_name', "Пожалуйста, введите ваше имя.")

        return cleaned_data