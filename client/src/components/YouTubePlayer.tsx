import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

interface YouTubePlayerProps {
  videoId?: string;
  onStateChange?: (state: number) => void;
  onReady?: (event: any) => void;
  onTimeUpdate?: (time: number) => void;
}

export default function YouTubePlayer({
  videoId,
  onStateChange,
  onReady,
  onTimeUpdate,
}: YouTubePlayerProps) {
  const playerRef = useRef<any>(null);
  const timeUpdateRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    onReady?.(event);

    // Start time update interval
    if (timeUpdateRef.current) {
      clearInterval(timeUpdateRef.current);
    }

    timeUpdateRef.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        onTimeUpdate?.(currentTime);
      }
    }, 1000);
  };

  if (!videoId) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: '#fff' }}>No video selected</p>
      </div>
    );
  }

  return (
    <YouTube
      videoId={videoId}
      opts={{
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
        },
      }}
      onReady={handleReady}
      onStateChange={(event) => onStateChange?.(event.data)}
      style={{
        aspectRatio: '16/9',
      }}
    />
  );
} 