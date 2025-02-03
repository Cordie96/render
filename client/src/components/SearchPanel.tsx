import { useState } from 'react';
import { TextInput, Button, Stack, Group, Text, Image } from '@mantine/core';
import { useYouTubeSearch } from '../hooks/useYouTubeSearch';

interface SearchPanelProps {
  onAddToQueue: (video: { youtubeVideoId: string; title: string }) => Promise<void>;
}

export default function SearchPanel({ onAddToQueue }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const { search, results, isLoading, error } = useYouTubeSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query);
    }
  };

  return (
    <Stack spacing="md">
      <form onSubmit={handleSearch}>
        <Group>
          <TextInput
            placeholder="Search for songs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button type="submit" loading={isLoading}>Search</Button>
        </Group>
      </form>

      {error && (
        <Text color="red" size="sm">{error}</Text>
      )}

      <Stack spacing="xs">
        {results.map((video) => (
          <Group key={video.id} position="apart" p="xs" bg="gray.0">
            <Group>
              <Image
                src={video.thumbnail}
                width={80}
                height={45}
                radius="sm"
                alt={video.title}
              />
              <Text size="sm">{video.title}</Text>
            </Group>
            <Button
              variant="light"
              size="xs"
              onClick={() => onAddToQueue({
                youtubeVideoId: video.id,
                title: video.title,
              })}
            >
              Add to Queue
            </Button>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
} 