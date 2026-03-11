import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import {
  Play,
  Heart,
  Share2,
  Download,
  MoreHorizontal,
  Eye,
  Clock,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  User,
  DollarSign,
  Lock,
  FileVideo,
  ImageIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';
import VideoPlayer from '../../components/Video/VideoPlayer';
import CommentSection from '../../components/Video/CommentSection';
import VideoCard from '../../components/Video/VideoCard';
import toast from 'react-hot-toast';
import { downloadVideo, downloadThumbnail, formatFileSize } from '../../utils/download';

const VideoDetailPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Fetch video details
  const { data: video, isLoading, error } = useQuery(
    ['video', videoId],
    () => contentAPI.getVideo(videoId),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch comments
  const { data: comments = [] } = useQuery(
    ['comments', videoId],
    () => contentAPI.getComments(videoId),
    {
      enabled: !!videoId,
      staleTime: 2 * 60 * 1000,
    }
  );

  // Fetch related videos
  const { data: relatedVideos = [] } = useQuery(
    ['related-videos', videoId],
    () => contentAPI.getVideos({ category: video?.categories?.[0]?.slug }),
    {
      enabled: !!video?.categories?.length,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Like/Dislike mutations
  const likeMutation = useMutation(
    (value) => contentAPI.likeVideo(videoId, value),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['video', videoId]);
        toast.success('Video liked!');
      },
      onError: () => {
        toast.error('Failed to like video');
      },
    }
  );

  const shareMutation = useMutation(
    (data) => contentAPI.shareVideo(videoId, data),
    {
      onSuccess: () => {
        toast.success('Video shared!');
      },
      onError: () => {
        toast.error('Failed to share video');
      },
    }
  );

  const downloadMutation = useMutation(
    () => contentAPI.downloadVideo(videoId),
    {
      onSuccess: (data) => {
        // Create download link
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `${video?.title}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started!');
      },
      onError: () => {
        toast.error('Failed to download video');
      },
    }
  );

  useEffect(() => {
    if (video) {
      // Check if user has liked/disliked this video
      // This would typically come from the API
      setIsLiked(false);
      setIsDisliked(false);
    }
  }, [video]);

  const handleLike = (value) => {
    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }

    if (value === 1 && isLiked) {
      // Unlike
      likeMutation.mutate(1);
      setIsLiked(false);
    } else if (value === -1 && isDisliked) {
      // Undislike
      likeMutation.mutate(-1);
      setIsDisliked(false);
    } else {
      // Like or dislike
      likeMutation.mutate(value);
      setIsLiked(value === 1);
      setIsDisliked(value === -1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title,
        text: video?.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }

    shareMutation.mutate({ platform: 'general' });
  };

  const handleDownload = async () => {
    if (!video) return;

    try {
      await downloadVideo(video);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download video');
    }
  };

  const handleDownloadThumbnail = async () => {
    if (!video) return;

    try {
      await downloadThumbnail(video);
      toast.success('Thumbnail downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download thumbnail');
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Video not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The video you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Video player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-black rounded-lg overflow-hidden mb-6"
            >
              <VideoPlayer video={video} />
            </motion.div>

            {/* Video info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6"
            >
              {/* Title and actions */}
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
                  {video.title}
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {showMoreActions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={handleDownload}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4 mr-3" />
                        Download
                      </button>
                      <button
                        onClick={handleDownloadThumbnail}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ImageIcon className="h-4 w-4 mr-3" />
                        Download Thumbnail
                      </button>
                      <button
                        onClick={() => navigate(`/creator/${video.creator.id}`)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="h-4 w-4 mr-3" />
                        View Creator
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatViews(video.views)} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                  </div>
                  {video.file_size && (
                    <div className="flex items-center space-x-1">
                      <FileVideo className="h-4 w-4" />
                      <span>{formatFileSize(video.file_size)}</span>
                    </div>
                  )}
                </div>

                {/* Access level indicator */}
                {video.access_level !== 'public' && (
                  <div className="flex items-center space-x-1">
                    <Lock className="h-4 w-4 text-accent-600" />
                    <span className="text-sm font-medium text-accent-600">
                      {video.access_level === 'subscribers' && 'Subscribers Only'}
                      {video.access_level === 'pay_per_view' && `$${video.price} PPV`}
                      {video.access_level === 'private' && 'Private'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-4 mb-4 flex-wrap gap-2">
                <button
                  onClick={() => handleLike(1)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{formatViews(video.likes)}</span>
                </button>

                <button
                  onClick={() => handleLike(-1)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isDisliked
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{formatViews(video.dislikes)}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                {/* Download Video Button */}
                {video.file_data && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Video</span>
                  </button>
                )}

                {/* Download Thumbnail Button */}
                {video.thumbnail_data && (
                  <button
                    onClick={handleDownloadThumbnail}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Download Thumbnail</span>
                  </button>
                )}
              </div>

              {/* Creator info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div
                  onClick={() => navigate(`/creator/${video.creator.id}`)}
                  className="cursor-pointer"
                >
                  {video.creator.avatar ? (
                    <img
                      src={video.creator.avatar}
                      alt={video.creator.display_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {video.creator.display_name?.charAt(0) || 'C'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {video.creator.display_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {video.creator.is_verified_creator && '✓ Verified Creator'}
                  </p>
                </div>
                {video.creator.subscription_price && (
                  <button className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <DollarSign className="h-4 w-4" />
                    <span>Subscribe ${video.creator.subscription_price}/month</span>
                  </button>
                )}
              </div>

              {/* Description */}
              {video.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {video.tags && video.tags.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Comments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CommentSection videoId={videoId} comments={comments} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related videos */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Related Videos
              </h2>
              <div className="space-y-4">
                {relatedVideos
                  .filter(v => v.id !== videoId)
                  .slice(0, 10)
                  .map((relatedVideo) => (
                    <VideoCard key={relatedVideo.id} video={relatedVideo} compact />
                  ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage; 