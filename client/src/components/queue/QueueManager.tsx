import { Stack, Title, Group, Button } from '@mantine/core';
import { IconPlayerSkipForward } from '@tabler/icons-react';
import QueueList from './QueueList';
import SearchBar from '../search/SearchBar';
import SearchResults from '../search/SearchResults';
import { useQueue } from '../../hooks/useQueue';
import { useSearch } from '../../hooks/useSearch';
import { useAuth } from '../../contexts/AuthContext';

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

      {query && (
        <SearchResults
          results={results}
          onAdd={async (video) => {
            await addToQueue({
              youtubeVideoId: video.id,
              title: video.title,
            });
            setQuery('');
          }}
          loading={searchLoading}
        />
      )}

      <QueueList
        items={queue}
        currentItem={currentItem}
        loading={queueLoading}
        canReorder={isHost}
        onReorder={reorderQueue}
        onRemove={(itemId) => {
          const item = queue.find((i) => i.id === itemId);
          if (item && (isHost || item.addedById === user?.id)) {
            removeFromQueue(itemId);
          }
        }}
      />
    </Stack>
  );
} 