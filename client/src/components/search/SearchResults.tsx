import { Stack, Card, Group, Text, Button, Image, Skeleton, useMantineTheme } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { YouTubeVideo } from '../../types';

interface SearchResultsProps {
  results: YouTubeVideo[];
  onAdd: (video: YouTubeVideo) => Promise<void>;
  loading?: boolean;
}

export default function SearchResults({ results, onAdd, loading }: SearchResultsProps) {
  const theme = useMantineTheme();

  if (loading) {
    return (
      <Stack spacing="md">
        {[1, 2, 3].map((i) => (
          <Card key={i} p="md" radius="md">
            <Group>
              <Skeleton height={90} width={120} radius="md" />
              <Stack spacing="xs" style={{ flex: 1 }}>
                <Skeleton height={20} radius="sm" width="70%" />
                <Skeleton height={16} radius="sm" width="40%" />
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    );
  }

  if (!results.length) {
    return (
      <Text align="center" color="dimmed">
        No results found
      </Text>
    );
  }

  return (
    <Stack spacing="md">
      {results.map((video) => (
        <Card 
          key={video.id}
          p="md"
          radius="md"
          className="card-hover"
          style={{
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
          }}
        >
          <Group>
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={120}
              height={90}
              radius="md"
              withPlaceholder
            />
            <Stack spacing="xs" style={{ flex: 1 }}>
              <Text weight={500} lineClamp={2}>
                {video.title}
              </Text>
              <Text size="sm" color="dimmed">
                {video.channelTitle}
              </Text>
              <Button
                leftIcon={<IconPlus size={16} />}
                variant="light"
                size="sm"
                onClick={() => onAdd(video)}
                sx={{
                  alignSelf: 'flex-start',
                  '&:hover': {
                    backgroundColor: theme.fn.rgba(theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 1], 0.35),
                  },
                }}
              >
                Add to Queue
              </Button>
            </Stack>
          </Group>
        </Card>
      ))}
    </Stack>
  );
} 