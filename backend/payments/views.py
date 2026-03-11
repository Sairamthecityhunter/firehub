from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import (
    Subscription, Payment, Tip, Payout, PayoutMethod, 
    CreatorEarnings, PaymentMethod, Invoice
)
from .serializers import (
    SubscriptionSerializer, SubscriptionCreateSerializer,
    PaymentSerializer, TipSerializer, TipCreateSerializer,
    PayoutSerializer, PayoutRequestSerializer,
    PaymentMethodSerializer, PaymentMethodCreateSerializer,
    PayoutMethodSerializer, PayoutMethodCreateSerializer,
    CreatorEarningsSerializer, InvoiceSerializer
)

User = get_user_model()


class SubscriptionListView(generics.ListAPIView):
    """List user's subscriptions."""
    
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user).select_related('creator')


class SubscriptionCreateView(generics.CreateAPIView):
    """Create a subscription to a creator."""
    
    serializer_class = SubscriptionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['creator_id'] = self.kwargs['creator_id']
        return context


class SubscriptionCancelView(APIView):
    """Cancel a subscription."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        subscription = get_object_or_404(
            Subscription, 
            pk=pk, 
            subscriber=request.user
        )
        
        subscription.status = 'cancelled'
        subscription.save()
        
        return Response({'message': 'Subscription cancelled successfully'})


class PaymentListView(generics.ListAPIView):
    """List user's payments."""
    
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(payer=self.request.user).select_related('payee')


class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details."""
    
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(payer=self.request.user).select_related('payee')


class TipCreateView(generics.CreateAPIView):
    """Send a tip to a creator."""
    
    serializer_class = TipCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['creator_id'] = self.kwargs['creator_id']
        return context


class PayoutListView(generics.ListAPIView):
    """List creator's payouts."""
    
    serializer_class = PayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Payout.objects.filter(creator=self.request.user)


class PayoutRequestView(generics.CreateAPIView):
    """Request a payout."""
    
    serializer_class = PayoutRequestSerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentMethodListView(generics.ListCreateAPIView):
    """List and create payment methods."""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentMethodCreateSerializer
        return PaymentMethodSerializer


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a payment method."""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)


class PaymentMethodDeleteView(generics.DestroyAPIView):
    """Delete a payment method."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)


class PayoutMethodListView(generics.ListCreateAPIView):
    """List and create payout methods."""
    
    serializer_class = PayoutMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PayoutMethod.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PayoutMethodCreateSerializer
        return PayoutMethodSerializer


class PayoutMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a payout method."""
    
    serializer_class = PayoutMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PayoutMethod.objects.filter(user=self.request.user)


class PayoutMethodDeleteView(generics.DestroyAPIView):
    """Delete a payout method."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PayoutMethod.objects.filter(user=self.request.user)


class EarningsListView(generics.ListAPIView):
    """List creator's earnings."""
    
    serializer_class = CreatorEarningsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return CreatorEarnings.objects.filter(creator=self.request.user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def subscription_stats(request):
    """Get subscription statistics for a creator."""
    if not request.user.is_creator:
        return Response({'error': 'Only creators can access subscription stats'}, status=status.HTTP_403_FORBIDDEN)
    
    active_subscriptions = Subscription.objects.filter(
        creator=request.user, 
        status='active'
    ).count()
    
    total_earnings = request.user.total_earnings
    
    return Response({
        'active_subscribers': active_subscriptions,
        'total_earnings': total_earnings,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def creator_subscribers(request):
    """Get list of subscribers for a creator."""
    if not request.user.is_creator:
        return Response({'error': 'Only creators can access subscriber list'}, status=status.HTTP_403_FORBIDDEN)
    
    subscribers = Subscription.objects.filter(
        creator=request.user, 
        status='active'
    ).select_related('subscriber')
    
    data = []
    for sub in subscribers:
        data.append({
            'id': sub.subscriber.id,
            'display_name': sub.subscriber.display_name,
            'avatar': sub.subscriber.avatar.url if sub.subscriber.avatar else None,
            'subscribed_at': sub.created_at,
            'amount': sub.amount,
            'billing_cycle': sub.billing_cycle,
        })
    
    return Response(data) 