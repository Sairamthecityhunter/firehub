from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Video, Category, Tag, Comment, VideoLike, VideoShare, 
    VideoDownload, Playlist, PlaylistVideo, VideoReport
)

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for video categories."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'is_active']


class TagSerializer(serializers.ModelSerializer):
    """Serializer for video tags."""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'usage_count']


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for video creators."""
    
    class Meta:
        model = User
        fields = ['id', 'display_name', 'avatar', 'is_verified_creator']


class VideoSerializer(serializers.ModelSerializer):
    """Serializer for video content."""
    
    creator = UserBasicSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    like_ratio = serializers.ReadOnlyField()
    is_published = serializers.ReadOnlyField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'creator', 'title', 'description', 'thumbnail',
            'duration', 'resolution', 'status', 'access_level',
            'is_featured', 'is_premium', 'price', 'categories', 'tags',
            'views', 'likes', 'dislikes', 'shares', 'downloads',
            'average_watch_time', 'completion_rate', 'like_ratio',
            'is_published', 'created_at', 'published_at'
        ]
        read_only_fields = [
            'creator', 'duration', 'resolution', 'views', 'likes',
            'dislikes', 'shares', 'downloads', 'average_watch_time',
            'completion_rate', 'like_ratio', 'is_published'
        ]


class VideoCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating videos."""
    
    class Meta:
        model = Video
        fields = [
            'title', 'description', 'thumbnail', 'original_file',
            'access_level', 'is_premium', 'price', 'categories', 'tags'
        ]
    
    def validate(self, data):
        user = self.context['request'].user
        if not user.is_creator:
            raise serializers.ValidationError("Only creators can upload videos")
        return data
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class VideoUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating videos."""
    
    class Meta:
        model = Video
        fields = [
            'title', 'description', 'thumbnail', 'access_level',
            'is_premium', 'price', 'categories', 'tags'
        ]


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for video comments."""
    
    author = UserBasicSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'content', 'status', 'likes', 'dislikes',
            'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'status', 'likes', 'dislikes']
    
    def get_replies(self, obj):
        if obj.parent is None:  # Only get replies for top-level comments
            replies = Comment.objects.filter(parent=obj, status='approved')
            return CommentSerializer(replies, many=True).data
        return []
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['video_id'] = self.context['video_id']
        return super().create(validated_data)


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating comments."""
    
    class Meta:
        model = Comment
        fields = ['content', 'parent']
    
    def validate(self, data):
        user = self.context['request'].user
        if not user.is_authenticated:
            raise serializers.ValidationError("You must be logged in to comment")
        return data


class VideoLikeSerializer(serializers.ModelSerializer):
    """Serializer for video likes/dislikes."""
    
    class Meta:
        model = VideoLike
        fields = ['video', 'value']
    
    def validate(self, data):
        user = self.context['request'].user
        video = data['video']
        value = data['value']
        
        # Check if user already liked/disliked this video
        existing_like = VideoLike.objects.filter(user=user, video=video).first()
        if existing_like and existing_like.value == value:
            raise serializers.ValidationError("You have already reacted to this video")
        
        return data
    
    def create(self, validated_data):
        user = self.context['request'].user
        video = validated_data['video']
        value = validated_data['value']
        
        # Update or create like
        like, created = VideoLike.objects.update_or_create(
            user=user,
            video=video,
            defaults={'value': value}
        )
        
        # Update video like/dislike counts
        if value == 1:
            video.likes = VideoLike.objects.filter(video=video, value=1).count()
        else:
            video.dislikes = VideoLike.objects.filter(video=video, value=-1).count()
        video.save()
        
        return like


class PlaylistSerializer(serializers.ModelSerializer):
    """Serializer for playlists."""
    
    creator = UserBasicSerializer(read_only=True)
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Playlist
        fields = [
            'id', 'creator', 'title', 'description', 'visibility',
            'video_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['creator']
    
    def get_video_count(self, obj):
        return obj.videos.count()
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class PlaylistVideoSerializer(serializers.ModelSerializer):
    """Serializer for playlist videos."""
    
    video = VideoSerializer(read_only=True)
    
    class Meta:
        model = PlaylistVideo
        fields = ['id', 'video', 'order', 'added_at']


class VideoReportSerializer(serializers.ModelSerializer):
    """Serializer for video reports."""
    
    reporter = UserBasicSerializer(read_only=True)
    video = VideoSerializer(read_only=True)
    
    class Meta:
        model = VideoReport
        fields = [
            'id', 'video', 'reporter', 'reason', 'description',
            'is_resolved', 'created_at'
        ]
        read_only_fields = ['reporter', 'is_resolved']
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class VideoSearchSerializer(serializers.Serializer):
    """Serializer for video search parameters."""
    
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    duration_min = serializers.IntegerField(required=False, min_value=0)
    duration_max = serializers.IntegerField(required=False, min_value=0)
    sort_by = serializers.ChoiceField(
        choices=['relevance', 'newest', 'oldest', 'most_viewed', 'most_liked'],
        default='relevance'
    )
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=50, default=20) 