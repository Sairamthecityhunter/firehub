from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import uuid

User = get_user_model()


class ContentReport(models.Model):
    """Reports for content moderation."""
    
    CONTENT_TYPES = (
        ('video', 'Video'),
        ('comment', 'Comment'),
        ('user', 'User'),
    )
    
    REASON_CHOICES = (
        ('inappropriate', 'Inappropriate Content'),
        ('copyright', 'Copyright Violation'),
        ('spam', 'Spam'),
        ('harassment', 'Harassment'),
        ('violence', 'Violence'),
        ('hate_speech', 'Hate Speech'),
        ('other', 'Other'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('investigating', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_filed')
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    content_id = models.UUIDField()  # ID of the reported content
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField()
    evidence = models.JSONField(default=dict, blank=True)  # Screenshots, links, etc.
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Resolution
    resolved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='reports_resolved'
    )
    resolved_at = models.DateTimeField(blank=True, null=True)
    resolution_notes = models.TextField(blank=True)
    action_taken = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Report by {self.reporter.display_name} - {self.get_reason_display()}"


class ModerationAction(models.Model):
    """Actions taken by moderators."""
    
    ACTION_TYPES = (
        ('warn', 'Warning'),
        ('suspend', 'Suspension'),
        ('ban', 'Ban'),
        ('delete', 'Delete Content'),
        ('feature', 'Feature Content'),
        ('unfeature', 'Unfeature Content'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_actions')
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_actions_received')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    content_type = models.CharField(max_length=20, choices=ContentReport.CONTENT_TYPES, blank=True)
    content_id = models.UUIDField(blank=True, null=True)
    
    # Action details
    reason = models.TextField()
    duration = models.DurationField(blank=True, null=True)  # For suspensions
    notes = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_action_type_display()} on {self.target_user.display_name}"


class AutoModerationRule(models.Model):
    """Rules for automatic content moderation."""
    
    RULE_TYPES = (
        ('keyword', 'Keyword Filter'),
        ('spam', 'Spam Detection'),
        ('copyright', 'Copyright Detection'),
        ('nudity', 'Nudity Detection'),
        ('violence', 'Violence Detection'),
    )
    
    name = models.CharField(max_length=100)
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES)
    is_active = models.BooleanField(default=True)
    
    # Rule configuration
    config = models.JSONField(default=dict)
    
    # Actions
    action = models.CharField(max_length=20, choices=ModerationAction.ACTION_TYPES)
    action_duration = models.DurationField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ModerationQueue(models.Model):
    """Queue for content awaiting moderation."""
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content_type = models.CharField(max_length=20, choices=ContentReport.CONTENT_TYPES)
    content_id = models.UUIDField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Queue management
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='moderation_queue_assigned'
    )
    is_claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(blank=True, null=True)
    
    # Processing
    is_processed = models.BooleanField(default=False)
    processed_at = models.DateTimeField(blank=True, null=True)
    processed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='moderation_queue_processed'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.get_content_type_display()} - {self.get_priority_display()}"


class ModerationLog(models.Model):
    """Log of all moderation activities."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    moderator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_logs')
    action = models.CharField(max_length=100)
    target_type = models.CharField(max_length=20, choices=ContentReport.CONTENT_TYPES)
    target_id = models.UUIDField()
    
    # Details
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.moderator.display_name} - {self.action}"


class BannedUser(models.Model):
    """List of banned users."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ban_info')
    banned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='users_banned')
    reason = models.TextField()
    is_permanent = models.BooleanField(default=False)
    expires_at = models.DateTimeField(blank=True, null=True)
    
    # Appeal
    can_appeal = models.BooleanField(default=True)
    appeal_deadline = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Banned: {self.user.display_name}"
    
    @property
    def is_active(self):
        if self.is_permanent:
            return True
        if self.expires_at:
            from django.utils import timezone
            return timezone.now() < self.expires_at
        return True


class Appeal(models.Model):
    """User appeals for moderation actions."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appeals')
    moderation_action = models.ForeignKey(ModerationAction, on_delete=models.CASCADE, related_name='appeals')
    
    # Appeal details
    reason = models.TextField()
    evidence = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Review
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, 
        null=True, 
        related_name='appeals_reviewed'
    )
    reviewed_at = models.DateTimeField(blank=True, null=True)
    review_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Appeal by {self.user.display_name} - {self.get_status_display()}" 