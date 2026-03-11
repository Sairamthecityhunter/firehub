from django.urls import path
from . import views

app_name = 'content'

urlpatterns = [
    # Video endpoints
    path('videos/', views.VideoListView.as_view(), name='video-list'),
    path('videos/<uuid:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('videos/upload/', views.VideoUploadView.as_view(), name='video-upload'),
    path('videos/<uuid:pk>/update/', views.VideoUpdateView.as_view(), name='video-update'),
    path('videos/<uuid:pk>/delete/', views.VideoDeleteView.as_view(), name='video-delete'),
    path('videos/<uuid:pk>/like/', views.VideoLikeView.as_view(), name='video-like'),
    path('videos/<uuid:pk>/report/', views.VideoReportView.as_view(), name='video-report'),
    path('videos/<uuid:pk>/share/', views.VideoShareView.as_view(), name='video-share'),
    path('videos/<uuid:pk>/download/', views.VideoDownloadView.as_view(), name='video-download'),
    path('videos/<uuid:pk>/purchase/', views.VideoPurchaseView.as_view(), name='video-purchase'),
    
    # Comment endpoints
    path('videos/<uuid:video_id>/comments/', views.CommentListView.as_view(), name='comment-list'),
    path('comments/<uuid:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('comments/<uuid:pk>/like/', views.CommentLikeView.as_view(), name='comment-like'),
    
    # Playlist endpoints
    path('playlists/', views.PlaylistListView.as_view(), name='playlist-list'),
    path('playlists/<uuid:pk>/', views.PlaylistDetailView.as_view(), name='playlist-detail'),
    path('playlists/<uuid:pk>/videos/', views.PlaylistVideosView.as_view(), name='playlist-videos'),
    
    # Category and tag endpoints
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('tags/', views.TagListView.as_view(), name='tag-list'),
] 