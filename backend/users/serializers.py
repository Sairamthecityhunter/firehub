from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import CreatorProfile, VerificationRequest

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'display_name', 'password', 'password_confirm',
            'user_type', 'country', 'timezone', 'language'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'display_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'display_name', 'bio', 'avatar', 'cover_image',
            'user_type', 'verification_status', 'is_age_verified', 'is_identity_verified',
            'country', 'timezone', 'language', 'creator_since', 'total_earnings',
            'subscription_price', 'is_accepting_tips', 'is_private', 'show_online_status',
            'allow_messages', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email', 'user_type', 'verification_status', 'is_age_verified',
            'is_identity_verified', 'creator_since', 'total_earnings', 'created_at', 'updated_at'
        ]


class CreatorProfileSerializer(serializers.ModelSerializer):
    """Serializer for creator profile."""
    
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'user', 'categories', 'tags', 'website', 'twitter', 'instagram',
            'onlyfans', 'total_videos', 'total_views', 'total_likes', 'total_subscribers',
            'auto_approve_comments', 'watermark_videos', 'allow_downloads',
            'verification_date', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'total_videos', 'total_views', 'total_likes', 
            'total_subscribers', 'verification_date', 'created_at', 'updated_at'
        ]


class VerificationRequestSerializer(serializers.ModelSerializer):
    """Serializer for verification requests."""
    
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = VerificationRequest
        fields = [
            'id', 'user', 'status', 'id_document', 'selfie_with_id', 'consent_form',
            'reviewed_by', 'reviewed_at', 'rejection_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'reviewed_by', 'reviewed_at', 'rejection_reason',
            'created_at', 'updated_at'
        ]


class VerificationRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating verification requests."""
    
    class Meta:
        model = VerificationRequest
        fields = ['id_document', 'selfie_with_id', 'consent_form']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return VerificationRequest.objects.create(user=user, **validated_data)


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField()
    password = serializers.CharField()


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change."""
    
    old_password = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs


class UserStatsSerializer(serializers.ModelSerializer):
    """Serializer for user statistics."""
    
    class Meta:
        model = User
        fields = [
            'id', 'display_name', 'user_type', 'verification_status',
            'total_earnings', 'created_at'
        ]


class CreatorStatsSerializer(serializers.ModelSerializer):
    """Serializer for creator statistics."""
    
    user = UserStatsSerializer(read_only=True)
    
    class Meta:
        model = CreatorProfile
        fields = [
            'id', 'user', 'total_videos', 'total_views', 'total_likes', 'total_subscribers'
        ] 