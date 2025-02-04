import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Paper, Stack, Tabs, useMantineTheme } from '@mantine/core';
import { IconSearch, IconList, IconPlayerPlay } from '@tabler/icons-react';
import SearchPanel from '../components/search/SearchPanel';
import QueueList from '../components/queue/QueueList';
import PlayerControls from '../components/player/PlayerControls';
import PageHeader from '../components/PageHeader';
import { useRoom } from '../hooks/useRoom';
import { useQueue } from '../hooks/useQueue';
import { usePlayerState } from '../hooks/usePlayerState';
import ErrorAlert from '../components/ErrorAlert';
import LoadingOverlay from '../components/LoadingOverlay';

export default function RemoteScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const theme = useMantineTheme();
  
  const { room, loading: roomLoading, error: roomError } = useRoom(roomId!);
  const { queue, currentItem, loading: queueLoading, addToQueue } = useQueue(roomId!);
  const { 
    isPlaying, 
    currentTime, 
    duration,
    handlePlay,
    handlePause,
    handleSeek,
  } = usePlayerState(roomId!);

  if (roomLoading) {
    return <LoadingOverlay message="Loading room..." />;
  }

  if (roomError) {
    return <ErrorAlert error={roomError} />;
  }

  if (!room) {
    return <ErrorAlert error={new Error('Room not found')} />;
  }

  return (
    <Container size="md" py="xl">
      <Stack spacing="lg">
        <PageHeader 
          title={room.name}
          subtitle={currentItem ? `Now Playing: ${currentItem.title}` : 'No song playing'}
          actions={[
            {
              label: isPlaying ? 'Pause' : 'Play',
              icon: IconPlayerPlay,
              onClick: isPlaying ? handlePause : handlePlay,
              variant: 'light',
            },
          ]}
        />

        <Paper 
          p="md" 
          radius="md"
          style={{
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          }}
        >
          <PlayerControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            disabled={!currentItem}
          />
        </Paper>

        <Paper 
          p="md" 
          radius="md"
          style={{
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          }}
        >
          <Tabs defaultValue="queue">
            <Tabs.List>
              <Tabs.Tab 
                value="queue" 
                icon={<IconList size={14} />}
                sx={(theme) => ({
                  '&[data-active]': {
                    backgroundColor: theme.fn.rgba(
                      theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 0],
                      0.35
                    ),
                  },
                })}
              >
                Queue
              </Tabs.Tab>
              <Tabs.Tab 
                value="search" 
                icon={<IconSearch size={14} />}
                sx={(theme) => ({
                  '&[data-active]': {
                    backgroundColor: theme.fn.rgba(
                      theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 0],
                      0.35
                    ),
                  },
                })}
              >
                Search
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="queue" pt="md">
              <QueueList
                items={queue}
                currentItem={currentItem}
                loading={queueLoading}
              />
            </Tabs.Panel>

            <Tabs.Panel value="search" pt="md">
              <SearchPanel onAdd={addToQueue} />
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
} 