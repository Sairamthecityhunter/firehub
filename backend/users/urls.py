from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('creator-profile/', views.CreatorProfileView.as_view(), name='creator-profile'),
    path('become-creator/', views.BecomeCreatorView.as_view(), name='become-creator'),
    
    # Verification
    path('verification/request/', views.VerificationRequestView.as_view(), name='verification-request'),
    path('verification/status/', views.VerificationStatusView.as_view(), name='verification-status'),
    
    # Password management
    path('change-password/', views.PasswordChangeView.as_view(), name='change-password'),
    
    # Statistics
    path('stats/', views.UserStatsView.as_view(), name='stats'),
    
    # Utilities
    path('check-username/', views.check_username_availability, name='check-username'),
    path('upload-avatar/', views.upload_avatar, name='upload-avatar'),
    path('upload-cover/', views.upload_cover_image, name='upload-cover'),
] 