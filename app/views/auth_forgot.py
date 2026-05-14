from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from app.utils import generate_code, send_register_email
from django.contrib import messages


User = get_user_model()


class ForgotPasswordView(TemplateView):
    template_name = 'forgot-password.html'

    def post(self, request, *args, **kwargs):
        email = request.POST.get('email')

        user = User.objects.filter(email=email).first()
        if not user:
            return render(request, self.template_name,
                          {'error': 'Bunday foydalanuvchi topilmadi'})

        code = generate_code()
        request.session['reset_code'] = code
        request.session['reset_user_id'] = user.id
        send_register_email(user.email, code)
        return redirect('verify-email')


class ResetPasswordView(TemplateView):
    template_name = 'reset-password.html'

    def post(self, request, *args, **kwargs):
        new_password = request.POST.get('new_password')
        reset_user_id = request.session.get('reset_user_id')

        if reset_user_id and new_password:
            try:
                user = User.objects.get(id=reset_user_id)
                user.set_password(new_password)
                user.save()

                request.session.pop("reset_user_id", None)

                messages.success(request, "Пароль успешно изменен! Войдите с новым паролем.")
                return redirect("login")
            except User.DoesNotExist:
                messages.error(request, "Ошибка: пользователь не найден.")
                return redirect("forgot-password")

        messages.error(request, "Ошибка при смене пароля. Попробуйте еще раз.")
        return redirect("reset-password")