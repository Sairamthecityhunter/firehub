// Local Storage API Service for Offline Development
import toast from 'react-hot-toast';

// Local storage utilities
const getFromStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      return defaultValue;
    }
    
    const parsed = JSON.parse(data);
    
    // If expecting an array but got something else, return default
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn(`Expected array for ${key} but got:`, typeof parsed);
      return defaultValue;
    }
    
    return parsed;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const resetCorruptedData = () => {
  try {
    const keys = ['firehub_videos', 'firehub_categories', 'firehub_tags'];
    keys.forEach(key => {
      const data = getFromStorage(key, []);
      if (!Array.isArray(data)) {
        console.warn(`Resetting corrupted data for ${key}`);
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error checking localStorage data:', error);
  }
};

const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
const createResponse = (data) => ({ data });
const createError = (message, status = 400) => {
  const error = new Error(message);
  error.response = { data: { error: message }, status };
  throw error;
};

// Initialize default data
const initializeDefaultData = () => {
  // First, check and reset any corrupted data
  resetCorruptedData();
  
  // Sample videos
  if (!localStorage.getItem('firehub_videos')) {
    const sampleVideos = [
      {
        id: 'video_1',
        title: 'Sample Video 1',
        description: 'This is a sample video for demonstration purposes.',
        creator: {
          id: 'creator_1',
          display_name: 'Sample Creator',
          avatar: null,
          is_verified: false
        },
        thumbnail: 'https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Sample+Video+1',
        original_file: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        processed_file: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 120,
        views: 1500,
        likes: 125,
        dislikes: 8,
        status: 'published',
        access_level: 'public',
        categories: [{ id: 1, name: 'Entertainment', slug: 'entertainment' }],
        tags: [{ id: 1, name: 'sample', slug: 'sample' }],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        published_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'video_2',
        title: 'Sample Video 2',
        description: 'Another sample video for testing.',
        creator: {
          id: 'creator_2',
          display_name: 'Demo Creator',
          avatar: null,
          is_verified: true
        },
        thumbnail: 'https://via.placeholder.com/800x450/2a2a2a/ffffff?text=Sample+Video+2',
        original_file: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        processed_file: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 180,
        views: 2300,
        likes: 189,
        dislikes: 12,
        status: 'published',
        access_level: 'public',
        categories: [{ id: 2, name: 'Technology', slug: 'technology' }],
        tags: [{ id: 2, name: 'demo', slug: 'demo' }],
        created_at: new Date(Date.now() - 172800000).toISOString(),
        published_at: new Date(Date.now() - 172800000).toISOString(),
      }
    ];
    saveToStorage('firehub_videos', sampleVideos);
  }

  // Sample categories
  if (!localStorage.getItem('firehub_categories')) {
    const sampleCategories = [
      { id: 1, name: 'Entertainment', slug: 'entertainment' },
      { id: 2, name: 'Technology', slug: 'technology' },
      { id: 3, name: 'Education', slug: 'education' },
      { id: 4, name: 'Music', slug: 'music' },
      { id: 5, name: 'Gaming', slug: 'gaming' }
    ];
    saveToStorage('firehub_categories', sampleCategories);
  }

  // Sample tags
  if (!localStorage.getItem('firehub_tags')) {
    const sampleTags = [
      { id: 1, name: 'sample', slug: 'sample' },
      { id: 2, name: 'demo', slug: 'demo' },
      { id: 3, name: 'tutorial', slug: 'tutorial' },
      { id: 4, name: 'review', slug: 'review' }
    ];
    saveToStorage('firehub_tags', sampleTags);
  }
};

// Initialize default data on import
initializeDefaultData();

// Mock API object
const api = {
  get: async (url, config = {}) => {
    await delay();
    
    // Extract path and query params
    const [path] = url.split('?');
    
    switch (path) {
      case '/api/profile/':
        const currentUser = localStorage.getItem('current_user');
        if (!currentUser) createError('Not authenticated', 401);
        return createResponse(JSON.parse(currentUser));
        
      default:
        createError('Not found', 404);
    }
  },
  
  post: async (url, data, config = {}) => {
    await delay();
    createError('API endpoint not implemented in local mode', 501);
  },
  
  patch: async (url, data, config = {}) => {
    await delay();
    createError('API endpoint not implemented in local mode', 501);
  },
  
  delete: async (url, config = {}) => {
    await delay();
    createError('API endpoint not implemented in local mode', 501);
  }
};

// API endpoints
export const authAPI = {
  login: async (credentials) => {
    // Handled by AuthContext
    createError('Use AuthContext for authentication', 400);
  },
  register: async (userData) => {
    // Handled by AuthContext
    createError('Use AuthContext for authentication', 400);
  },
  logout: async () => {
    await delay(200);
    return createResponse({ message: 'Logged out' });
  },
  refreshToken: async (refresh) => {
    await delay(200);
    return createResponse({ access: 'new_token' });
  },
  getProfile: async () => {
    const currentUser = localStorage.getItem('current_user');
    if (!currentUser) createError('Not authenticated', 401);
    await delay();
    return createResponse(JSON.parse(currentUser));
  },
  updateProfile: async (data) => {
    const currentUser = localStorage.getItem('current_user');
    if (!currentUser) createError('Not authenticated', 401);
    
    const user = JSON.parse(currentUser);
    const updatedUser = { ...user, ...data };
    
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    
    // Update in users list
    const users = getFromStorage('firehub_users', []);
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      saveToStorage('firehub_users', users);
    }
    
    await delay();
    return createResponse(updatedUser);
  },
  changePassword: async (data) => {
    await delay();
    return createResponse({ message: 'Password changed successfully' });
  },
  becomeCreator: async () => {
    const currentUser = localStorage.getItem('current_user');
    if (!currentUser) createError('Not authenticated', 401);
    
    const user = JSON.parse(currentUser);
    user.is_creator = true;
    user.user_type = 'creator';
    
    localStorage.setItem('current_user', JSON.stringify(user));
    
    await delay();
    return createResponse(user);
  },
  getCreatorProfile: async () => {
    const currentUser = localStorage.getItem('current_user');
    if (!currentUser) createError('Not authenticated', 401);
    await delay();
    return createResponse(JSON.parse(currentUser));
  },
  updateCreatorProfile: async (data) => {
    return authAPI.updateProfile(data);
  },
  uploadAvatar: async (file) => {
    await delay(1000);
    const avatarUrl = `https://via.placeholder.com/150/4f46e5/ffffff?text=${encodeURIComponent('Avatar')}`;
    return createResponse({ avatar: avatarUrl });
  },
  uploadCover: async (file) => {
    await delay(1000);
    const coverUrl = `https://via.placeholder.com/800x200/7c3aed/ffffff?text=${encodeURIComponent('Cover')}`;
    return createResponse({ cover_image: coverUrl });
  },
};

export const contentAPI = {
  getVideos: async (params = {}) => {
    await delay();
    
    try {
      const videos = getFromStorage('firehub_videos', []);
      
      // Ensure videos is an array
      if (!Array.isArray(videos)) {
        console.warn('Videos from storage is not an array:', videos);
        return createResponse([]);
      }
      
      // Simple filtering (you can enhance this)
      let filteredVideos = videos.filter(v => v && v.status === 'published');
      
      if (params.category) {
        filteredVideos = filteredVideos.filter(v => 
          v.categories && Array.isArray(v.categories) && 
          v.categories.some(cat => cat && cat.slug === params.category)
        );
      }
      
      if (params.creator) {
        filteredVideos = filteredVideos.filter(v => 
          v.creator && v.creator.id === params.creator
        );
      }
      
      if (params.search) {
        const search = params.search.toLowerCase();
        filteredVideos = filteredVideos.filter(v => 
          (v.title && v.title.toLowerCase().includes(search)) || 
          (v.description && v.description.toLowerCase().includes(search))
        );
      }
      
      // Apply ordering
      if (params.ordering) {
        if (params.ordering === '-created_at') {
          filteredVideos = filteredVideos.sort((a, b) => 
            new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
        }
      }
      
      // Apply page size limit
      if (params.page_size) {
        filteredVideos = filteredVideos.slice(0, params.page_size);
      }
      
      // Ensure we return an array
      return createResponse(Array.isArray(filteredVideos) ? filteredVideos : []);
    } catch (error) {
      console.error('Error in getVideos:', error);
      return createResponse([]);
    }
  },
  
  getVideo: async (id) => {
    await delay();
    const videos = getFromStorage('firehub_videos', []);
    const video = videos.find(v => v.id === id);
    
    if (!video) createError('Video not found', 404);
    
    // Increment view count
    video.views += 1;
    const updatedVideos = videos.map(v => v.id === id ? video : v);
    saveToStorage('firehub_videos', updatedVideos);
    
    return createResponse(video);
  },
  
  uploadVideo: async (data) => {
    const currentUser = localStorage.getItem('current_user');
    if (!currentUser) createError('Not authenticated', 401);
    
    const user = JSON.parse(currentUser);
    if (!user.is_creator) createError('Only creators can upload videos', 403);
    
    await delay(2000); // Simulate upload time
    
    const videos = getFromStorage('firehub_videos', []);
    const videoId = generateId();
    
    // Store file data for download capability
    const originalFile = data.get('original_file');
    const thumbnailFile = data.get('thumbnail');
    
    // Convert files to base64 for storage (for both download and playback)
    let fileData = null;
    let thumbnailData = null;
    
    if (originalFile) {
      fileData = await new Promise((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.readAsDataURL(originalFile);
      });
    }
    
    if (thumbnailFile) {
      thumbnailData = await new Promise((resolve) => {
        const thumbnailReader = new FileReader();
        thumbnailReader.onload = () => resolve(thumbnailReader.result);
        thumbnailReader.readAsDataURL(thumbnailFile);
      });
    }
    
    const newVideo = {
      id: videoId,
      title: data.get('title') || 'Untitled Video',
      description: data.get('description') || '',
      creator: {
        id: user.id,
        display_name: user.display_name,
        avatar: user.avatar,
        is_verified: user.is_verified || false
      },
      thumbnail: thumbnailData || 'https://via.placeholder.com/800x450/374151/ffffff?text=Uploaded+Video',
      // Use base64 data URLs for persistent video playback
      original_file: fileData,
      processed_file: fileData,
      // Store file data for downloads (same as playback now)
      file_data: fileData,
      file_name: originalFile.name,
      file_size: originalFile.size,
      file_type: originalFile.type,
      thumbnail_data: thumbnailData,
      thumbnail_name: thumbnailFile?.name,
      duration: 0,
      views: 0,
      likes: 0,
      dislikes: 0,
      status: 'processing',
      access_level: data.get('access_level') || 'public',
      categories: [],
      tags: [],
      created_at: new Date().toISOString(),
      published_at: null,
    };
    
    videos.push(newVideo);
    saveToStorage('firehub_videos', videos);
    
    // Simulate processing - publish after 1 second
    setTimeout(() => {
      const currentVideos = getFromStorage('firehub_videos', []);
      const videoIndex = currentVideos.findIndex(v => v.id === videoId);
      if (videoIndex !== -1) {
        currentVideos[videoIndex].status = 'published';
        currentVideos[videoIndex].published_at = new Date().toISOString();
        saveToStorage('firehub_videos', currentVideos);
        toast.success('Video processing complete! It will now appear on the homepage.');
      }
    }, 1000);
    
    return createResponse(newVideo);
  },
  
  updateVideo: async (id, data) => {
    await delay();
    const videos = getFromStorage('firehub_videos', []);
    const videoIndex = videos.findIndex(v => v.id === id);
    
    if (videoIndex === -1) createError('Video not found', 404);
    
    videos[videoIndex] = { ...videos[videoIndex], ...data };
    saveToStorage('firehub_videos', videos);
    
    return createResponse(videos[videoIndex]);
  },
  
  deleteVideo: async (id) => {
    await delay();
    const videos = getFromStorage('firehub_videos', []);
    const filteredVideos = videos.filter(v => v.id !== id);
    
    if (videos.length === filteredVideos.length) {
      createError('Video not found', 404);
    }
    
    saveToStorage('firehub_videos', filteredVideos);
    return createResponse({ message: 'Video deleted successfully' });
  },
  
  likeVideo: async (id, value) => {
    await delay();
    const videos = getFromStorage('firehub_videos', []);
    const videoIndex = videos.findIndex(v => v.id === id);
    
    if (videoIndex === -1) createError('Video not found', 404);
    
    if (value > 0) {
      videos[videoIndex].likes += 1;
    } else {
      videos[videoIndex].dislikes += 1;
    }
    
    saveToStorage('firehub_videos', videos);
    return createResponse({ message: 'Vote recorded' });
  },
  
  unlikeVideo: async (id) => {
    await delay();
    return createResponse({ message: 'Vote removed' });
  },
  
  getComments: async (videoId) => {
    await delay();
    const comments = getFromStorage(`firehub_comments_${videoId}`, []);
    return createResponse(comments);
  },
  
  addComment: async (videoId, data) => {
    const currentUser = localStorage.getItem('current_user');
    if (!currentUser) createError('Not authenticated', 401);
    
    const user = JSON.parse(currentUser);
    await delay();
    
    const comments = getFromStorage(`firehub_comments_${videoId}`, []);
    const newComment = {
      id: generateId(),
      content: data.content,
      author: {
        id: user.id,
        display_name: user.display_name,
        avatar: user.avatar
      },
      likes: 0,
      dislikes: 0,
      created_at: new Date().toISOString(),
      parent: data.parent || null,
      replies: []
    };
    
    comments.push(newComment);
    saveToStorage(`firehub_comments_${videoId}`, comments);
    
    return createResponse(newComment);
  },
  
  likeComment: async (commentId, value) => {
    await delay();
    return createResponse({ message: 'Comment vote recorded' });
  },
  
  unlikeComment: async (commentId) => {
    await delay();
    return createResponse({ message: 'Comment vote removed' });
  },
  
  reportVideo: async (id, data) => {
    await delay();
    return createResponse({ message: 'Report submitted' });
  },
  
  shareVideo: async (id, data) => {
    await delay();
    return createResponse({ message: 'Video shared' });
  },
  
  downloadVideo: async (id) => {
    await delay();
    const videos = getFromStorage('firehub_videos', []);
    const video = videos.find(v => v.id === id);
    
    if (!video) createError('Video not found', 404);
    
    // Return the stored file data for download
    return createResponse({ 
      download_url: video.original_file,
      file_data: video.file_data,
      file_name: video.file_name,
      file_type: video.file_type
    });
  },
};

export const searchAPI = {
  search: async (query, params = {}) => {
    await delay();
    try {
      const videos = getFromStorage('firehub_videos', []);
      const publishedVideos = videos.filter(v => v && v.status === 'published');
      
      const search = query.toLowerCase();
      const filteredVideos = publishedVideos.filter(v => 
        (v.title && v.title.toLowerCase().includes(search)) || 
        (v.description && v.description.toLowerCase().includes(search))
      );
      
      return createResponse(filteredVideos);
    } catch (error) {
      console.error('Error in search:', error);
      return createResponse([]);
    }
  },
  
  getCategories: async () => {
    await delay();
    try {
      const categories = getFromStorage('firehub_categories', []);
      return createResponse(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      return createResponse([]);
    }
  },
  
  getTags: async () => {
    await delay();
    try {
      const tags = getFromStorage('firehub_tags', []);
      return createResponse(tags);
    } catch (error) {
      console.error('Error getting tags:', error);
      return createResponse([]);
    }
  },
  
  getTrending: async () => {
    await delay();
    try {
      const videos = getFromStorage('firehub_videos', []);
      const publishedVideos = videos.filter(v => v && v.status === 'published');
      
      // Sort by views and recent activity to get trending videos
      const trendingVideos = publishedVideos
        .sort((a, b) => {
          // Combine views and recency for trending score
          const aScore = (a.views || 0) + (Date.now() - new Date(a.created_at || 0)) / 86400000; // Factor in recency
          const bScore = (b.views || 0) + (Date.now() - new Date(b.created_at || 0)) / 86400000;
          return bScore - aScore;
        })
        .slice(0, 12); // Return top 12 trending videos
      
      return createResponse(trendingVideos);
    } catch (error) {
      console.error('Error getting trending videos:', error);
      return createResponse([]);
    }
  },
  
  getRecommended: async () => {
    await delay();
    try {
      const videos = getFromStorage('firehub_videos', []);
      const publishedVideos = videos.filter(v => v && v.status === 'published');
      
      // Sort by creation date to show newest videos as recommended
      const recommendedVideos = publishedVideos
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 8); // Return top 8 newest videos
      
      return createResponse(recommendedVideos);
    } catch (error) {
      console.error('Error getting recommended videos:', error);
      return createResponse([]);
    }
  },
  
  getAllVideos: async (params = {}) => {
    await delay();
    try {
      const videos = getFromStorage('firehub_videos', []);
      let publishedVideos = videos.filter(v => v && v.status === 'published');
      
      // Apply ordering if specified
      if (params.ordering === '-created_at' || !params.ordering) {
        publishedVideos = publishedVideos.sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
      }
      
      // Apply limit if specified
      if (params.limit) {
        publishedVideos = publishedVideos.slice(0, params.limit);
      }
      
      return createResponse(publishedVideos);
    } catch (error) {
      console.error('Error getting all videos:', error);
      return createResponse([]);
    }
  },
};

export const subscriptionAPI = {
  getSubscriptions: () => api.get('/api/subscriptions/'),
  subscribe: (creatorId, data) => api.post(`/api/subscriptions/${creatorId}/`, data),
  unsubscribe: (creatorId) => api.delete(`/api/subscriptions/${creatorId}/`),
  getSubscribers: () => api.get('/api/subscribers/'),
};

export const paymentAPI = {
  getPaymentMethods: () => api.get('/api/payment-methods/'),
  addPaymentMethod: (data) => api.post('/api/payment-methods/', data),
  removePaymentMethod: (id) => api.delete(`/api/payment-methods/${id}/`),
  getPayoutMethods: () => api.get('/api/payout-methods/'),
  addPayoutMethod: (data) => api.post('/api/payout-methods/', data),
  removePayoutMethod: (id) => api.delete(`/api/payout-methods/${id}/`),
  getEarnings: (params) => api.get('/api/earnings/', { params }),
  requestPayout: (data) => api.post('/api/payouts/', data),
  getPayouts: () => api.get('/api/payouts/'),
  tipCreator: (creatorId, data) => api.post(`/api/tips/${creatorId}/`, data),
  purchaseVideo: (videoId, data) => api.post(`/api/videos/${videoId}/purchase/`, data),
};

export const analyticsAPI = {
  getStats: () => api.get('/api/stats/'),
  getVideoStats: (videoId) => api.get(`/api/videos/${videoId}/stats/`),
  getCreatorStats: (creatorId) => api.get(`/api/creators/${creatorId}/stats/`),
};

// Content Moderation API
export const moderationAPI = {
  // Report content or users
  reportContent: async (data) => {
    await delay();
    try {
      const reports = getFromStorage('firehub_reports', []);
      const newReport = {
        id: generateId(),
        type: data.type, // 'video', 'user', 'comment'
        target_id: data.target_id,
        reason: data.reason,
        description: data.description,
        reporter_id: data.reporter_id,
        status: 'pending', // 'pending', 'reviewed', 'resolved', 'dismissed'
        created_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        admin_notes: ''
      };
      
      reports.push(newReport);
      saveToStorage('firehub_reports', reports);
      
      return createResponse(newReport);
    } catch (error) {
      console.error('Error reporting content:', error);
      return createError('Failed to submit report');
    }
  },

  // Get reports for admin panel
  getReports: async (filters = {}) => {
    await delay();
    try {
      let reports = getFromStorage('firehub_reports', []);
      
      // Apply filters
      if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
      }
      if (filters.type) {
        reports = reports.filter(r => r.type === filters.type);
      }
      
      // Sort by creation date (newest first)
      reports = reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return createResponse(reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return createResponse([]);
    }
  },

  // Update report status (admin action)
  updateReport: async (reportId, data) => {
    await delay();
    try {
      const reports = getFromStorage('firehub_reports', []);
      const reportIndex = reports.findIndex(r => r.id === reportId);
      
      if (reportIndex === -1) {
        return createError('Report not found');
      }
      
      reports[reportIndex] = {
        ...reports[reportIndex],
        ...data,
        reviewed_at: new Date().toISOString()
      };
      
      saveToStorage('firehub_reports', reports);
      return createResponse(reports[reportIndex]);
    } catch (error) {
      console.error('Error updating report:', error);
      return createError('Failed to update report');
    }
  },

  // Get community guidelines
  getGuidelines: async () => {
    await delay();
    const guidelines = {
      last_updated: '2025-01-01',
      sections: [
        {
          title: 'Content Standards',
          rules: [
            'No hate speech, harassment, or discriminatory content',
            'No violence or graphic content',
            'No spam or misleading information',
            'Respect intellectual property rights'
          ]
        },
        {
          title: 'Creator Responsibilities',
          rules: [
            'Accurately title and describe your content',
            'Only upload content you own or have rights to',
            'Respond professionally to community feedback',
            'Follow platform monetization policies'
          ]
        },
        {
          title: 'Viewer Guidelines',
          rules: [
            'Engage respectfully with creators and other viewers',
            'Report content that violates community standards',
            'Use platform features responsibly',
            'Respect creator intellectual property'
          ]
        }
      ]
    };
    
    return createResponse(guidelines);
  }
};

export default api; 