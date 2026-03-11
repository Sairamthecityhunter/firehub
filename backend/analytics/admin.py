from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    PlatformStats, UserAnalytics, VideoAnalytics, CreatorAnalytics,
    EventTracking, SearchAnalytics, RetentionAnalytics, 
    GeographicAnalytics, DeviceAnalytics
)


@admin.register(PlatformStats)
class PlatformStatsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_users', 'new_users', 'active_users', 
        'total_videos', 'total_views', 'total_revenue'
    ]
    list_filter = ['date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Date', {
            'fields': ('date',)
        }),
        ('User Statistics', {
            'fields': ('total_users', 'new_users', 'active_users', 'creators', 'new_creators')
        }),
        ('Content Statistics', {
            'fields': ('total_videos', 'new_videos', 'total_views', 'total_likes', 'total_comments')
        }),
        ('Engagement Statistics', {
            'fields': ('average_watch_time', 'completion_rate', 'bounce_rate')
        }),
        ('Revenue Statistics', {
            'fields': ('total_revenue', 'creator_earnings', 'platform_fees')
        }),
        ('Technical Statistics', {
            'fields': ('total_bandwidth_used', 'storage_used'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserAnalytics)
class UserAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'date', 'login_count', 'videos_watched', 
        'videos_liked', 'earnings'
    ]
    list_filter = ['date']
    search_fields = ['user__email', 'user__display_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('User & Date', {
            'fields': ('user', 'date')
        }),
        ('Activity', {
            'fields': ('login_count', 'session_duration', 'pages_visited')
        }),
        ('Content Interaction', {
            'fields': ('videos_watched', 'videos_liked', 'videos_shared', 'comments_made')
        }),
        ('Creator Specific', {
            'fields': ('videos_uploaded', 'views_received', 'likes_received', 'earnings'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(VideoAnalytics)
class VideoAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'video_id', 'date', 'views', 'unique_views', 
        'likes', 'comments', 'revenue'
    ]
    list_filter = ['date']
    search_fields = ['video_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Video & Date', {
            'fields': ('video_id', 'date')
        }),
        ('View Statistics', {
            'fields': ('views', 'unique_views', 'watch_time', 'average_watch_time', 'completion_rate')
        }),
        ('Engagement', {
            'fields': ('likes', 'dislikes', 'comments', 'shares', 'downloads')
        }),
        ('Geographic Data', {
            'fields': ('views_by_country', 'views_by_device', 'views_by_browser'),
            'classes': ('collapse',)
        }),
        ('Revenue', {
            'fields': ('revenue',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CreatorAnalytics)
class CreatorAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'creator', 'date', 'total_videos', 'videos_uploaded', 
        'total_views', 'subscribers', 'total_earnings'
    ]
    list_filter = ['date']
    search_fields = ['creator__email', 'creator__display_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Creator & Date', {
            'fields': ('creator', 'date')
        }),
        ('Content', {
            'fields': ('total_videos', 'videos_uploaded', 'total_views', 'total_watch_time')
        }),
        ('Engagement', {
            'fields': ('total_likes', 'total_comments', 'total_shares')
        }),
        ('Audience', {
            'fields': ('subscribers', 'new_subscribers', 'active_subscribers')
        }),
        ('Revenue', {
            'fields': ('subscription_earnings', 'pay_per_view_earnings', 'tip_earnings', 'total_earnings')
        }),
        ('Performance Metrics', {
            'fields': ('average_views_per_video', 'average_likes_per_video', 'average_watch_time_per_video'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EventTracking)
class EventTrackingAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'event_type', 'content_type', 
        'content_id', 'timestamp'
    ]
    list_filter = ['event_type', 'content_type', 'timestamp']
    search_fields = ['user__email', 'user__display_name', 'page_url']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Event Details', {
            'fields': ('user', 'event_type', 'content_type', 'content_id')
        }),
        ('Event Context', {
            'fields': ('page_url', 'referrer', 'user_agent', 'ip_address')
        }),
        ('Additional Data', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SearchAnalytics)
class SearchAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'query', 'results_count', 
        'clicked_result', 'timestamp'
    ]
    list_filter = ['timestamp']
    search_fields = ['user__email', 'user__display_name', 'query']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Search Details', {
            'fields': ('user', 'query', 'results_count', 'filters_used')
        }),
        ('Results', {
            'fields': ('clicked_result', 'position_clicked')
        }),
        ('Session', {
            'fields': ('session_id', 'ip_address'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RetentionAnalytics)
class RetentionAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'cohort_date', 'period', 'cohort_size', 'retained_users', 
        'retention_rate', 'active_users'
    ]
    list_filter = ['cohort_date', 'period']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'cohort_date'
    
    fieldsets = (
        ('Cohort Details', {
            'fields': ('cohort_date', 'period')
        }),
        ('Cohort Statistics', {
            'fields': ('cohort_size', 'retained_users', 'retention_rate')
        }),
        ('Activity', {
            'fields': ('active_users', 'videos_watched', 'engagement_score')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(GeographicAnalytics)
class GeographicAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'country', 'total_users', 'new_users', 
        'active_users', 'total_revenue'
    ]
    list_filter = ['date', 'country']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Location & Date', {
            'fields': ('date', 'country')
        }),
        ('User Statistics', {
            'fields': ('total_users', 'new_users', 'active_users')
        }),
        ('Content Statistics', {
            'fields': ('videos_uploaded', 'total_views', 'total_watch_time')
        }),
        ('Revenue', {
            'fields': ('total_revenue',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DeviceAnalytics)
class DeviceAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'device_type', 'platform', 'browser', 
        'total_users', 'active_users', 'total_views'
    ]
    list_filter = ['date', 'device_type', 'platform', 'browser']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Device & Date', {
            'fields': ('date', 'device_type', 'platform', 'browser')
        }),
        ('Usage Statistics', {
            'fields': ('total_users', 'active_users', 'total_views', 'total_watch_time')
        }),
        ('Performance', {
            'fields': ('average_session_duration', 'bounce_rate')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 