import { Stack } from '@mantine/core';
import YouTubePlayer from './YouTubePlayer';
import PlayerControls from './PlayerControls';
import { usePlayerState } from '../hooks/usePlayerState';
import { QueueItem } from '../types';

interface PlayerManagerProps {
  roomId: string;
  currentItem: QueueItem | null;
  onVideoEnd?: () => void;
}

export default function PlayerManager({ roomId, currentItem, onVideoEnd }: PlayerManagerProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    setCurrentTime,
    setDuration,
    handlePlay,
    handlePause,
    handleSeek,
  } = usePlayerState(roomId);

  return (
    <Stack spacing="md">
      <YouTubePlayer
        videoId={currentItem?.youtubeVideoId}
        onStateChange={(state) => {
          // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          if (state === 1) setIsPlaying(true);
          if (state === 2) setIsPlaying(false);
          if (state === 0) onVideoEnd?.();
        }}
        onReady={(event) => {
          setDuration(event.target.getDuration());
        }}
        onTimeUpdate={(time) => {
          setCurrentTime(time);
        }}
      />

      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        disabled={!currentItem}
      />
    </Stack>
  );
} 