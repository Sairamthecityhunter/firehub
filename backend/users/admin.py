from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, CreatorProfile, VerificationRequest
from django.utils import timezone


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'display_name', 'email', 'user_type', 'verification_status', 
        'is_age_verified', 'is_identity_verified', 'created_at', 'is_active'
    ]
    list_filter = [
        'user_type', 'verification_status', 'is_age_verified', 
        'is_identity_verified', 'is_active', 'created_at'
    ]
    search_fields = ['display_name', 'email', 'username']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('EroStream Profile', {
            'fields': (
                'user_type', 'verification_status', 'is_age_verified', 
                'is_identity_verified', 'bio', 'avatar', 'cover_image',
                'country', 'timezone', 'language', 'creator_since',
                'total_earnings', 'subscription_price', 'is_accepting_tips',
                'is_private', 'show_online_status', 'allow_messages'
            )
        }),
        ('Verification Documents', {
            'fields': ('id_document', 'selfie_with_id', 'consent_form'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['creator_since', 'total_earnings', 'created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('creator_profile')


@admin.register(CreatorProfile)
class CreatorProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'total_videos', 'total_views', 'total_likes', 
        'total_subscribers', 'verification_date', 'created_at'
    ]
    list_filter = ['verification_date', 'auto_approve_comments', 'watermark_videos', 'created_at']
    search_fields = ['user__display_name', 'user__email']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Creator Information', {
            'fields': ('user', 'categories', 'tags', 'website', 'twitter', 'instagram', 'onlyfans')
        }),
        ('Statistics', {
            'fields': ('total_videos', 'total_views', 'total_likes', 'total_subscribers'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('auto_approve_comments', 'watermark_videos', 'allow_downloads'),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': ('verification_date', 'verified_by'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['total_videos', 'total_views', 'total_likes', 'total_subscribers', 'created_at', 'updated_at']


@admin.register(VerificationRequest)
class VerificationRequestAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'status', 'reviewed_by', 'created_at', 'reviewed_at'
    ]
    list_filter = ['status', 'created_at', 'reviewed_at']
    search_fields = ['user__display_name', 'user__email']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Request Information', {
            'fields': ('user', 'status', 'created_at', 'updated_at')
        }),
        ('Documents', {
            'fields': ('id_document', 'selfie_with_id', 'consent_form'),
            'classes': ('collapse',)
        }),
        ('Review', {
            'fields': ('reviewed_by', 'reviewed_at', 'rejection_reason'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            obj.reviewed_by = request.user
            obj.reviewed_at = timezone.now()
        super().save_model(request, obj, form, change) 