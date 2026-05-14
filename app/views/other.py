from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView, DetailView, ListView
from django.views import View
from django.shortcuts import render, redirect
from django.contrib import messages
from app.models import ContactMessage
from app.models import Order
from app.models import Properties, Projects


class Index(LoginRequiredMixin, TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context['properties'] = Properties.objects.all()[:3]

        context['projects'] = Projects.objects.all()[:2]
        return context

class AboutView(TemplateView):
    template_name = 'about.html'

class ProjectsView(ListView):
    model = Projects
    template_name = 'projects.html'
    context_object_name = 'projects'

class ProjectDetailView(DetailView):
    model = Projects
    template_name = 'project-detail.html'
    context_object_name = 'projects'


class PropertiesView(ListView):
    model = Properties
    template_name = 'properties.html'
    context_object_name = 'properties'

class PropertyDetailView(DetailView):
    model = Properties
    template_name = 'property-detail.html'
    context_object_name = 'properties'




class ContactView(View):
    def get(self, request):
        return render(request, 'contact.html')

    def post(self, request):
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        subject = request.POST.get('subject')
        message = request.POST.get('message')

        ContactMessage.objects.create(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            subject=subject,
            message=message
        )

        messages.success(request, "Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.")
        return redirect('contact')


class FavoritesView(ListView):
    model = Properties
    template_name = 'favorites.html'
    context_object_name = 'properties'



class ProfileView(LoginRequiredMixin, TemplateView):
    template_name = 'profile.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['orders'] = Order.objects.filter(user=self.request.user).order_by('-created_at')
        return context