from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone
from django.contrib.auth import get_user_model
from root import settings


class Properties(models.Model):
    image = models.ImageField()
    price = models.IntegerField()
    title = models.CharField()
    description = models.TextField()
    location = models.CharField()
    rooms = models.IntegerField()
    areas = models.DecimalField(max_digits=8, decimal_places=2)
    floor = models.IntegerField()

    def __str__(self):
        return self.title

class Projects(models.Model):
    image = models.ImageField()
    title = models.CharField()
    location = models.CharField()
    description = models.TextField()
    floors = models.IntegerField()
    flat = models.IntegerField()
    year_of_delivery = models.IntegerField()
    price = models.IntegerField()

    def __str__(self):
        return self.title

#-------------------------------------------------------------------------------------------------------------------auth



class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email (gmail) kiritilishi shart")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

#----------------------------------------------------------------------------------------------------------------------cart


class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='carts'
    )
    checked_out = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_price(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total_quantity(self):
        return sum(item.quantity for item in self.items.all())

    def __str__(self):
        return f"Cart #{self.pk} - {self.user}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        'Cart',
        on_delete=models.CASCADE,
        related_name='items'
    )

    product = models.ForeignKey(
        'Properties',
        on_delete=models.CASCADE,
        related_name='cart_items',
        null=True,
        blank=True
    )

    project = models.ForeignKey(
        'Projects',
        on_delete=models.CASCADE,
        related_name='cart_project_items',
        null=True,
        blank=True
    )

    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    @property
    def subtotal(self):
        if self.product:
            return self.product.price * self.quantity
        elif self.project:
            return self.project.price * self.quantity
        return 0

    def __str__(self):
        if self.product:
            return f"{self.product.title} x {self.quantity}"
        elif self.project:
            return f"{self.project.title} x {self.quantity}"
        return f"Пустой объект x {self.quantity}"

#-------------------------------------------------------------------------------------------checkout





class Order(models.Model):
    CALL_TIME_CHOICES = (
        ('morning', 'Утром (9:00 – 12:00)'),
        ('afternoon', 'Днем (12:00 – 18:00)'),
        ('evening', 'Вечером (18:00 – 20:00)'),
        ('any', 'В любое время'),
    )

    STATUS_CHOICES = (
        ('new', 'Новая заявка'),
        ('processing', 'В обработке'),
        ('completed', 'Завершена'),
        ('cancelled', 'Отменена'),
    )

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Пользователь')

    first_name = models.CharField(max_length=50, verbose_name='Имя')
    last_name = models.CharField(max_length=50, verbose_name='Фамилия')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    email = models.EmailField(verbose_name='Email')
    call_time = models.CharField(max_length=20, choices=CALL_TIME_CHOICES, default='any',
                                 verbose_name='Удобное время для звонка')
    comment = models.TextField(blank=True, null=True, verbose_name='Комментарий')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Заявка (Order)'
        verbose_name_plural = 'Заявки (Orders)'
        ordering = ['-created_at']

    def __str__(self):
        return f"Заявка #{self.id} от {self.first_name} {self.last_name}"

    def get_total_cost(self):
        return sum(item.price for item in self.items.all())


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, verbose_name='Заявка')

    property = models.ForeignKey('Properties', on_delete=models.SET_NULL, null=True, blank=True,
                                 verbose_name='Объект недвижимости')

    project = models.ForeignKey('Projects', on_delete=models.SET_NULL, null=True, blank=True,
                                verbose_name='Жилой комплекс')

    price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name='Цена на момент заявки')

    class Meta:
        verbose_name = 'Объект в заявке'
        verbose_name_plural = 'Объекты в заявке'

    def __str__(self):
        if self.property:
            return f"Квартира: {self.property.title} (Заявка #{self.order.id})"
        elif self.project:
            return f"ЖК: {self.project.title} (Заявка #{self.order.id})"
        return f"Удаленный объект (Заявка #{self.order.id})"

#-----------------------------------------------------------------------------------------------------------------------contact

class ContactMessage(models.Model):
    first_name = models.CharField(max_length=50, verbose_name='Имя')
    last_name = models.CharField(max_length=50, verbose_name='Фамилия', blank=True, null=True)
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    subject = models.CharField(max_length=100, verbose_name='Тема')
    message = models.TextField(verbose_name='Сообщение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата отправки')

    class Meta:
        verbose_name = 'Сообщение (Контакты)'
        verbose_name_plural = 'Сообщения (Контакты)'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} от {self.first_name}"