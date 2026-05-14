from django.contrib.auth import logout
from django.contrib.auth.views import LoginView
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views import View
from django.views.generic import CreateView
from django.views.generic import TemplateView
from django.contrib import messages
from app.forms import EmailLoginForm
from app.forms import RegisterForm
from app.models import User
from app.utils import send_register_email, generate_code


class RegisterView(CreateView):
    form_class = RegisterForm
    template_name = "register.html"
    success_url = reverse_lazy("login")

    def form_valid(self, form):
        super().form_valid(form)

        user = self.object
        code = generate_code()
        # Kodni va Userni sessionda saqlaymiz
        self.request.session["verify_user_id"] = user.id
        self.request.session["verify_code"] = str(code)
        send_register_email(to_email=user.email, code=code)

        return redirect("verify-email")


class VerifyEmailView(TemplateView):
    template_name = 'verify-email.html'

    def post(self, request, *args, **kwargs):
        entered_code = request.POST.get("code", "").strip()

        reg_code = str(request.session.get("verify_code", "")).strip()
        reset_code = str(request.session.get("reset_code", "")).strip()

        # === СЦЕНАРИЙ 1: ЭТО БЫЛА РЕГИСТРАЦИЯ ===
        if entered_code == reg_code and reg_code != "":
            user_id = request.session.get("verify_user_id")
            user = User.objects.get(id=user_id)
            user.is_active = True
            user.save()

            # Чистим память и отправляем входить
            request.session.pop("verify_code", None)
            request.session.pop("verify_user_id", None)
            messages.success(request, "Почта успешно подтверждена! Теперь вы можете войти.")
            return redirect("login")

        # === СЦЕНАРИЙ 2: ЭТО БЫЛО ВОССТАНОВЛЕНИЕ ПАРОЛЯ ===
        elif entered_code == reset_code and reset_code != "":
            request.session.pop("reset_code", None)
            messages.success(request, "Код верный! Придумайте новый пароль.")
            return redirect("reset-password")

        # === СЦЕНАРИЙ 3: ВООБЩЕ НЕ ТОТ КОД ===
        else:
            messages.error(request, "Неверный код подтверждения!")
            return redirect("verify-email")


class UserLoginView(LoginView):
    authentication_form = EmailLoginForm
    template_name = "login.html"
    redirect_authenticated_user = True


class UserLogoutView(View):
    def get(self, request):
        logout(request)
        return redirect("index")

    def post(self, request):
        logout(request)
        return redirect("index")


class ConfirmPasswordView(TemplateView):
    template_name = 'confirm-password.html'

    def post(self, request, *args, **kwargs):
        new_password = request.POST.get('new_password')

        reset_user_id = request.session.get('reset_user_id')

        if reset_user_id and new_password:
            try:
                user = User.objects.get(id=reset_user_id)
                user.set_password(new_password)
                user.save()

                # Чистим память до конца
                request.session.pop("reset_user_id", None)

                messages.success(request, "Пароль успешно изменен! Войдите с новым паролем.")
                return redirect("login")
            except User.DoesNotExist:
                messages.error(request, "Ошибка: пользователь не найден.")
                return redirect("forgot-password")

        messages.error(request, "Ошибка при смене пароля. Попробуйте еще раз.")
        return redirect("confirm-password")