from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import uuid

User = get_user_model()


class PlatformStats(models.Model):
    """Platform-wide statistics."""
    
    date = models.DateField(unique=True)
    
    # User statistics
    total_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    creators = models.PositiveIntegerField(default=0)
    new_creators = models.PositiveIntegerField(default=0)
    
    # Content statistics
    total_videos = models.PositiveIntegerField(default=0)
    new_videos = models.PositiveIntegerField(default=0)
    total_views = models.PositiveBigIntegerField(default=0)
    total_likes = models.PositiveBigIntegerField(default=0)
    total_comments = models.PositiveBigIntegerField(default=0)
    
    # Engagement statistics
    average_watch_time = models.PositiveIntegerField(default=0)  # in seconds
    completion_rate = models.FloatField(default=0.0)  # percentage
    bounce_rate = models.FloatField(default=0.0)  # percentage
    
    # Revenue statistics
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    creator_earnings = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    platform_fees = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Technical statistics
    total_bandwidth_used = models.PositiveBigIntegerField(default=0)  # in bytes
    storage_used = models.PositiveBigIntegerField(default=0)  # in bytes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Platform Stats - {self.date}"


class UserAnalytics(models.Model):
    """User-specific analytics."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField()
    
    # Activity
    login_count = models.PositiveIntegerField(default=0)
    session_duration = models.PositiveIntegerField(default=0)  # in seconds
    pages_visited = models.PositiveIntegerField(default=0)
    
    # Content interaction
    videos_watched = models.PositiveIntegerField(default=0)
    videos_liked = models.PositiveIntegerField(default=0)
    videos_shared = models.PositiveIntegerField(default=0)
    comments_made = models.PositiveIntegerField(default=0)
    
    # Creator specific
    videos_uploaded = models.PositiveIntegerField(default=0)
    views_received = models.PositiveIntegerField(default=0)
    likes_received = models.PositiveIntegerField(default=0)
    earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.display_name} - {self.date}"


class VideoAnalytics(models.Model):
    """Video-specific analytics."""
    
    video_id = models.UUIDField()
    date = models.DateField()
    
    # View statistics
    views = models.PositiveIntegerField(default=0)
    unique_views = models.PositiveIntegerField(default=0)
    watch_time = models.PositiveBigIntegerField(default=0)  # in seconds
    average_watch_time = models.PositiveIntegerField(default=0)  # in seconds
    completion_rate = models.FloatField(default=0.0)  # percentage
    
    # Engagement
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    downloads = models.PositiveIntegerField(default=0)
    
    # Geographic data
    views_by_country = models.JSONField(default=dict)
    views_by_device = models.JSONField(default=dict)
    views_by_browser = models.JSONField(default=dict)
    
    # Revenue
    revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['video_id', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Video {self.video_id} - {self.date}"


class CreatorAnalytics(models.Model):
    """Creator-specific analytics."""
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='creator_analytics')
    date = models.DateField()
    
    # Content
    total_videos = models.PositiveIntegerField(default=0)
    videos_uploaded = models.PositiveIntegerField(default=0)
    total_views = models.PositiveBigIntegerField(default=0)
    total_watch_time = models.PositiveBigIntegerField(default=0)  # in seconds
    
    # Engagement
    total_likes = models.PositiveBigIntegerField(default=0)
    total_comments = models.PositiveBigIntegerField(default=0)
    total_shares = models.PositiveBigIntegerField(default=0)
    
    # Audience
    subscribers = models.PositiveIntegerField(default=0)
    new_subscribers = models.PositiveIntegerField(default=0)
    active_subscribers = models.PositiveIntegerField(default=0)
    
    # Revenue
    subscription_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pay_per_view_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tip_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Performance metrics
    average_views_per_video = models.FloatField(default=0.0)
    average_likes_per_video = models.FloatField(default=0.0)
    average_watch_time_per_video = models.PositiveIntegerField(default=0)  # in seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['creator', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.creator.display_name} - {self.date}"


class EventTracking(models.Model):
    """Track user events for analytics."""
    
    EVENT_TYPES = (
        ('page_view', 'Page View'),
        ('video_play', 'Video Play'),
        ('video_pause', 'Video Pause'),
        ('video_complete', 'Video Complete'),
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('share', 'Share'),
        ('subscribe', 'Subscribe'),
        ('upload', 'Upload'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events', null=True, blank=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    
    # Event details
    page_url = models.URLField(blank=True)
    referrer = models.URLField(blank=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # Content context
    content_type = models.CharField(max_length=20, blank=True)  # video, user, etc.
    content_id = models.UUIDField(blank=True, null=True)
    
    # Additional data
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.event_type} - {self.user.display_name if self.user else 'Anonymous'}"


class SearchAnalytics(models.Model):
    """Track search behavior."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='searches', null=True, blank=True)
    
    # Search details
    query = models.CharField(max_length=500)
    results_count = models.PositiveIntegerField(default=0)
    filters_used = models.JSONField(default=dict, blank=True)
    
    # Results
    clicked_result = models.UUIDField(blank=True, null=True)
    position_clicked = models.PositiveIntegerField(blank=True, null=True)
    
    # Session
    session_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Search: {self.query[:50]}..."


class RetentionAnalytics(models.Model):
    """User retention analytics."""
    
    cohort_date = models.DateField()  # When users first joined
    period = models.PositiveIntegerField()  # Days since cohort date
    
    # Cohort size
    cohort_size = models.PositiveIntegerField(default=0)
    retained_users = models.PositiveIntegerField(default=0)
    retention_rate = models.FloatField(default=0.0)  # percentage
    
    # Activity
    active_users = models.PositiveIntegerField(default=0)
    videos_watched = models.PositiveIntegerField(default=0)
    engagement_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['cohort_date', 'period']
        ordering = ['-cohort_date', 'period']
    
    def __str__(self):
        return f"Cohort {self.cohort_date} - Day {self.period}"


class GeographicAnalytics(models.Model):
    """Geographic distribution analytics."""
    
    date = models.DateField()
    country = models.CharField(max_length=100)
    
    # User statistics
    total_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    
    # Content statistics
    videos_uploaded = models.PositiveIntegerField(default=0)
    total_views = models.PositiveBigIntegerField(default=0)
    total_watch_time = models.PositiveBigIntegerField(default=0)  # in seconds
    
    # Revenue
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['date', 'country']
        ordering = ['-date', 'country']
    
    def __str__(self):
        return f"{self.country} - {self.date}"


class DeviceAnalytics(models.Model):
    """Device and platform analytics."""
    
    date = models.DateField()
    device_type = models.CharField(max_length=50)  # desktop, mobile, tablet
    platform = models.CharField(max_length=50)  # ios, android, web
    browser = models.CharField(max_length=50, blank=True)
    
    # Usage statistics
    total_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    total_views = models.PositiveBigIntegerField(default=0)
    total_watch_time = models.PositiveBigIntegerField(default=0)  # in seconds
    
    # Performance
    average_session_duration = models.PositiveIntegerField(default=0)  # in seconds
    bounce_rate = models.FloatField(default=0.0)  # percentage
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['date', 'device_type', 'platform', 'browser']
        ordering = ['-date', 'device_type', 'platform']
    
    def __str__(self):
        return f"{self.device_type} - {self.platform} - {self.date}" 