from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path

from root import settings

# --- ИМПОРТЫ: ГЛАВНЫЕ СТРАНИЦЫ ---
from app.views.other import Index, AboutView, ContactView

# --- ИМПОРТЫ: ОБЪЕКТЫ И ПРОЕКТЫ ---
from app.views.other import ProjectsView, PropertiesView, PropertyDetailView, ProjectDetailView

# --- ИМПОРТЫ: КОРЗИНА И ОФОРМЛЕНИЕ ЗАЯВКИ ---
from app.views.cart import AddToCartView, SavatchaView, RemoveCartItemView, UpdateCartItemView, AddToBuyView, \
    CheckoutView, AddProjectToCartView

# --- ИМПОРТЫ: АВТОРИЗАЦИЯ И АККАУНТ ---
from app.views.auth import LoginView, RegisterView, UserLogoutView, ConfirmPasswordView, VerifyEmailView
from app.views.auth_forgot import ResetPasswordView, ForgotPasswordView
from app.views.other import ProfileView, FavoritesView

urlpatterns = [
                  path('admin/', admin.site.urls),

                  # ==========================================
                  # 1. MAIN PAGES (ГЛАВНЫЕ СТРАНИЦЫ)
                  # ==========================================
                  path('', Index.as_view(), name='index'),
                  path('about/', AboutView.as_view(), name='about'),
                  path('contact/', ContactView.as_view(), name='contact'),

                  # ==========================================
                  # 2. PROPERTIES & PROJECTS (ОБЪЕКТЫ И ПРОЕКТЫ)
                  # ==========================================
                  path('properties/', PropertiesView.as_view(), name='properties'),
                  path('property-detail/<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
                  path('projects/', ProjectsView.as_view(), name='projects'),
                  path('project-detail/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),

                  # ==========================================
                  # 3. CART & ORDER (КОРЗИНА И ОФОРМЛЕНИЕ ЗАЯВКИ)
                  # ==========================================
                  path('savatcha/', SavatchaView.as_view(), name='savatcha'),
                  path('add-to-cart/<int:pk>/', AddToCartView.as_view(), name='add-to-cart'),
                  path('remove-cart-item/<int:item_id>/', RemoveCartItemView.as_view(), name='remove-cart-item'),
                  path('update-cart-item/<int:item_id>/', UpdateCartItemView.as_view(), name='update-cart-item'),
                  path('add-to-buy/', AddToBuyView.as_view(), name='add-to-buy'),
                  path('checkout/<int:pk>/', CheckoutView.as_view(), name='checkout'),
                  path('add-project-to-cart/<int:pk>/', AddProjectToCartView.as_view(), name='add-project-to-cart'),

                  # ==========================================
                  # 4. AUTHENTICATION & PROFILE (АВТОРИЗАЦИЯ И АККАУНТ)
                  # ==========================================
                  path('login/', LoginView.as_view(template_name='login.html'), name='login'),
                  path('register/', RegisterView.as_view(), name='register'),
                  path('logout/', UserLogoutView.as_view(), name='logout'),
                  path('profile/', ProfileView.as_view(), name='profile'),
                  path('favorites/', FavoritesView.as_view(), name='favorites'),

                  # Сброс и подтверждение пароля / email
                  path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
                  path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
                  path('confirm-password/', ConfirmPasswordView.as_view(), name='confirm-password'),
                  path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),

              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
