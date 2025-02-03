import { useEffect, useState } from 'react';
import { Stack, Title, Group, Button } from '@mantine/core';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import YouTubePlayer from './YouTubePlayer';
import QueueList from './QueueList';
import { useSocket } from '../hooks/useSocket';
import { useQueue } from '../hooks/useQueue';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';

export default function RoomScreen() {
  const { roomId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const { room, isHost } = useRoom();
  const { queue, currentItem, addToQueue, removeFromQueue, reorderQueue } = useQueue(roomId!);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
    }
  }, [socket, roomId]);

  const handlePlayerStateChange = (state: number) => {
    if (state === 1) { // Playing
      setIsPlaying(true);
      socket?.emit('player-command', { roomId, command: 'play' });
    } else if (state === 2) { // Paused
      setIsPlaying(false);
      socket?.emit('player-command', { roomId, command: 'pause' });
    }
  };

  const handleVideoEnd = () => {
    socket?.emit('player-ended', { roomId });
  };

  return (
    <Stack spacing="lg" p="md">
      <Group position="apart">
        <Title order={2}>{room?.name || 'Karaoke Room'}</Title>
        {isHost && (
          <QRCode
            value={`${window.location.origin}/remote?roomId=${roomId}`}
            size={128}
            data-testid="qr-code"
            data-room-id={roomId}
          />
        )}
      </Group>

      <Group grow align="flex-start">
        <Stack style={{ flex: 2 }}>
          <YouTubePlayer
            videoId={currentItem?.youtubeVideoId}
            onStateChange={handlePlayerStateChange}
            onEnd={handleVideoEnd}
          />
        </Stack>

        <Stack style={{ flex: 1 }}>
          <QueueList
            queue={queue}
            currentItem={currentItem}
            isHost={isHost}
            onRemove={removeFromQueue}
            onReorder={reorderQueue}
          />
        </Stack>
      </Group>
    </Stack>
  );
} 