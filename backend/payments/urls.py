from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Subscription endpoints
    path('subscriptions/', views.SubscriptionListView.as_view(), name='subscription-list'),
    path('subscriptions/<uuid:creator_id>/', views.SubscriptionCreateView.as_view(), name='subscription-create'),
    path('subscriptions/<uuid:pk>/cancel/', views.SubscriptionCancelView.as_view(), name='subscription-cancel'),
    
    # Payment endpoints
    path('payments/', views.PaymentListView.as_view(), name='payment-list'),
    path('payments/<uuid:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    
    # Tip endpoints
    path('tips/<uuid:creator_id>/', views.TipCreateView.as_view(), name='tip-create'),
    
    # Payout endpoints
    path('payouts/', views.PayoutListView.as_view(), name='payout-list'),
    path('payouts/request/', views.PayoutRequestView.as_view(), name='payout-request'),
    
    # Payment methods
    path('payment-methods/', views.PaymentMethodListView.as_view(), name='payment-method-list'),
    path('payment-methods/<uuid:pk>/', views.PaymentMethodDetailView.as_view(), name='payment-method-detail'),
    path('payment-methods/<uuid:pk>/delete/', views.PaymentMethodDeleteView.as_view(), name='payment-method-delete'),
    
    # Payout methods
    path('payout-methods/', views.PayoutMethodListView.as_view(), name='payout-method-list'),
    path('payout-methods/<uuid:pk>/', views.PayoutMethodDetailView.as_view(), name='payout-method-detail'),
    path('payout-methods/<uuid:pk>/delete/', views.PayoutMethodDeleteView.as_view(), name='payout-method-delete'),
    
    # Earnings
    path('earnings/', views.EarningsListView.as_view(), name='earnings-list'),
] 