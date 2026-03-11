from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
import uuid

User = get_user_model()


class Category(models.Model):
    """Video categories."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Tag(models.Model):
    """Video tags."""
    
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    usage_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return self.name


class Video(models.Model):
    """Video content model."""
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('processing', 'Processing'),
        ('pending_review', 'Pending Review'),
        ('published', 'Published'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    )
    
    ACCESS_CHOICES = (
        ('public', 'Public'),
        ('subscribers', 'Subscribers Only'),
        ('pay_per_view', 'Pay Per View'),
        ('private', 'Private'),
    )
    
    # Basic information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    
    # Video files
    original_file = models.FileField(upload_to='videos/original/')
    processed_file = models.FileField(upload_to='videos/processed/', blank=True, null=True)
    hls_playlist = models.FileField(upload_to='videos/hls/', blank=True, null=True)
    
    # Metadata
    duration = models.PositiveIntegerField(default=0)  # in seconds
    file_size = models.PositiveBigIntegerField(default=0)  # in bytes
    resolution = models.CharField(max_length=20, blank=True)
    format = models.CharField(max_length=10, blank=True)
    
    # Status and access
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    access_level = models.CharField(max_length=20, choices=ACCESS_CHOICES, default='public')
    is_featured = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    
    # Pricing
    price = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    
    # Categories and tags
    categories = models.ManyToManyField(Category, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    
    # Statistics
    views = models.PositiveBigIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    downloads = models.PositiveIntegerField(default=0)
    
    # Engagement
    average_watch_time = models.PositiveIntegerField(default=0)  # in seconds
    completion_rate = models.FloatField(default=0.0)  # percentage
    
    # Moderation
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='reviewed_videos'
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def like_ratio(self):
        total = self.likes + self.dislikes
        return (self.likes / total * 100) if total > 0 else 0
    
    @property
    def is_published(self):
        return self.status == 'published'
    
    @property
    def is_processing(self):
        return self.status == 'processing'


class VideoView(models.Model):
    """Track individual video views."""
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='video_views')
    viewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='viewed_videos')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    watch_duration = models.PositiveIntegerField(default=0)  # in seconds
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['video', 'viewer', 'ip_address']
        ordering = ['-created_at']


class VideoLike(models.Model):
    """Video likes/dislikes."""
    
    LIKE_CHOICES = (
        (1, 'Like'),
        (-1, 'Dislike'),
    )
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='likes_dislikes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_likes')
    value = models.SmallIntegerField(choices=LIKE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['video', 'user']
        ordering = ['-created_at']


class Comment(models.Model):
    """Video comments."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('spam', 'Spam'),
    )
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='replies')
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Moderation
    is_flagged = models.BooleanField(default=False)
    flag_reason = models.TextField(blank=True)
    moderated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='moderated_comments'
    )
    moderated_at = models.DateTimeField(blank=True, null=True)
    
    # Engagement
    likes = models.PositiveIntegerField(default=0)
    dislikes = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.author.display_name} on {self.video.title}"


class CommentLike(models.Model):
    """Comment likes/dislikes."""
    
    LIKE_CHOICES = (
        (1, 'Like'),
        (-1, 'Dislike'),
    )
    
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes_dislikes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comment_likes')
    value = models.SmallIntegerField(choices=LIKE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['comment', 'user']


class VideoShare(models.Model):
    """Track video shares."""
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_videos')
    platform = models.CharField(max_length=50)  # facebook, twitter, etc.
    share_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class VideoDownload(models.Model):
    """Track video downloads."""
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='downloads')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='downloaded_videos')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class Playlist(models.Model):
    """User playlists."""
    
    VISIBILITY_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
        ('unlisted', 'Unlisted'),
    )
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    videos = models.ManyToManyField(Video, through='PlaylistVideo')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class PlaylistVideo(models.Model):
    """Through model for playlist videos."""
    
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'added_at']
        unique_together = ['playlist', 'video']


class VideoReport(models.Model):
    """Video reports for moderation."""
    
    REASON_CHOICES = (
        ('inappropriate', 'Inappropriate Content'),
        ('copyright', 'Copyright Violation'),
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    )
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_videos')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    is_resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='resolved_reports'
    )
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report on {self.video.title} by {self.reporter.display_name}" 