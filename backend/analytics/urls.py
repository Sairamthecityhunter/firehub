from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # General analytics
    path('stats/', views.StatsView.as_view(), name='stats'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
    
    # Video analytics
    path('videos/<uuid:video_id>/stats/', views.VideoStatsView.as_view(), name='video-stats'),
    path('videos/<uuid:video_id>/views/', views.VideoViewsView.as_view(), name='video-views'),
    path('videos/<uuid:video_id>/engagement/', views.VideoEngagementView.as_view(), name='video-engagement'),
    
    # Creator analytics
    path('creators/<uuid:creator_id>/stats/', views.CreatorStatsView.as_view(), name='creator-stats'),
    path('creators/<uuid:creator_id>/audience/', views.CreatorAudienceView.as_view(), name='creator-audience'),
    path('creators/<uuid:creator_id>/earnings/', views.CreatorEarningsView.as_view(), name='creator-earnings'),
    
    # Platform analytics
    path('platform/overview/', views.PlatformOverviewView.as_view(), name='platform-overview'),
    path('platform/users/', views.PlatformUsersView.as_view(), name='platform-users'),
    path('platform/content/', views.PlatformContentView.as_view(), name='platform-content'),
    path('platform/revenue/', views.PlatformRevenueView.as_view(), name='platform-revenue'),
] 