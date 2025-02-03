import { Center, Loader, Text, Stack } from '@mantine/core';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <Center style={{ height: '100%', minHeight: 200 }}>
      <Stack align="center" spacing="sm">
        <Loader size="lg" />
        {message && (
          <Text size="sm" color="dimmed">
            {message}
          </Text>
        )}
      </Stack>
    </Center>
  );
} 