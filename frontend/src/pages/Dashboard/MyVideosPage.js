import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Eye, 
  Heart, 
  Download,
  FileVideo,
  Image as ImageIcon,
  Search,
  Filter,
  Upload,
  MoreVertical,
  Edit3,
  Trash2,
  Copy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI } from '../../services/api';
import { downloadVideo, downloadThumbnail, formatFileSize } from '../../utils/download';
import toast from 'react-hot-toast';

const MyVideosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch user's videos
  const { data: userVideos = [], isLoading, error } = useQuery(
    ['user-videos-detailed'],
    () => contentAPI.getVideos({ creator: user?.id }),
    {
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Error fetching user videos:', error);
        toast.error('Failed to load videos');
      }
    }
  );

  // Ensure userVideos is always an array
  const safeUserVideos = Array.isArray(userVideos) ? userVideos : [];

  const handleDownloadVideo = async (video) => {
    try {
      await downloadVideo(video);
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download video');
    }
  };

  const handleDownloadThumbnail = async (video) => {
    try {
      await downloadThumbnail(video);
      toast.success('Thumbnail downloaded successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to download thumbnail');
    }
  };

  const handleCopyVideoUrl = (videoId) => {
    const url = `${window.location.origin}/video/${videoId}`;
    navigator.clipboard.writeText(url);
    toast.success('Video URL copied to clipboard!');
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Filter and sort videos
  const filteredVideos = safeUserVideos
    .filter(video => {
      const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'file_size':
          return (b.file_size || 0) - (a.file_size || 0);
        default:
          return 0;
      }
    });

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
            Error Loading Videos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load your videos. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Videos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and download your uploaded videos
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/upload')}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>Upload New Video</span>
          </button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="created_at">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="views">Sort by Views</option>
              <option value="file_size">Sort by File Size</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="processing">Processing</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Video Thumbnail */}
              <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    video.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : video.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {video.status}
                  </span>
                </div>

                {/* Actions Menu */}
                <div className="absolute top-2 right-2">
                  <div className="relative group">
                    <button className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/video/${video.id}`)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Eye className="h-4 w-4 mr-3" />
                        View Video
                      </button>
                      <button
                        onClick={() => handleCopyVideoUrl(video.id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4 mr-3" />
                        Copy URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(video.views)} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(video.likes)} likes</span>
                  </div>
                  {video.file_size && (
                    <>
                      <div className="flex items-center space-x-1">
                        <FileVideo className="h-4 w-4" />
                        <span>{formatFileSize(video.file_size)}</span>
                      </div>
                      <div className="text-xs">
                        {new Date(video.created_at).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>

                {/* Download Buttons */}
                <div className="flex items-center space-x-2">
                  {video.file_data && (
                    <button
                      onClick={() => handleDownloadVideo(video)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Video</span>
                    </button>
                  )}
                  
                  {video.thumbnail_data && (
                    <button
                      onClick={() => handleDownloadThumbnail(video)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span>Thumbnail</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-12"
        >
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No videos found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Upload your first video to get started'
            }
          </p>
          <button
            onClick={() => navigate('/dashboard/upload')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Upload Your First Video
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MyVideosPage; 