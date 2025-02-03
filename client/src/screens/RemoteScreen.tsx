import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Stack, Title, Text } from '@mantine/core';
import QueueManager from '../components/QueueManager';
import PlayerControls from '../components/PlayerControls';
import { useRoom } from '../hooks/useRoom';
import { usePlayerState } from '../hooks/usePlayerState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingOverlay from '../components/LoadingOverlay';

export default function RemoteScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, loading: roomLoading, error: roomError } = useRoom(roomId!);
  const {
    isPlaying,
    currentTime,
    duration,
    currentItem,
    loading: playerLoading,
    error: playerError,
    handlePlay,
    handlePause,
    handleSeek,
  } = usePlayerState(roomId!);

  useEffect(() => {
    if (!roomLoading && !room) {
      navigate('/');
    }
  }, [roomLoading, room, navigate]);

  if (roomLoading || playerLoading) {
    return <LoadingOverlay message="Loading remote..." />;
  }

  if (roomError) {
    return <ErrorAlert error={roomError} />;
  }

  if (playerError) {
    return <ErrorAlert error={playerError} />;
  }

  if (!room) {
    return null;
  }

  return (
    <Container size="sm" py="xl">
      <Stack spacing="xl">
        <Title order={2}>{room.name}</Title>

        <Paper p="md" withBorder>
          {currentItem ? (
            <>
              <Text weight={500} mb="md">
                Now Playing: {currentItem.title}
              </Text>
              <PlayerControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeek={handleSeek}
              />
            </>
          ) : (
            <Text color="dimmed" align="center">
              No song is currently playing
            </Text>
          )}
        </Paper>

        <Paper p="md" withBorder>
          <QueueManager roomId={roomId!} />
        </Paper>
      </Stack>
    </Container>
  );
} 