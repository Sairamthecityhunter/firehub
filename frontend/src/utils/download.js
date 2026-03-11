// File download utilities

/**
 * Download a file from base64 data
 * @param {string} fileData - Base64 encoded file data
 * @param {string} fileName - Name for the downloaded file
 * @param {string} fileType - MIME type of the file
 */
export const downloadFileFromData = (fileData, fileName, fileType) => {
  try {
    // Convert base64 to blob
    const byteCharacters = atob(fileData.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

/**
 * Download a video file
 * @param {Object} video - Video object with file data
 */
export const downloadVideo = async (video) => {
  if (!video.file_data) {
    throw new Error('No file data available for download');
  }
  
  const success = downloadFileFromData(
    video.file_data,
    video.file_name || `${video.title}.mp4`,
    video.file_type || 'video/mp4'
  );
  
  if (!success) {
    throw new Error('Failed to download video file');
  }
};

/**
 * Download a thumbnail image
 * @param {Object} video - Video object with thumbnail data
 */
export const downloadThumbnail = async (video) => {
  if (!video.thumbnail_data) {
    throw new Error('No thumbnail data available for download');
  }
  
  const success = downloadFileFromData(
    video.thumbnail_data,
    video.thumbnail_name || `${video.title}_thumbnail.jpg`,
    'image/jpeg'
  );
  
  if (!success) {
    throw new Error('Failed to download thumbnail');
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 