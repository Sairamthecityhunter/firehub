from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Tag, Video, VideoView, VideoLike, Comment, CommentLike,
    VideoShare, VideoDownload, Playlist, PlaylistVideo, VideoReport
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'order', 'video_count']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    prepopulated_fields = {'slug': ('name',)}
    
    def video_count(self, obj):
        return obj.video_set.count()
    video_count.short_description = 'Videos'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'usage_count']
    search_fields = ['name']
    ordering = ['-usage_count', 'name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'creator', 'status', 'access_level', 'views', 'likes',
        'created_at', 'is_featured', 'is_flagged'
    ]
    list_filter = [
        'status', 'access_level', 'is_featured', 'is_flagged', 
        'categories', 'created_at'
    ]
    search_fields = ['title', 'description', 'creator__display_name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('creator', 'title', 'description', 'thumbnail')
        }),
        ('Video Files', {
            'fields': ('original_file', 'processed_file', 'hls_playlist'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('duration', 'file_size', 'resolution', 'format'),
            'classes': ('collapse',)
        }),
        ('Status & Access', {
            'fields': ('status', 'access_level', 'is_featured', 'is_premium', 'price')
        }),
        ('Categories & Tags', {
            'fields': ('categories', 'tags')
        }),
        ('Statistics', {
            'fields': ('views', 'likes', 'dislikes', 'shares', 'downloads', 'average_watch_time', 'completion_rate'),
            'classes': ('collapse',)
        }),
        ('Moderation', {
            'fields': ('is_flagged', 'flag_reason', 'reviewed_by', 'reviewed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'published_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'views', 'likes', 'dislikes', 'shares', 'downloads', 
        'average_watch_time', 'completion_rate', 'created_at', 'updated_at'
    ]
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('creator').prefetch_related('categories', 'tags')


@admin.register(VideoView)
class VideoViewAdmin(admin.ModelAdmin):
    list_display = ['video', 'viewer', 'ip_address', 'watch_duration', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'created_at']
    search_fields = ['video__title', 'viewer__display_name', 'ip_address']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'


@admin.register(VideoLike)
class VideoLikeAdmin(admin.ModelAdmin):
    list_display = ['video', 'user', 'value', 'created_at']
    list_filter = ['value', 'created_at']
    search_fields = ['video__title', 'user__display_name']
    ordering = ['-created_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        'video', 'author', 'status', 'likes', 'dislikes', 
        'is_flagged', 'created_at'
    ]
    list_filter = ['status', 'is_flagged', 'created_at']
    search_fields = ['content', 'video__title', 'author__display_name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Comment Information', {
            'fields': ('video', 'author', 'parent', 'content', 'status')
        }),
        ('Engagement', {
            'fields': ('likes', 'dislikes'),
            'classes': ('collapse',)
        }),
        ('Moderation', {
            'fields': ('is_flagged', 'flag_reason', 'moderated_by', 'moderated_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['likes', 'dislikes', 'created_at', 'updated_at']


@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['comment', 'user', 'value', 'created_at']
    list_filter = ['value', 'created_at']
    search_fields = ['comment__content', 'user__display_name']
    ordering = ['-created_at']


@admin.register(VideoShare)
class VideoShareAdmin(admin.ModelAdmin):
    list_display = ['video', 'user', 'platform', 'created_at']
    list_filter = ['platform', 'created_at']
    search_fields = ['video__title', 'user__display_name', 'platform']
    ordering = ['-created_at']


@admin.register(VideoDownload)
class VideoDownloadAdmin(admin.ModelAdmin):
    list_display = ['video', 'user', 'ip_address', 'created_at']
    list_filter = ['created_at']
    search_fields = ['video__title', 'user__display_name', 'ip_address']
    ordering = ['-created_at']


@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'visibility', 'video_count', 'created_at']
    list_filter = ['visibility', 'created_at']
    search_fields = ['title', 'creator__display_name']
    ordering = ['-created_at']
    
    def video_count(self, obj):
        return obj.videos.count()
    video_count.short_description = 'Videos'


@admin.register(PlaylistVideo)
class PlaylistVideoAdmin(admin.ModelAdmin):
    list_display = ['playlist', 'video', 'order', 'added_at']
    list_filter = ['added_at']
    search_fields = ['playlist__title', 'video__title']
    ordering = ['playlist', 'order']


@admin.register(VideoReport)
class VideoReportAdmin(admin.ModelAdmin):
    list_display = [
        'video', 'reporter', 'reason', 'is_resolved', 
        'resolved_by', 'created_at'
    ]
    list_filter = ['reason', 'is_resolved', 'created_at']
    search_fields = ['video__title', 'reporter__display_name', 'description']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Report Information', {
            'fields': ('video', 'reporter', 'reason', 'description')
        }),
        ('Resolution', {
            'fields': ('is_resolved', 'resolved_by', 'resolved_at', 'resolution_notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at'] 