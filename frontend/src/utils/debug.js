// Debug utilities for Firehub application

/**
 * Clear all Firehub data from localStorage
 * Run this in browser console if you encounter persistent errors
 */
export const clearAllFirehubData = () => {
  const keys = [
    'firehub_videos',
    'firehub_categories', 
    'firehub_tags',
    'firehub_users',
    'current_user',
    'token'
  ];
  
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Cleared: ${key}`);
  });
  
  console.log('All Firehub data cleared. Please refresh the page.');
  
  // Optionally refresh the page
  if (window.confirm('Data cleared! Refresh the page now?')) {
    window.location.reload();
  }
};

/**
 * Check localStorage data integrity
 */
export const checkDataIntegrity = () => {
  const keys = ['firehub_videos', 'firehub_categories', 'firehub_tags', 'firehub_users'];
  
  keys.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        console.log(`${key}:`, {
          type: typeof parsed,
          isArray: Array.isArray(parsed),
          length: parsed?.length,
          sample: Array.isArray(parsed) ? parsed[0] : parsed
        });
      } else {
        console.log(`${key}: null`);
      }
    } catch (error) {
      console.error(`Error checking ${key}:`, error);
    }
  });
};

/**
 * Repair corrupted video data
 */
export const repairVideoData = () => {
  try {
    const videos = localStorage.getItem('firehub_videos');
    if (!videos) {
      console.log('No video data found');
      return;
    }
    
    const parsed = JSON.parse(videos);
    if (!Array.isArray(parsed)) {
      console.log('Video data is not an array, clearing...');
      localStorage.removeItem('firehub_videos');
      return;
    }
    
    // Check each video object
    const validVideos = parsed.filter(video => {
      return video && 
             typeof video === 'object' && 
             video.id && 
             video.title &&
             video.creator;
    });
    
    if (validVideos.length !== parsed.length) {
      console.log(`Repaired video data: ${parsed.length} -> ${validVideos.length} videos`);
      localStorage.setItem('firehub_videos', JSON.stringify(validVideos));
    } else {
      console.log('Video data is healthy');
    }
  } catch (error) {
    console.error('Error repairing video data:', error);
    localStorage.removeItem('firehub_videos');
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  window.firehubDebug = {
    clearAllData: clearAllFirehubData,
    checkIntegrity: checkDataIntegrity,
    repairVideos: repairVideoData
  };
  
  console.log('Firehub debug utilities loaded. Use window.firehubDebug.* in console');
} 