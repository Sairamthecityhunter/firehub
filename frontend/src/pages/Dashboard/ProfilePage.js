import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Helmet } from 'react-helmet-async';
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  Calendar, 
  MapPin,
  Link as LinkIcon,
  Star,
  Heart,
  Eye,
  Video,
  Users,
  Shield,
  Settings,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    displayName: user?.display_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    twitter: user?.social_links?.twitter || '',
    instagram: user?.social_links?.instagram || '',
    youtube: user?.social_links?.youtube || '',
  });

  // Mock user stats - replace with actual API calls
  const userStats = {
    totalVideos: 45,
    totalViews: '2.3M',
    totalLikes: '156K',
    subscribers: '89K',
    joinedDate: '2023-06-15',
    verificationStatus: user?.is_verified ? 'verified' : 'pending',
  };

  // Mock recent videos - replace with actual API calls
  const recentVideos = [
    {
      id: 1,
      title: 'Amazing Sunset Timelapse',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=169&fit=crop',
      views: '45K',
      likes: '2.1K',
      duration: '5:32',
      uploadedAt: '2 days ago',
    },
    {
      id: 2,
      title: 'Creative Photography Tips',
      thumbnail: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=300&h=169&fit=crop',
      views: '32K',
      likes: '1.8K',
      duration: '12:45',
      uploadedAt: '1 week ago',
    },
    {
      id: 3,
      title: 'Digital Art Process',
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=169&fit=crop',
      views: '28K',
      likes: '1.5K',
      duration: '8:21',
      uploadedAt: '2 weeks ago',
    },
  ];

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    // Implement profile update API call
    console.log('Saving profile:', profileData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset form data
    setProfileData({
      displayName: user?.display_name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      twitter: user?.social_links?.twitter || '',
      instagram: user?.social_links?.instagram || '',
      youtube: user?.social_links?.youtube || '',
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Implement avatar upload
      console.log('Uploading avatar:', file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Info', icon: User },
    { id: 'videos', name: 'My Videos', icon: Video },
    { id: 'stats', name: 'Statistics', icon: Eye },
    { id: 'settings', name: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>My Profile - Firehub</title>
        <meta name="description" content="Manage your profile, view statistics, and customize your account settings" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile information and account settings
          </p>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800 rounded-t-lg">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                        <User className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="h-4 w-4 text-gray-600" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-2xl font-bold text-white">
                      {user?.display_name || 'User Name'}
                    </h2>
                    {user?.is_verified && (
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <p className="text-primary-100">
                    @{user?.username || 'username'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-primary-100 text-sm">
                    <span className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{userStats.subscribers} subscribers</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Video className="h-4 w-4" />
                      <span>{userStats.totalVideos} videos</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(userStats.joinedDate).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <div className="pb-2">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profileData.displayName || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profileData.bio || 'No bio added yet'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Your location"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{profileData.location || 'Not specified'}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {profileData.website ? (
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span>{profileData.website}</span>
                          </a>
                        ) : (
                          'No website added'
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">
                    Social Media Links
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Twitter
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profileData.twitter || 'Not connected'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Instagram
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profileData.instagram || 'Not connected'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      YouTube
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.youtube}
                        onChange={(e) => handleInputChange('youtube', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Channel URL"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{profileData.youtube || 'Not connected'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Videos Tab */}
          {activeTab === 'videos' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  My Videos ({userStats.totalVideos})
                </h3>
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload New Video</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {video.title}
                      </h4>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{video.views}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart className="h-3 w-3" />
                            <span>{video.likes}</span>
                          </span>
                        </div>
                        <span>{video.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Account Statistics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Views</p>
                      <p className="text-2xl font-bold">{userStats.totalViews}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Likes</p>
                      <p className="text-2xl font-bold">{userStats.totalLikes}</p>
                    </div>
                    <Heart className="h-8 w-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Subscribers</p>
                      <p className="text-2xl font-bold">{userStats.subscribers}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total Videos</p>
                      <p className="text-2xl font-bold">{userStats.totalVideos}</p>
                    </div>
                    <Video className="h-8 w-8 text-orange-200" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Account Settings
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Email Address
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email || 'Not set'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Change Email
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Password
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      Account Verification
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {userStats.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                    </p>
                  </div>
                  {userStats.verificationStatus !== 'verified' && (
                    <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                      Apply for Verification
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <h4 className="text-md font-medium text-red-900 dark:text-red-400">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
