import { Stack, Title, Group, Button } from '@mantine/core';
import { IconPlayerSkipForward } from '@tabler/icons-react';
import QueueList from './QueueList';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { useQueue } from '../hooks/useQueue';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../contexts/AuthContext';
import { YouTubeVideo } from '../types';

interface QueueManagerProps {
  roomId: string;
}

export default function QueueManager({ roomId }: QueueManagerProps) {
  const { user } = useAuth();
  const {
    queue,
    currentItem,
    loading: queueLoading,
    addToQueue,
    removeFromQueue,
    reorderQueue,
    skipCurrent,
  } = useQueue(roomId);

  const {
    query,
    setQuery,
    results,
    loading: searchLoading,
    search,
  } = useSearch();

  const isHost = currentItem?.addedById === user?.id;

  const handleAddToQueue = async (video: YouTubeVideo) => {
    try {
      await addToQueue({
        youtubeVideoId: video.id,
        title: video.title,
      });
      setQuery('');
    } catch (error) {
      // Error will be handled by useQueue
    }
  };

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Title order={3}>Queue</Title>
        {isHost && currentItem && (
          <Button
            leftIcon={<IconPlayerSkipForward size={16} />}
            variant="light"
            onClick={skipCurrent}
          >
            Skip Current
          </Button>
        )}
      </Group>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSearch={search}
        loading={searchLoading}
      />

      <SearchResults
        results={results}
        onAdd={handleAddToQueue}
        loading={searchLoading}
      />

      <QueueList
        queue={queue}
        currentItem={currentItem}
        isHost={isHost}
        onRemove={removeFromQueue}
        onReorder={isHost ? reorderQueue : undefined}
        loading={queueLoading}
      />
    </Stack>
  );
} 