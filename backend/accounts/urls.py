from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('join/', views.join_couple, name='join-couple'),
    path('logout/', views.logout_view, name='logout'),
    path('refresh/', views.refresh_token, name='token-refresh'),
    
    # Couple & Profile
    path('couple-info/', views.get_couple_info, name='couple-info'),
    path('invite-code/', views.get_invite_code, name='invite-code'),
    path('profile/', views.user_profile, name='user-profile'),
    path('partner-profile/', views.partner_profile, name='partner-profile'), 
    
    # Couple Updates
    path('update-couple/', views.update_couple, name='update-couple'),
    path('change-password/', views.change_password, name='change-password'),
    
    # Profile Picture Uploads (Current User)
    path('upload-profile-picture/', views.upload_profile_picture, name='upload-profile-picture'),
    path('upload-hover-profile-picture/', views.upload_hover_profile_picture, name='upload-hover-profile-picture'),
    
    # Partner Profile Picture Uploads (NEW)
    path('partner/upload-profile-picture/', views.partner_upload_profile_picture, name='partner-upload-profile-picture'),
    path('partner/upload-hover-profile-picture/', views.partner_upload_hover_profile_picture, name='partner-upload-hover-profile-picture'),
    
    # Contact
    path('contact/', views.contact, name='contact'),
]