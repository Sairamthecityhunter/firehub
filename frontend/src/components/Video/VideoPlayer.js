import React, { useRef, useEffect, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, AlertCircle } from 'lucide-react';

const VideoPlayer = ({ video, onProgress, onComplete }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      // Initialize Plyr
      playerRef.current = new Plyr(videoRef.current, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'captions',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['captions', 'quality', 'speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        quality: {
          default: 720,
          options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240]
        },
        autoplay: false,
        muted: false,
        volume: 1,
        clickToPlay: true,
        hideControls: true,
        resetOnEnd: false,
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        captions: { active: false, language: 'auto', update: false },
        fullscreen: { enabled: true, fallback: true, iosNative: false },
        pip: { enabled: true },
        previewThumbnails: false,
        vimeo: { dnt: true },
        youtube: { noCookie: true, rel: 0, showinfo: 0, iv_load_policy: 3 }
      });

      // Event listeners
      playerRef.current.on('ready', () => {
        setDuration(playerRef.current.duration);
        setIsLoading(false);
        setHasError(false);
      });

      playerRef.current.on('play', () => {
        setIsPlaying(true);
      });

      playerRef.current.on('pause', () => {
        setIsPlaying(false);
      });

      playerRef.current.on('timeupdate', () => {
        const currentTime = playerRef.current.currentTime;
        setCurrentTime(currentTime);
        
        if (onProgress) {
          onProgress(currentTime);
        }
      });

      playerRef.current.on('ended', () => {
        if (onComplete) {
          onComplete();
        }
      });

      playerRef.current.on('volumechange', () => {
        setVolume(playerRef.current.volume);
        setIsMuted(playerRef.current.muted);
      });

      playerRef.current.on('enterfullscreen', () => {
        setIsFullscreen(true);
      });

      playerRef.current.on('exitfullscreen', () => {
        setIsFullscreen(false);
      });

      // Error handling
      playerRef.current.on('error', (event) => {
        console.error('Video player error:', event);
        setHasError(true);
        setIsLoading(false);
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [onProgress, onComplete]);

  useEffect(() => {
    if (playerRef.current && video) {
      setIsLoading(true);
      setHasError(false);
      
      const videoSource = video.processed_file || video.original_file;
      
      // Determine video type from the source
      let videoType = 'video/mp4';
      if (video.file_type) {
        videoType = video.file_type;
      } else if (videoSource && videoSource.includes('data:video/')) {
        // Extract MIME type from data URL
        const mimeMatch = videoSource.match(/data:([^;]+)/);
        if (mimeMatch) {
          videoType = mimeMatch[1];
        }
      }

      console.log('Loading video:', {
        id: video.id,
        title: video.title,
        type: videoType,
        hasSource: !!videoSource,
        sourceLength: videoSource?.length
      });

      // Update video source when video changes
      playerRef.current.source = {
        type: 'video',
        sources: [
          {
            src: videoSource,
            type: videoType,
            size: 720
          }
        ],
        poster: video.thumbnail
      };
    }
  }, [video]);

  // Add native video error handling
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleLoadStart = () => {
        setIsLoading(true);
        setHasError(false);
      };

      const handleCanPlay = () => {
        setIsLoading(false);
        setHasError(false);
      };

      const handleError = (e) => {
        console.error('Native video error:', e);
        setHasError(true);
        setIsLoading(false);
      };

      videoElement.addEventListener('loadstart', handleLoadStart);
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);

      return () => {
        videoElement.removeEventListener('loadstart', handleLoadStart);
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [video]);

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      playerRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (playerRef.current) {
      if (isFullscreen) {
        playerRef.current.exitFullscreen();
      } else {
        playerRef.current.enterFullscreen();
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">No video available</div>
      </div>
    );
  }

  const videoSource = video.processed_file || video.original_file;

  if (!videoSource) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <div className="text-lg">Video source not available</div>
          <div className="text-sm text-gray-400">The video file could not be loaded</div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <div className="text-lg">Video playback error</div>
          <div className="text-sm text-gray-400">Unable to play this video file</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-2"></div>
            <div>Loading video...</div>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={video.thumbnail}
        playsInline
        preload="metadata"
      >
        <source src={videoSource} type={video.file_type || 'video/mp4'} />
        Your browser does not support the video tag.
      </video>

      {/* Custom controls overlay (if needed) */}
      {false && ( // Disabled since Plyr handles controls
        <div className="absolute bottom-4 left-4 right-4">
          {/* Progress bar */}
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                if (playerRef.current) {
                  playerRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
              className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>

              <button
                onClick={toggleMute}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>

              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 