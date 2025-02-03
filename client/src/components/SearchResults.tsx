import { Stack, Card, Text, Group, Button, Skeleton } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { YouTubeVideo } from '../types';

interface SearchResultsProps {
  results: YouTubeVideo[];
  onAdd: (video: YouTubeVideo) => Promise<void>;
  loading?: boolean;
}

export default function SearchResults({ results, onAdd, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <Stack spacing="md">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={80} radius="md" />
        ))}
      </Stack>
    );
  }

  if (!results.length) {
    return null;
  }

  return (
    <Stack spacing="md">
      {results.map((video) => (
        <Card key={video.id} p="sm" withBorder>
          <Group position="apart">
            <div style={{ flex: 1 }}>
              <Text size="sm" weight={500} lineClamp={2}>
                {video.title}
              </Text>
              <Text size="xs" color="dimmed">
                {video.channelTitle}
              </Text>
            </div>
            <Button
              variant="light"
              size="xs"
              leftIcon={<IconPlus size={16} />}
              onClick={() => onAdd(video)}
            >
              Add
            </Button>
          </Group>
        </Card>
      ))}
    </Stack>
  );
} 