from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import get_object_or_404, redirect, render
from django.views import View
from django.views.generic import TemplateView

from django.contrib import messages

from app.forms import CheckoutForm
from app.models import Cart, Properties, Order, OrderItem, Projects
from app.models import CartItem

def get_active_cart(user):
    cart, created = Cart.objects.get_or_create(user=user, checked_out=False)
    return cart


class CheckoutView(LoginRequiredMixin, View):
    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        form = CheckoutForm(instance=order)
        return render(request, 'checkout.html', {'order': order, 'form': form})

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        form = CheckoutForm(request.POST, instance=order)

        if form.is_valid():
            order = form.save(commit=False)

            order.status = 'processing'
            order.save()

            messages.success(request, "Ваша заявка успешно отправлена! Наш менеджер свяжется с вами в указанное время.")

            return redirect('index')

        return render(request, 'checkout.html', {'order': order, 'form': form})


class AddProjectToCartView(LoginRequiredMixin, View):
    def post(self, request, pk):
        project = get_object_or_404(Projects, pk=pk)
        cart = get_active_cart(request.user)

        item, created = CartItem.objects.get_or_create(cart=cart, project=project, product=None)

        if created:
            item.quantity = 1
        else:
            item.quantity += 1
        item.save()

        messages.success(request, f"Проект {project.title} успешно добавлен в корзину.")
        return redirect('savatcha')


class AddToBuyView(LoginRequiredMixin, View):
    def post(self, request):
        cart = get_active_cart(request.user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            messages.warning(request, "Ваша корзина пуста.")
            return redirect('savatcha')

        order = Order.objects.create(
            user=request.user,
            status='new'
        )

        for cart_item in cart_items:

            if cart_item.product:
                item_price = cart_item.product.price
            elif cart_item.project:
                item_price = cart_item.project.price
            else:
                continue

            OrderItem.objects.create(
                order=order,
                property=cart_item.product,
                project=cart_item.project,
                price=item_price
            )

        cart_items.delete()

        messages.success(request, "Объекты успешно перенесены в заявку!")
        return redirect('checkout', pk=order.pk)


class AddToCartView(LoginRequiredMixin, View):
    def post(self, request, pk):
        product = get_object_or_404(Properties, pk=pk)
        cart = get_active_cart(request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if created:
            item.quantity = 1
        else:
            item.quantity += 1
        item.save()

        messages.success(request, "Mahsulot savatchaga qo'shildi.")
        return redirect('savatcha')


class SavatchaView(LoginRequiredMixin, TemplateView):
    template_name = 'cart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        cart = Cart.objects.filter(user=self.request.user, checked_out=False).first()

        if cart:
            cart_items = cart.items.select_related('product').all()
            cart_total = cart.total_price
        else:
            cart_items = []
            cart_total = 0

        context['cart'] = cart
        context['cart_items'] = cart_items
        context['cart_total'] = cart_total
        return context


class UpdateCartItemView(LoginRequiredMixin, View):
    def post(self, request, item_id):
        item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user,
            cart__checked_out=False,
        )

        action = request.POST.get('action')
        if action == 'increase':
            item.quantity += 1
            item.save()
        elif action == 'decrease':
            if item.quantity > 1:
                item.quantity -= 1
                item.save()
            else:
                item.delete()

        return redirect('savatcha')


class RemoveCartItemView(LoginRequiredMixin, View):
    def post(self, request, item_id):
        item = get_object_or_404(
            CartItem,
            id=item_id,
            cart__user=request.user,
            cart__checked_out=False,
        )
        item.delete()
        messages.success(request, "Mahsulot savatchadan o‘chirildi.")
        return redirect('savatcha')