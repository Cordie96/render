import { useEffect, useRef } from 'react';
import { Paper, Center, Loader, Text, useMantineTheme } from '@mantine/core';
import YouTube from 'react-youtube';

interface YouTubePlayerProps {
  videoId: string;
  onStateChange: (state: number) => void;
  onReady: (event: { target: YT.Player }) => void;
  loading?: boolean;
}

export default function YouTubePlayer({
  videoId,
  onStateChange,
  onReady,
  loading,
}: YouTubePlayerProps) {
  const theme = useMantineTheme();
  const playerRef = useRef<YT.Player>();

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  if (loading) {
    return (
      <Paper 
        p="xl"
        style={{ 
          aspectRatio: '16/9',
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[1],
        }}
      >
        <Center style={{ height: '100%' }}>
          <Loader size="lg" />
        </Center>
      </Paper>
    );
  }

  if (!videoId) {
    return (
      <Paper 
        p="xl"
        style={{ 
          aspectRatio: '16/9',
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[1],
        }}
      >
        <Center style={{ height: '100%' }}>
          <Text color="dimmed">No video selected</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <YouTube
      videoId={videoId}
      opts={{
        height: '100%',
        width: '100%',
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          color: theme.colorScheme === 'dark' ? 'white' : 'red',
        },
      }}
      onReady={(event) => {
        playerRef.current = event.target;
        onReady(event);
      }}
      onStateChange={(event) => onStateChange(event.data)}
      style={{
        aspectRatio: '16/9',
      }}
    />
  );
} 