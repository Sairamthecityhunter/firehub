import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { 
  Heart, 
  Bell, 
  BellOff, 
  Star, 
  Calendar, 
  Eye,
  Play,
  Search,
  Filter,
  Grid,
  List,
  TrendingUp
} from 'lucide-react';
import { api } from '../../services/api';

const SubscriptionsPage = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'active', 'recent'
  const [searchQuery, setSearchQuery] = useState('');

  // Mock subscriptions data - replace with actual API calls
  const subscriptions = [
    {
      id: 1,
      creator: {
        id: 1,
        name: 'Sarah Johnson',
        username: '@sarah_creates',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        verified: true,
        subscribers: '125K',
      },
      subscribedAt: '2024-01-15',
      notificationsEnabled: true,
      tier: 'premium',
      price: 9.99,
      latestVideo: {
        title: 'Amazing Sunset Timelapse',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=169&fit=crop',
        uploadedAt: '2 hours ago',
        duration: '5:32',
        views: '45K',
      }
    },
    {
      id: 2,
      creator: {
        id: 2,
        name: 'Mike Chen',
        username: '@mike_content',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: true,
        subscribers: '98K',
      },
      subscribedAt: '2024-02-20',
      notificationsEnabled: false,
      tier: 'free',
      price: 0,
      latestVideo: {
        title: 'Creative Photography Tips',
        thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&h=169&fit=crop',
        uploadedAt: '5 hours ago',
        duration: '12:45',
        views: '32K',
      }
    },
    {
      id: 3,
      creator: {
        id: 3,
        name: 'Emma Wilson',
        username: '@emma_creative',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        verified: false,
        subscribers: '87K',
      },
      subscribedAt: '2024-03-10',
      notificationsEnabled: true,
      tier: 'basic',
      price: 4.99,
      latestVideo: {
        title: 'Digital Art Process',
        thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=169&fit=crop',
        uploadedAt: '1 day ago',
        duration: '8:21',
        views: '28K',
      }
    },
  ];

  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter(sub => sub.tier !== 'free').length,
    monthlySpending: subscriptions.reduce((total, sub) => total + sub.price, 0),
    newVideos: 12, // Mock count of new videos from subscriptions
  };

  const toggleNotifications = (subscriptionId) => {
    // Implement notification toggle
    console.log('Toggle notifications for subscription:', subscriptionId);
  };

  const unsubscribe = (subscriptionId) => {
    // Implement unsubscribe functionality
    console.log('Unsubscribe from:', subscriptionId);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (searchQuery && !sub.creator.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    switch (filterBy) {
      case 'active':
        return sub.tier !== 'free';
      case 'recent':
        return new Date(sub.subscribedAt) > new Date('2024-02-01');
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>My Subscriptions - Firehub</title>
        <meta name="description" content="Manage your subscriptions and discover new content from your favorite creators" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscriptions and stay updated with your favorite creators
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalSubscriptions}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Total Subscriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.activeSubscriptions}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Active Subscriptions</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.monthlySpending.toFixed(2)}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Monthly Spending</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.newVideos}
                </p>
                <p className="text-gray-600 dark:text-gray-400">New Videos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Subscriptions</option>
              <option value="active">Active Only</option>
              <option value="recent">Recent</option>
            </select>

            <div className="flex bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {filteredSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Creator Info */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={subscription.creator.avatar}
                      alt={subscription.creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.creator.name}
                        </h3>
                        {subscription.creator.verified && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {subscription.creator.username}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">
                        {subscription.creator.subscribers} subscribers
                      </p>
                    </div>
                  </div>

                  {/* Subscription Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleNotifications(subscription.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        subscription.notificationsEnabled
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={subscription.notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
                    >
                      {subscription.notificationsEnabled ? (
                        <Bell className="h-4 w-4" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subscription Tier:
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.tier === 'premium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : subscription.tier === 'basic'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
                    </span>
                  </div>
                  {subscription.price > 0 && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Monthly Cost:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${subscription.price}/month
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subscribed:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(subscription.subscribedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    View Profile
                  </button>
                  <button
                    onClick={() => unsubscribe(subscription.id)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>

              {/* Latest Video */}
              {viewMode === 'grid' && subscription.latestVideo && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Latest Video
                    </h4>
                    <div className="flex space-x-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={subscription.latestVideo.thumbnail}
                          alt={subscription.latestVideo.title}
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer">
                          <Play className="h-4 w-4 text-white opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                          {subscription.latestVideo.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                          {subscription.latestVideo.title}
                        </h5>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{subscription.latestVideo.views}</span>
                          </span>
                          <span>•</span>
                          <span>{subscription.latestVideo.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No subscriptions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? "No subscriptions match your search criteria."
                : "Start following your favorite creators to see them here."
              }
            </p>
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Discover Creators
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
