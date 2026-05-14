import random
from django.core.mail import send_mail

def generate_code():
    return random.randint(100000, 999999)

def send_register_email(to_email, code):
    subject = "Tasdiqlash kodi"
    message = f"""
    Salom!

    Temur Estate platformasida ro‘yxatdan o‘tishni tasdiqlash uchun quyidagi koddan foydalaning:

    🔐 Tasdiqlash kodi: {code}

    Kodning amal qilish muddati cheklangan.
    Agar bu so‘rovni siz yubormagan bo‘lsangiz, xabarni e’tiborsiz qoldiring.

    Hurmat bilan,
    Temur Estate
    """
    from_email = "admin@temur_estate.uz"

    send_mail(subject, message, from_email, [to_email])