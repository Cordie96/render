import { useState } from 'react';
import { Stack, TextInput, Button, Group } from '@mantine/core';
import { useSocket } from '../hooks/useSocket';
import { useYouTubeSearch } from '../hooks/useYouTubeSearch';
import SearchResults from './SearchResults';

interface RemoteControlsProps {
  roomId: string;
}

export default function RemoteControls({ roomId }: RemoteControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { socket } = useSocket();
  const { search, results, isLoading } = useYouTubeSearch();

  const handleSearch = () => {
    search(searchQuery);
  };

  const handlePlaybackControl = (command: string) => {
    socket?.emit('player-command', { roomId, command });
  };

  return (
    <Stack spacing="md">
      <Group grow>
        <Button onClick={() => handlePlaybackControl('play')}>Play</Button>
        <Button onClick={() => handlePlaybackControl('pause')}>Pause</Button>
        <Button onClick={() => handlePlaybackControl('skip')}>Skip</Button>
      </Group>

      <TextInput
        placeholder="Search for songs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        rightSection={
          <Button 
            onClick={handleSearch} 
            loading={isLoading}
            size="xs"
          >
            Search
          </Button>
        }
      />

      <SearchResults 
        results={results} 
        roomId={roomId} 
      />
    </Stack>
  );
} 