import { Paper, Stack } from '@mantine/core';
import { useCallback, useEffect } from 'react';
import YouTubePlayer from './YouTubePlayer';
import PlayerControls from './PlayerControls';
import { usePlayerState } from '../../hooks/usePlayerState';
import { useSocket } from '../../contexts/SocketContext';
import { setupSocketEvents } from '../../utils/socketEvents';

interface PlayerManagerProps {
  roomId: string;
}

export default function PlayerManager({ roomId }: PlayerManagerProps) {
  const {
    currentItem,
    isPlaying,
    currentTime,
    duration,
    loading,
    error,
    handlePlay,
    handlePause,
    handleSeek,
    handleVideoEnd,
    setDuration,
  } = usePlayerState(roomId);

  const { socket } = useSocket();

  const handleStateChange = useCallback(
    (state: number) => {
      // YouTube player states
      switch (state) {
        case -1: // unstarted
          break;
        case 0: // ended
          handleVideoEnd();
          break;
        case 1: // playing
          handlePlay();
          break;
        case 2: // paused
          handlePause();
          break;
        case 3: // buffering
          break;
        case 5: // video cued
          break;
      }
    },
    [handlePlay, handlePause, handleVideoEnd]
  );

  useEffect(() => {
    if (!socket) return;

    return setupSocketEvents(socket, {
      'player:play': () => handlePlay(),
      'player:pause': () => handlePause(),
      'player:seek': (time: number) => handleSeek(time),
    });
  }, [socket, handlePlay, handlePause, handleSeek]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Stack spacing="md">
      <Paper className="youtube-player" withBorder>
        {currentItem && (
          <YouTubePlayer
            videoId={currentItem.youtubeVideoId}
            onStateChange={handleStateChange}
            onReady={(event) => {
              setDuration(event.target.getDuration());
            }}
          />
        )}
      </Paper>

      <PlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeek={handleSeek}
        disabled={!currentItem || loading}
      />
    </Stack>
  );
} 