from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import User, CreatorProfile, VerificationRequest
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, CreatorProfileSerializer,
    VerificationRequestSerializer, VerificationRequestCreateSerializer,
    UserLoginSerializer, PasswordChangeSerializer, UserStatsSerializer
)


class UserRegistrationView(APIView):
    """Handle user registration."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(APIView):
    """Handle user login."""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            user = authenticate(request, email=email, password=password)
            
            if user:
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'user': UserProfileSerializer(user).data
                })
            else:
                return Response({
                    'error': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    """Handle user logout."""
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'})


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Handle user profile retrieval and updates."""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class CreatorProfileView(generics.RetrieveUpdateAPIView):
    """Handle creator profile management."""
    
    serializer_class = CreatorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        if not user.is_creator:
            return None
        profile, created = CreatorProfile.objects.get_or_create(user=user)
        return profile
    
    def get(self, request, *args, **kwargs):
        if not request.user.is_creator:
            return Response({
                'error': 'Only creators can access creator profile'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().get(request, *args, **kwargs)


class BecomeCreatorView(APIView):
    """Handle user becoming a creator."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        user = request.user
        
        if user.is_creator:
            return Response({
                'error': 'User is already a creator'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update user type
        user.user_type = 'creator'
        user.save()
        
        # Create creator profile
        CreatorProfile.objects.create(user=user)
        
        return Response({
            'message': 'Successfully became a creator',
            'user': UserProfileSerializer(user).data
        })


class VerificationRequestView(generics.CreateAPIView):
    """Handle verification request creation."""
    
    serializer_class = VerificationRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        user = request.user
        
        # Check if user already has a pending request
        existing_request = VerificationRequest.objects.filter(
            user=user, 
            status='pending'
        ).first()
        
        if existing_request:
            return Response({
                'error': 'You already have a pending verification request'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().create(request, *args, **kwargs)


class VerificationStatusView(APIView):
    """Get verification status for current user."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        latest_request = VerificationRequest.objects.filter(
            user=user
        ).order_by('-created_at').first()
        
        return Response({
            'verification_status': user.verification_status,
            'is_age_verified': user.is_age_verified,
            'is_identity_verified': user.is_identity_verified,
            'latest_request': VerificationRequestSerializer(latest_request).data if latest_request else None
        })


class PasswordChangeView(APIView):
    """Handle password change."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            if not user.check_password(old_password):
                return Response({
                    'error': 'Current password is incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response({
                    'error': e.messages[0]
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.save()
            
            return Response({'message': 'Password changed successfully'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserStatsView(APIView):
    """Get user statistics."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        stats = {
            'user': UserStatsSerializer(user).data,
            'total_videos': 0,
            'total_views': 0,
            'total_likes': 0,
            'total_subscribers': 0,
        }
        
        if user.is_creator and hasattr(user, 'creator_profile'):
            creator_stats = CreatorProfileSerializer(user.creator_profile).data
            stats.update({
                'total_videos': creator_stats['total_videos'],
                'total_views': creator_stats['total_views'],
                'total_likes': creator_stats['total_likes'],
                'total_subscribers': creator_stats['total_subscribers'],
            })
        
        return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_username_availability(request):
    """Check if username is available."""
    username = request.GET.get('username')
    if not username:
        return Response({
            'error': 'Username parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    is_available = not User.objects.filter(username=username).exists()
    return Response({'available': is_available})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_avatar(request):
    """Upload user avatar."""
    user = request.user
    
    if 'avatar' not in request.FILES:
        return Response({
            'error': 'Avatar file is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.avatar = request.FILES['avatar']
    user.save()
    
    return Response({
        'message': 'Avatar uploaded successfully',
        'avatar_url': user.avatar.url if user.avatar else None
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_cover_image(request):
    """Upload user cover image."""
    user = request.user
    
    if 'cover_image' not in request.FILES:
        return Response({
            'error': 'Cover image file is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.cover_image = request.FILES['cover_image']
    user.save()
    
    return Response({
        'message': 'Cover image uploaded successfully',
        'cover_image_url': user.cover_image.url if user.cover_image else None
    }) 