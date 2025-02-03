import { useEffect } from 'react';
import { Container, Paper, Stack, Title, Button } from '@mantine/core';
import QRCode from 'qrcode.react';
import YouTubePlayer from '../components/YouTubePlayer';
import QueueList from '../components/QueueList';
import { useRoom } from '../contexts/RoomContext';
import { useQueue } from '../hooks/useQueue';
import { useAuth } from '../contexts/AuthContext';

export default function ScreenMode() {
  const { currentRoom, createRoom, isHost } = useRoom();
  const { user } = useAuth();
  const { queue, currentItem, playNext } = useQueue(currentRoom?.id || '');

  useEffect(() => {
    if (!currentRoom) {
      createRoom();
    }
  }, []);

  const handleVideoEnd = () => {
    if (isHost) {
      playNext();
    }
  };

  if (!currentRoom) {
    return <div>Loading...</div>;
  }

  return (
    <Container fluid>
      <Stack spacing="md">
        <Title order={3}>Room: {currentRoom.name}</Title>
        <Paper p="md">
          <YouTubePlayer
            videoId={currentItem?.youtubeVideoId}
            onEnded={handleVideoEnd}
          />
          {isHost && (
            <QRCode
              value={`${window.location.origin}/remote?roomId=${currentRoom.id}`}
              size={256}
            />
          )}
          <QueueList
            queue={queue}
            currentItem={currentItem}
            isHost={isHost}
          />
        </Paper>
      </Stack>
    </Container>
  );
} 