from django.urls import path
from . import views

app_name = 'moderation'

urlpatterns = [
    # Report management
    path('reports/', views.ReportListView.as_view(), name='report-list'),
    path('reports/<uuid:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
    path('reports/<uuid:pk>/resolve/', views.ReportResolveView.as_view(), name='report-resolve'),
    
    # Content moderation
    path('flagged-content/', views.FlaggedContentView.as_view(), name='flagged-content'),
    path('content/<uuid:pk>/approve/', views.ContentApproveView.as_view(), name='content-approve'),
    path('content/<uuid:pk>/reject/', views.ContentRejectView.as_view(), name='content-reject'),
    path('content/<uuid:pk>/suspend/', views.ContentSuspendView.as_view(), name='content-suspend'),
    
    # User moderation
    path('flagged-users/', views.FlaggedUserView.as_view(), name='flagged-users'),
    path('users/<uuid:pk>/warn/', views.UserWarnView.as_view(), name='user-warn'),
    path('users/<uuid:pk>/suspend/', views.UserSuspendView.as_view(), name='user-suspend'),
    path('users/<uuid:pk>/ban/', views.UserBanView.as_view(), name='user-ban'),
] 