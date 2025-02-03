import { useEffect, useState } from 'react';
import { Container, Paper, Stack, Tabs, LoadingOverlay } from '@mantine/core';
import { useSearchParams } from 'react-router-dom';
import QRScanner from '../components/QRScanner';
import SearchPanel from '../components/SearchPanel';
import QueueList from '../components/QueueList';
import PlayerControls from '../components/PlayerControls';
import { useRoom } from '../contexts/RoomContext';
import { useQueue } from '../hooks/useQueue';

export default function RemoteMode() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { currentRoom, joinRoom, isHost } = useRoom();
  const [isLoading, setIsLoading] = useState(false);
  const { queue, currentItem, addToQueue, removeFromQueue } = useQueue(currentRoom?.id || '');

  useEffect(() => {
    if (roomId && !currentRoom) {
      setIsLoading(true);
      joinRoom(roomId)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [roomId]);

  if (!roomId) {
    return <QRScanner />;
  }

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  return (
    <Container>
      <Stack spacing="md">
        <Paper p="md">
          <PlayerControls roomId={currentRoom?.id || ''} isHost={isHost} />
        </Paper>

        <Paper p="md">
          <Tabs defaultValue="queue">
            <Tabs.List>
              <Tabs.Tab value="queue">Queue</Tabs.Tab>
              <Tabs.Tab value="search">Search</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="queue" pt="sm">
              <QueueList
                queue={queue}
                currentItem={currentItem}
                isHost={isHost}
                onRemove={removeFromQueue}
              />
            </Tabs.Panel>

            <Tabs.Panel value="search" pt="sm">
              <SearchPanel onAddToQueue={addToQueue} />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
} 