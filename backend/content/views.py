from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Video, Category, Tag, Comment, VideoLike, VideoShare, 
    VideoDownload, Playlist, PlaylistVideo, VideoReport
)
from .serializers import (
    VideoSerializer, VideoCreateSerializer, VideoUpdateSerializer,
    CommentSerializer, CommentCreateSerializer, VideoLikeSerializer,
    PlaylistSerializer, PlaylistVideoSerializer, VideoReportSerializer,
    CategorySerializer, TagSerializer, VideoSearchSerializer
)


class VideoListView(generics.ListAPIView):
    """List all published videos with filtering and search."""
    
    serializer_class = VideoSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categories', 'tags', 'access_level', 'is_premium']
    search_fields = ['title', 'description', 'creator__display_name']
    ordering_fields = ['created_at', 'views', 'likes', 'published_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Video.objects.filter(status='published').select_related('creator').prefetch_related('categories', 'tags')
        
        # Filter by category slug
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(categories__slug=category)
        
        # Filter by tags
        tags = self.request.query_params.getlist('tags', [])
        if tags:
            queryset = queryset.filter(tags__slug__in=tags)
        
        # Filter by duration
        duration_min = self.request.query_params.get('duration_min', None)
        duration_max = self.request.query_params.get('duration_max', None)
        if duration_min:
            queryset = queryset.filter(duration__gte=duration_min)
        if duration_max:
            queryset = queryset.filter(duration__lte=duration_max)
        
        return queryset.distinct()


class VideoDetailView(generics.RetrieveAPIView):
    """Get video details and increment view count."""
    
    serializer_class = VideoSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Video.objects.filter(status='published').select_related('creator').prefetch_related('categories', 'tags')
    
    def retrieve(self, request, *args, **kwargs):
        video = self.get_object()
        
        # Increment view count
        if request.user.is_authenticated:
            video.views += 1
            video.save()
            
            # Create view record
            VideoView.objects.create(
                video=video,
                viewer=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
        
        serializer = self.get_serializer(video)
        return Response(serializer.data)


class VideoUploadView(generics.CreateAPIView):
    """Upload a new video."""
    
    serializer_class = VideoCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        video = serializer.save()
        video.status = 'processing'
        video.save()
        
        # TODO: Trigger video processing task
        # process_video.delay(video.id)


class VideoUpdateView(generics.UpdateAPIView):
    """Update video details."""
    
    serializer_class = VideoUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Video.objects.all()
    
    def get_queryset(self):
        return Video.objects.filter(creator=self.request.user)


class VideoDeleteView(generics.DestroyAPIView):
    """Delete a video."""
    
    permission_classes = [permissions.IsAuthenticated]
    queryset = Video.objects.all()
    
    def get_queryset(self):
        return Video.objects.filter(creator=self.request.user)


class VideoLikeView(APIView):
    """Like or dislike a video."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        value = request.data.get('value', 1)
        
        if value not in [1, -1]:
            return Response({'error': 'Invalid value'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = VideoLikeSerializer(data={'video': video.id, 'value': value}, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Video liked successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        VideoLike.objects.filter(user=request.user, video=video).delete()
        return Response({'message': 'Like removed'})


class VideoReportView(generics.CreateAPIView):
    """Report a video."""
    
    serializer_class = VideoReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        video = get_object_or_404(Video, pk=self.kwargs['pk'])
        serializer.save(video=video)


class VideoShareView(APIView):
    """Share a video."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        platform = request.data.get('platform', 'general')
        
        VideoShare.objects.create(
            video=video,
            user=request.user,
            platform=platform
        )
        
        video.shares += 1
        video.save()
        
        return Response({'message': 'Video shared successfully'})


class VideoDownloadView(APIView):
    """Download a video."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        
        # Check if user has permission to download
        if video.access_level == 'private' and video.creator != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if video.access_level == 'subscribers':
            # Check if user is subscribed to creator
            if not request.user.subscriptions.filter(creator=video.creator, status='active').exists():
                return Response({'error': 'Subscription required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Record download
        VideoDownload.objects.create(
            video=video,
            user=request.user,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        video.downloads += 1
        video.save()
        
        # Return download URL
        return Response({'download_url': video.processed_file.url if video.processed_file else video.original_file.url})


class VideoPurchaseView(APIView):
    """Purchase a pay-per-view video."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        video = get_object_or_404(Video, pk=pk)
        
        if video.access_level != 'pay_per_view':
            return Response({'error': 'Video is not pay-per-view'}, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Implement payment processing
        # payment = process_payment(request.user, video.creator, video.price, 'pay_per_view', video)
        
        return Response({'message': 'Video purchased successfully'})


class CommentListView(generics.ListCreateAPIView):
    """List and create comments for a video."""
    
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        video_id = self.kwargs['video_id']
        return Comment.objects.filter(
            video_id=video_id,
            status='approved',
            parent=None
        ).select_related('author').prefetch_related('replies')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def perform_create(self, serializer):
        video = get_object_or_404(Video, pk=self.kwargs['video_id'])
        serializer.save(video=video)


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a comment."""
    
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()
    
    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)


class CommentLikeView(APIView):
    """Like or dislike a comment."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        value = request.data.get('value', 1)
        
        if value not in [1, -1]:
            return Response({'error': 'Invalid value'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update or create like
        like, created = CommentLike.objects.update_or_create(
            user=request.user,
            comment=comment,
            defaults={'value': value}
        )
        
        # Update comment like/dislike counts
        comment.likes = CommentLike.objects.filter(comment=comment, value=1).count()
        comment.dislikes = CommentLike.objects.filter(comment=comment, value=-1).count()
        comment.save()
        
        return Response({'message': 'Comment liked successfully'})


class PlaylistListView(generics.ListCreateAPIView):
    """List and create playlists."""
    
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Playlist.objects.filter(creator=self.request.user)


class PlaylistDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a playlist."""
    
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Playlist.objects.filter(creator=self.request.user)


class PlaylistVideosView(generics.ListCreateAPIView):
    """List and add videos to a playlist."""
    
    serializer_class = PlaylistVideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        playlist = get_object_or_404(Playlist, pk=self.kwargs['pk'], creator=self.request.user)
        return PlaylistVideo.objects.filter(playlist=playlist).select_related('video')
    
    def perform_create(self, serializer):
        playlist = get_object_or_404(Playlist, pk=self.kwargs['pk'], creator=self.request.user)
        serializer.save(playlist=playlist)


class CategoryListView(generics.ListAPIView):
    """List all categories."""
    
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    queryset = Category.objects.filter(is_active=True)


class TagListView(generics.ListAPIView):
    """List all tags."""
    
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Tag.objects.all()


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def trending_videos(request):
    """Get trending videos."""
    videos = Video.objects.filter(status='published').order_by('-views', '-likes')[:20]
    serializer = VideoSerializer(videos, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recommended_videos(request):
    """Get recommended videos for the user."""
    # Simple recommendation based on user's liked videos
    liked_videos = VideoLike.objects.filter(user=request.user, value=1).values_list('video__categories', flat=True)
    recommended = Video.objects.filter(
        status='published',
        categories__in=liked_videos
    ).exclude(
        likes_dislikes__user=request.user
    ).distinct().order_by('-views')[:20]
    
    serializer = VideoSerializer(recommended, many=True)
    return Response(serializer.data) 