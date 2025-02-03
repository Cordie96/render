import { useEffect, useRef } from 'react';
import YouTube from 'react-youtube';

interface YouTubePlayerProps {
  videoId: string;
  onStateChange: (state: number) => void;
  onReady: (event: { target: YT.Player }) => void;
}

export default function YouTubePlayer({
  videoId,
  onStateChange,
  onReady,
}: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  return (
    <YouTube
      videoId={videoId}
      opts={{
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
      }}
      onReady={(event) => {
        playerRef.current = event.target;
        onReady(event);
      }}
      onStateChange={(event) => onStateChange(event.data)}
    />
  );
} 