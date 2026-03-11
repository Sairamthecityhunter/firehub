from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    """Custom user model with verification and creator features."""
    
    USER_TYPES = (
        ('viewer', 'Viewer'),
        ('creator', 'Creator'),
        ('moderator', 'Moderator'),
        ('admin', 'Admin'),
    )
    
    VERIFICATION_STATUS = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )
    
    # Basic fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    
    # User type and verification
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='viewer')
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS, default='pending')
    is_age_verified = models.BooleanField(default=False)
    is_identity_verified = models.BooleanField(default=False)
    
    # Profile information
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    
    # Location and preferences
    country = models.CharField(max_length=100, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    
    # Creator specific fields
    creator_since = models.DateTimeField(blank=True, null=True)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    subscription_price = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    is_accepting_tips = models.BooleanField(default=True)
    
    # Verification documents
    id_document = models.FileField(upload_to='verification/id/', blank=True, null=True)
    selfie_with_id = models.ImageField(upload_to='verification/selfie/', blank=True, null=True)
    consent_form = models.FileField(upload_to='verification/consent/', blank=True, null=True)
    
    # Privacy settings
    is_private = models.BooleanField(default=False)
    show_online_status = models.BooleanField(default=True)
    allow_messages = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    # Required fields
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['display_name']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return self.display_name or self.email
    
    @property
    def is_creator(self):
        return self.user_type == 'creator'
    
    @property
    def is_verified_creator(self):
        return self.is_creator and self.verification_status == 'verified'
    
    def get_full_name(self):
        return self.display_name or self.email
    
    def get_short_name(self):
        return self.display_name or self.email.split('@')[0]


class CreatorProfile(models.Model):
    """Extended profile for creators."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='creator_profile')
    
    # Content categories
    categories = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    # Social links
    website = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    onlyfans = models.URLField(blank=True)
    
    # Statistics
    total_videos = models.PositiveIntegerField(default=0)
    total_views = models.PositiveBigIntegerField(default=0)
    total_likes = models.PositiveBigIntegerField(default=0)
    total_subscribers = models.PositiveIntegerField(default=0)
    
    # Settings
    auto_approve_comments = models.BooleanField(default=True)
    watermark_videos = models.BooleanField(default=True)
    allow_downloads = models.BooleanField(default=False)
    
    # Verification
    verification_date = models.DateTimeField(blank=True, null=True)
    verified_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='verified_creators'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.display_name}'s Creator Profile"


class UserSession(models.Model):
    """Track user sessions for security."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'session_key']


class VerificationRequest(models.Model):
    """Track verification requests."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('needs_info', 'Needs More Information'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Documents
    id_document = models.FileField(upload_to='verification/requests/id/')
    selfie_with_id = models.ImageField(upload_to='verification/requests/selfie/')
    consent_form = models.FileField(upload_to='verification/requests/consent/')
    
    # Review information
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='reviewed_verifications'
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Verification for {self.user.display_name} - {self.status}" 