from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Subscription, Payment, Tip, Payout, PayoutMethod, 
    CreatorEarnings, PaymentMethod, Invoice
)

User = get_user_model()


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for subscriptions."""
    
    subscriber = serializers.ReadOnlyField(source='subscriber.display_name')
    creator = serializers.ReadOnlyField(source='creator.display_name')
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'subscriber', 'creator', 'status', 'amount', 'currency',
            'billing_cycle', 'next_billing_date', 'created_at', 'cancelled_at'
        ]
        read_only_fields = ['subscriber', 'creator', 'created_at', 'cancelled_at']


class SubscriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating subscriptions."""
    
    class Meta:
        model = Subscription
        fields = ['amount', 'billing_cycle']
    
    def validate(self, data):
        creator_id = self.context['creator_id']
        creator = User.objects.get(id=creator_id)
        
        if not creator.is_creator:
            raise serializers.ValidationError("User is not a creator")
        
        if creator == self.context['request'].user:
            raise serializers.ValidationError("Cannot subscribe to yourself")
        
        # Check if subscription already exists
        existing = Subscription.objects.filter(
            subscriber=self.context['request'].user,
            creator=creator
        ).first()
        
        if existing and existing.status == 'active':
            raise serializers.ValidationError("Already subscribed to this creator")
        
        return data
    
    def create(self, validated_data):
        creator_id = self.context['creator_id']
        creator = User.objects.get(id=creator_id)
        
        # Cancel existing subscription if any
        Subscription.objects.filter(
            subscriber=self.context['request'].user,
            creator=creator
        ).update(status='cancelled')
        
        return Subscription.objects.create(
            subscriber=self.context['request'].user,
            creator=creator,
            **validated_data
        )


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments."""
    
    payer = serializers.ReadOnlyField(source='payer.display_name')
    payee = serializers.ReadOnlyField(source='payee.display_name')
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payer', 'payee', 'payment_type', 'amount', 'currency',
            'platform_fee', 'net_amount', 'status', 'payment_method',
            'transaction_id', 'description', 'created_at', 'completed_at'
        ]
        read_only_fields = [
            'payer', 'payee', 'platform_fee', 'net_amount', 'status',
            'transaction_id', 'created_at', 'completed_at'
        ]


class TipSerializer(serializers.ModelSerializer):
    """Serializer for tips."""
    
    tipper = serializers.ReadOnlyField(source='tipper.display_name')
    creator = serializers.ReadOnlyField(source='creator.display_name')
    
    class Meta:
        model = Tip
        fields = [
            'id', 'tipper', 'creator', 'amount', 'currency', 'message',
            'is_anonymous', 'video', 'created_at'
        ]
        read_only_fields = ['tipper', 'creator', 'created_at']


class TipCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tips."""
    
    class Meta:
        model = Tip
        fields = ['amount', 'message', 'is_anonymous', 'video']
    
    def validate(self, data):
        creator_id = self.context['creator_id']
        creator = User.objects.get(id=creator_id)
        
        if not creator.is_creator:
            raise serializers.ValidationError("User is not a creator")
        
        if creator == self.context['request'].user:
            raise serializers.ValidationError("Cannot tip yourself")
        
        if not creator.is_accepting_tips:
            raise serializers.ValidationError("Creator is not accepting tips")
        
        return data
    
    def create(self, validated_data):
        creator_id = self.context['creator_id']
        creator = User.objects.get(id=creator_id)
        
        # Create payment record
        payment = Payment.objects.create(
            payer=self.context['request'].user,
            payee=creator,
            payment_type='tip',
            amount=validated_data['amount'],
            currency='USD',
            platform_fee=validated_data['amount'] * 0.10,  # 10% platform fee
            net_amount=validated_data['amount'] * 0.90,
            description=f"Tip to {creator.display_name}",
            status='completed'
        )
        
        # Create tip record
        return Tip.objects.create(
            tipper=self.context['request'].user,
            creator=creator,
            payment=payment,
            **validated_data
        )


class PayoutSerializer(serializers.ModelSerializer):
    """Serializer for payouts."""
    
    creator = serializers.ReadOnlyField(source='creator.display_name')
    
    class Meta:
        model = Payout
        fields = [
            'id', 'creator', 'amount', 'currency', 'payout_method',
            'status', 'transaction_id', 'created_at', 'processed_at'
        ]
        read_only_fields = ['creator', 'status', 'transaction_id', 'created_at', 'processed_at']


class PayoutRequestSerializer(serializers.ModelSerializer):
    """Serializer for requesting payouts."""
    
    class Meta:
        model = Payout
        fields = ['amount', 'payout_method', 'payout_details']
    
    def validate(self, data):
        user = self.context['request'].user
        
        if not user.is_creator:
            raise serializers.ValidationError("Only creators can request payouts")
        
        # Check minimum payout amount
        if data['amount'] < 50:  # $50 minimum
            raise serializers.ValidationError("Minimum payout amount is $50")
        
        # Check available balance
        # TODO: Calculate available balance from earnings
        # available_balance = calculate_available_balance(user)
        # if data['amount'] > available_balance:
        #     raise serializers.ValidationError("Insufficient balance")
        
        return data
    
    def create(self, validated_data):
        return Payout.objects.create(
            creator=self.context['request'].user,
            **validated_data
        )


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods."""
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'method_type', 'is_default', 'is_verified',
            'processor_id', 'created_at'
        ]
        read_only_fields = ['is_verified', 'processor_id', 'created_at']


class PaymentMethodCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payment methods."""
    
    class Meta:
        model = PaymentMethod
        fields = ['method_type', 'payment_details']
    
    def create(self, validated_data):
        # TODO: Integrate with payment processor (Stripe, etc.)
        # processor_id = create_payment_method(validated_data)
        # validated_data['processor_id'] = processor_id
        
        return PaymentMethod.objects.create(
            user=self.context['request'].user,
            **validated_data
        )


class PayoutMethodSerializer(serializers.ModelSerializer):
    """Serializer for payout methods."""
    
    class Meta:
        model = PayoutMethod
        fields = [
            'id', 'method_type', 'is_default', 'is_verified',
            'account_details', 'created_at'
        ]
        read_only_fields = ['is_verified', 'created_at']


class PayoutMethodCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payout methods."""
    
    class Meta:
        model = PayoutMethod
        fields = ['method_type', 'account_details']
    
    def create(self, validated_data):
        return PayoutMethod.objects.create(
            user=self.context['request'].user,
            **validated_data
        )


class CreatorEarningsSerializer(serializers.ModelSerializer):
    """Serializer for creator earnings."""
    
    creator = serializers.ReadOnlyField(source='creator.display_name')
    
    class Meta:
        model = CreatorEarnings
        fields = [
            'id', 'creator', 'period_start', 'period_end',
            'subscription_earnings', 'pay_per_view_earnings', 'tip_earnings',
            'total_earnings', 'platform_fees', 'net_earnings',
            'total_payouts', 'pending_balance', 'created_at'
        ]
        read_only_fields = [
            'creator', 'subscription_earnings', 'pay_per_view_earnings',
            'tip_earnings', 'total_earnings', 'platform_fees', 'net_earnings',
            'total_payouts', 'pending_balance', 'created_at'
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoices."""
    
    customer = serializers.ReadOnlyField(source='customer.display_name')
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'subtotal', 'tax_amount',
            'total_amount', 'currency', 'status', 'issue_date', 'due_date',
            'paid_date', 'created_at'
        ]
        read_only_fields = [
            'customer', 'status', 'paid_date', 'created_at'
        ] 