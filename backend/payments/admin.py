from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Subscription, Payment, Tip, Payout, PayoutMethod, 
    CreatorEarnings, PaymentMethod, Invoice
)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'subscriber', 'creator', 'status', 'amount', 
        'currency', 'billing_cycle', 'next_billing_date', 'created_at'
    ]
    list_filter = ['status', 'billing_cycle', 'currency', 'created_at']
    search_fields = ['subscriber__email', 'subscriber__display_name', 'creator__email', 'creator__display_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Subscription Details', {
            'fields': ('subscriber', 'creator', 'status', 'amount', 'currency', 'billing_cycle')
        }),
        ('Billing', {
            'fields': ('next_billing_date', 'last_billing_date', 'cancelled_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'payment_type', 'amount', 'currency', 
        'status', 'payment_method', 'created_at'
    ]
    list_filter = ['payment_type', 'status', 'currency', 'created_at']
    search_fields = ['user__email', 'user__display_name', 'transaction_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Payment Details', {
            'fields': ('user', 'payment_type', 'amount', 'currency', 'status')
        }),
        ('Payment Method', {
            'fields': ('payment_method', 'transaction_id', 'gateway_response')
        }),
        ('Related Content', {
            'fields': ('subscription', 'video', 'tip'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Tip)
class TipAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'sender', 'recipient', 'amount', 'currency', 
        'status', 'message', 'created_at'
    ]
    list_filter = ['status', 'currency', 'created_at']
    search_fields = ['sender__email', 'sender__display_name', 'recipient__email', 'recipient__display_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Tip Details', {
            'fields': ('sender', 'recipient', 'amount', 'currency', 'status')
        }),
        ('Message', {
            'fields': ('message', 'is_anonymous')
        }),
        ('Related Content', {
            'fields': ('video',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Payout)
class PayoutAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'creator', 'amount', 'currency', 'status', 
        'payout_method', 'processed_at', 'created_at'
    ]
    list_filter = ['status', 'currency', 'created_at', 'processed_at']
    search_fields = ['creator__email', 'creator__display_name', 'reference_id']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Payout Details', {
            'fields': ('creator', 'amount', 'currency', 'status')
        }),
        ('Payout Method', {
            'fields': ('payout_method', 'reference_id', 'gateway_response')
        }),
        ('Processing', {
            'fields': ('processed_at', 'failure_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PayoutMethod)
class PayoutMethodAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'method_type', 'is_default', 
        'is_verified', 'created_at'
    ]
    list_filter = ['method_type', 'is_default', 'is_verified', 'created_at']
    search_fields = ['user__email', 'user__display_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Method Details', {
            'fields': ('user', 'method_type', 'is_default', 'is_verified')
        }),
        ('Bank Details', {
            'fields': ('bank_name', 'account_number', 'routing_number', 'account_holder_name'),
            'classes': ('collapse',)
        }),
        ('PayPal Details', {
            'fields': ('paypal_email',),
            'classes': ('collapse',)
        }),
        ('Stripe Details', {
            'fields': ('stripe_account_id',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CreatorEarnings)
class CreatorEarningsAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'creator', 'period_start', 'period_end', 
        'total_earnings', 'platform_fees', 'net_earnings', 'status'
    ]
    list_filter = ['status', 'period_start', 'period_end']
    search_fields = ['creator__email', 'creator__display_name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'period_start'
    
    fieldsets = (
        ('Earnings Period', {
            'fields': ('creator', 'period_start', 'period_end', 'status')
        }),
        ('Earnings Breakdown', {
            'fields': (
                'subscription_earnings', 'pay_per_view_earnings', 
                'tip_earnings', 'total_earnings', 'platform_fees', 'net_earnings'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'method_type', 'is_default', 
        'is_verified', 'last_four', 'created_at'
    ]
    list_filter = ['method_type', 'is_default', 'is_verified', 'created_at']
    search_fields = ['user__email', 'user__display_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Method Details', {
            'fields': ('user', 'method_type', 'is_default', 'is_verified')
        }),
        ('Card Details', {
            'fields': ('card_brand', 'last_four', 'exp_month', 'exp_year'),
            'classes': ('collapse',)
        }),
        ('Stripe Details', {
            'fields': ('stripe_payment_method_id',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'invoice_number', 'amount', 'currency', 
        'status', 'due_date', 'created_at'
    ]
    list_filter = ['status', 'currency', 'created_at', 'due_date']
    search_fields = ['user__email', 'user__display_name', 'invoice_number']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Invoice Details', {
            'fields': ('user', 'invoice_number', 'amount', 'currency', 'status')
        }),
        ('Dates', {
            'fields': ('due_date', 'paid_at')
        }),
        ('Items', {
            'fields': ('items',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    ) 