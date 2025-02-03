import { useEffect, useState, useCallback } from 'react';
import { Stack, Title, Group, TextInput, Button } from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { IconSearch } from '@tabler/icons-react';
import QueueList from './QueueList';
import SearchResults from './SearchResults';
import { useSocket } from '../hooks/useSocket';
import { useQueueManagement } from '../hooks/useQueueManagement';
import { useRoom } from '../contexts/RoomContext';
import { useError } from '../hooks/useError';
import { useYouTubeSearch } from '../hooks/useYouTubeSearch';
import ErrorAlert from './ErrorAlert';
import LoadingScreen from './LoadingScreen';

interface SearchResult {
  id: string;
  title: string;
  thumbnail: string;
}

export default function RemoteScreen() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { room } = useRoom();
  const { queue, currentItem, loading: queueLoading, addToQueue, removeFromQueue } = useQueueManagement(roomId!);
  const { error, handleError, clearError } = useError();
  const [searchQuery, setSearchQuery] = useState('');
  const { results, loading: isSearching, search } = useYouTubeSearch();

  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
    }
  }, [socket, roomId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    await search(`${searchQuery} karaoke`);
  };

  const handleAddToQueue = async (video: SearchResult) => {
    try {
      await addToQueue({
        youtubeVideoId: video.id,
        title: video.title,
      });
      setSearchQuery('');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Stack spacing="lg" p="md">
      {error && <ErrorAlert error={error} onClose={clearError} />}

      <Group position="apart">
        <Title order={2}>{room?.name || 'Remote Control'}</Title>
      </Group>

      <Stack>
        <Group>
          <TextInput
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
            icon={<IconSearch size={16} />}
          />
          <Button onClick={handleSearch} loading={isSearching}>
            Search
          </Button>
        </Group>

        {results.length > 0 && (
          <SearchResults
            results={results}
            onAdd={handleAddToQueue}
          />
        )}

        {queueLoading ? (
          <LoadingScreen message="Loading queue..." />
        ) : (
          <QueueList
            queue={queue}
            currentItem={currentItem}
            isHost={false}
            onRemove={removeFromQueue}
          />
        )}
      </Stack>
    </Stack>
  );
} 