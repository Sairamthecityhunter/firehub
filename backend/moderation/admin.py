from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    ContentReport, ModerationAction, ModerationQueue, 
    AutoModerationRule, ModerationLog
)


@admin.register(ContentReport)
class ContentReportAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'reporter', 'content_type', 'content_object', 
        'reason', 'status', 'priority', 'created_at'
    ]
    list_filter = ['content_type', 'reason', 'status', 'priority', 'created_at']
    search_fields = ['reporter__email', 'reporter__display_name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Report Details', {
            'fields': ('reporter', 'content_type', 'content_object', 'reason', 'status')
        }),
        ('Report Information', {
            'fields': ('description', 'evidence_links', 'priority')
        }),
        ('Moderation', {
            'fields': ('assigned_moderator', 'resolution_notes', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def content_object(self, obj):
        if obj.content_type and obj.content_object:
            return str(obj.content_object)
        return "N/A"
    content_object.short_description = 'Content'


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'moderator', 'content_type', 'content_object', 
        'action_type', 'status', 'created_at'
    ]
    list_filter = ['action_type', 'status', 'created_at']
    search_fields = ['moderator__email', 'moderator__display_name', 'reason']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Action Details', {
            'fields': ('moderator', 'content_type', 'content_object', 'action_type', 'status')
        }),
        ('Action Information', {
            'fields': ('reason', 'duration', 'additional_notes')
        }),
        ('Appeal', {
            'fields': ('is_appealed', 'appeal_reason', 'appeal_resolution'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def content_object(self, obj):
        if obj.content_type and obj.content_object:
            return str(obj.content_object)
        return "N/A"
    content_object.short_description = 'Content'


@admin.register(ModerationQueue)
class ModerationQueueAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'content_type', 'content_object', 'priority', 
        'status', 'assigned_moderator', 'created_at'
    ]
    list_filter = ['content_type', 'priority', 'status', 'created_at']
    search_fields = ['assigned_moderator__email', 'assigned_moderator__display_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Queue Details', {
            'fields': ('content_type', 'content_object', 'priority', 'status')
        }),
        ('Assignment', {
            'fields': ('assigned_moderator', 'assigned_at', 'due_date')
        }),
        ('Processing', {
            'fields': ('processing_notes', 'completed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def content_object(self, obj):
        if obj.content_type and obj.content_object:
            return str(obj.content_object)
        return "N/A"
    content_object.short_description = 'Content'


@admin.register(AutoModerationRule)
class AutoModerationRuleAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'name', 'content_type', 'rule_type', 
        'is_active', 'priority', 'created_at'
    ]
    list_filter = ['content_type', 'rule_type', 'is_active', 'priority', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Rule Details', {
            'fields': ('name', 'description', 'content_type', 'rule_type', 'is_active', 'priority')
        }),
        ('Conditions', {
            'fields': ('conditions', 'threshold', 'action_type')
        }),
        ('Actions', {
            'fields': ('auto_action', 'notification_recipients'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'moderator', 'action', 'content_type', 
        'content_object', 'timestamp'
    ]
    list_filter = ['action', 'content_type', 'timestamp']
    search_fields = ['moderator__email', 'moderator__display_name', 'details']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    fieldsets = (
        ('Log Details', {
            'fields': ('moderator', 'action', 'content_type', 'content_object')
        }),
        ('Details', {
            'fields': ('details', 'ip_address', 'user_agent')
        }),
        ('Timestamps', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )

    def content_object(self, obj):
        if obj.content_type and obj.content_object:
            return str(obj.content_object)
        return "N/A"
    content_object.short_description = 'Content'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False 