import React from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Play, 
  Eye, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Users,
  Upload,
  Clock,
  Calendar,
  BarChart3,
  Activity,
  Download,
  FileVideo,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { contentAPI, analyticsAPI } from '../../services/api';
import VideoCard from '../../components/Video/VideoCard';
import { downloadVideo, downloadThumbnail, formatFileSize } from '../../utils/download';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Fetch user's videos
  const { data: userVideos = [] } = useQuery(
    ['user-videos'],
    () => contentAPI.getVideos({ creator: user?.id }),
    {
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Error fetching user videos:', error);
      }
    }
  );

  // Ensure userVideos is always an array
  const safeUserVideos = Array.isArray(userVideos) ? userVideos : [];

  // Fetch user stats
  const { data: userStats } = useQuery(
    ['user-stats'],
    () => analyticsAPI.getStats(),
    {
      enabled: !!user?.id,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery(
    ['recent-activity'],
    () => contentAPI.getVideos({ ordering: '-created_at', page_size: 5 }),
    {
      enabled: !!user?.id,
      staleTime: 2 * 60 * 1000,
    }
  );

  const handleUploadClick = () => {
    if (!user?.is_creator) {
      // If user is not a creator, show option to become one
      if (window.confirm('You need to be a creator to upload videos. Would you like to upgrade your account to Creator status?')) {
        handleBecomeCreator();
      }
      return;
    }
    navigate('/dashboard/upload');
  };

  const handleBecomeCreator = async () => {
    try {
      const updatedUser = { 
        ...user, 
        user_type: 'creator', 
        is_creator: true 
      };
      
      // Update user in context and localStorage
      updateUser(updatedUser);
      
      toast.success('Congratulations! You are now a Creator! You can start uploading videos.');
    } catch (error) {
      toast.error('Failed to upgrade account. Please try again.');
    }
  };

  const stats = [
    {
      title: 'Total Views',
      value: userStats?.total_views || 0,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Total Likes',
      value: userStats?.total_likes || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: 'Total Videos',
      value: userStats?.total_videos || 0,
      icon: Play,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Earnings',
      value: `$${userStats?.total_earnings || 0}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
  ];

  const creatorStats = [
    {
      title: 'Subscribers',
      value: userStats?.total_subscribers || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Average Views',
      value: userStats?.average_views_per_video || 0,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    {
      title: 'Uploads This Month',
      value: userStats?.videos_uploaded_this_month || 0,
      icon: Upload,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
    },
    {
      title: 'Watch Time',
      value: `${Math.round((userStats?.total_watch_time || 0) / 3600)}h`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.display_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your content today.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(stat.value)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Creator stats (if user is a creator) */}
        {user?.is_creator && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {creatorStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatNumber(stat.value)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Become a Creator section (if user is not a creator) */}
        {!user?.is_creator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-8 mb-8 border border-primary-200 dark:border-primary-800"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Become a Creator
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Unlock the ability to upload videos, build your audience, and monetize your content. Join thousands of creators on Firehub!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleBecomeCreator}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Upload className="h-5 w-5" />
                  <span className="font-semibold">Upgrade to Creator</span>
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Free upgrade • No commitment
                </div>
              </div>
              
              {/* Benefits list */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Upload unlimited videos</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Build your audience</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  <span>Analytics & insights</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent videos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Videos
              </h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            {safeUserVideos.length > 0 ? (
              <div className="space-y-4">
                {safeUserVideos.slice(0, 3).map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                          <Play className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {video.title}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatNumber(video.views)} views</span>
                        <span>{formatNumber(video.likes)} likes</span>
                        <span>{video.status}</span>
                        {video.file_size && (
                          <span>{formatFileSize(video.file_size)}</span>
                        )}
                      </div>
                    </div>
                    {/* Download buttons */}
                    <div className="flex items-center space-x-2">
                      {video.file_data && (
                        <button
                          onClick={async () => {
                            try {
                              await downloadVideo(video);
                              toast.success('Video downloaded successfully!');
                            } catch (error) {
                              toast.error(error.message || 'Failed to download video');
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Download Video"
                        >
                          <FileVideo className="h-4 w-4" />
                        </button>
                      )}
                      {video.thumbnail_data && (
                        <button
                          onClick={async () => {
                            try {
                              await downloadThumbnail(video);
                              toast.success('Thumbnail downloaded successfully!');
                            } catch (error) {
                              toast.error(error.message || 'Failed to download thumbnail');
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          title="Download Thumbnail"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Show all videos button if user has more than 3 */}
                {safeUserVideos.length > 3 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button 
                      onClick={() => navigate('/dashboard/videos')}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All {safeUserVideos.length} Videos
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No videos uploaded yet
                </p>
                <button 
                  onClick={handleUploadClick}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Upload Your Video
                </button>
              </div>
            )}
          </motion.div>

          {/* Recent activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white">
                        New video uploaded: <span className="font-medium">{activity.title}</span>
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatNumber(activity.views)} views
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No recent activity
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleUploadClick}
              className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Upload className="h-6 w-6 text-primary-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Upload Video
              </span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <BarChart3 className="h-6 w-6 text-primary-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                View Analytics
              </span>
            </button>
            <button className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <DollarSign className="h-6 w-6 text-primary-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                Manage Earnings
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage; 