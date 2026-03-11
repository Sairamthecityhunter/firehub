from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import uuid

User = get_user_model()


class Subscription(models.Model):
    """User subscriptions to creators."""
    
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('pending', 'Pending'),
        ('failed', 'Failed'),
    )
    
    subscriber = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscribers')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Pricing
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Billing cycle
    billing_cycle = models.CharField(max_length=20, default='monthly')  # monthly, yearly
    next_billing_date = models.DateTimeField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        unique_together = ['subscriber', 'creator']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subscriber.display_name} -> {self.creator.display_name}"


class Payment(models.Model):
    """Payment transactions."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('cancelled', 'Cancelled'),
    )
    
    TYPE_CHOICES = (
        ('subscription', 'Subscription'),
        ('pay_per_view', 'Pay Per View'),
        ('tip', 'Tip'),
        ('payout', 'Payout'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    payee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_received')
    payment_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Amount and currency
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # External payment processor
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    processor_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Related objects
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, blank=True, null=True)
    video = models.ForeignKey('content.Video', on_delete=models.SET_NULL, blank=True, null=True)
    
    # Metadata
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.payment_type} - {self.amount} {self.currency}"


class Tip(models.Model):
    """User tips to creators."""
    
    tipper = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tips_given')
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tips_received')
    
    # Amount
    amount = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(0.01)])
    currency = models.CharField(max_length=3, default='USD')
    
    # Message
    message = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    # Related video (optional)
    video = models.ForeignKey('content.Video', on_delete=models.SET_NULL, blank=True, null=True)
    
    # Payment
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='tip')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Tip from {self.tipper.display_name} to {self.creator.display_name}"


class Payout(models.Model):
    """Creator payouts."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    )
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payouts')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Payout method
    payout_method = models.CharField(max_length=50)  # bank, paypal, etc.
    payout_details = models.JSONField(default=dict)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # External processor
    transaction_id = models.CharField(max_length=100, blank=True)
    processor_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payout to {self.creator.display_name} - {self.amount} {self.currency}"


class PayoutMethod(models.Model):
    """User payout methods."""
    
    METHOD_CHOICES = (
        ('bank', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('stripe', 'Stripe'),
        ('crypto', 'Cryptocurrency'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payout_methods')
    method_type = models.CharField(max_length=20, choices=METHOD_CHOICES)
    is_default = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Method details (encrypted)
    account_details = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.user.display_name} - {self.method_type}"


class CreatorEarnings(models.Model):
    """Track creator earnings."""
    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earnings')
    
    # Period
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Earnings breakdown
    subscription_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pay_per_view_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tip_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Platform fees
    platform_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Payouts
    total_payouts = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    pending_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['creator', 'period_start', 'period_end']
        ordering = ['-period_end']
    
    def __str__(self):
        return f"{self.creator.display_name} - {self.period_start} to {self.period_end}"


class PaymentMethod(models.Model):
    """User payment methods."""
    
    METHOD_CHOICES = (
        ('card', 'Credit/Debit Card'),
        ('bank', 'Bank Account'),
        ('paypal', 'PayPal'),
        ('crypto', 'Cryptocurrency'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    method_type = models.CharField(max_length=20, choices=METHOD_CHOICES)
    is_default = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    
    # Method details (encrypted)
    payment_details = models.JSONField(default=dict)
    
    # External processor
    processor_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.user.display_name} - {self.method_type}"


class Invoice(models.Model):
    """Payment invoices."""
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
        ('cancelled', 'Cancelled'),
    )
    
    invoice_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    
    # Amount
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Dates
    issue_date = models.DateField()
    due_date = models.DateField()
    paid_date = models.DateField(blank=True, null=True)
    
    # Related payment
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.customer.display_name}" 