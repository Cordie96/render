import { Center, Loader, Stack, Text } from '@mantine/core';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <Center style={{ height: '100vh' }}>
      <Stack align="center" spacing="md">
        <Loader size="lg" />
        <Text size="sm" color="dimmed">
          {message}
        </Text>
      </Stack>
    </Center>
  );
} 