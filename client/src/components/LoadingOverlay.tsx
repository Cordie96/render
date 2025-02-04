import { Center, Loader, Text, Stack, useMantineTheme } from '@mantine/core';

interface LoadingOverlayProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LoadingOverlay({ 
  message = 'Loading...', 
  size = 'lg' 
}: LoadingOverlayProps) {
  const theme = useMantineTheme();

  return (
    <Center style={{ height: '100%', minHeight: 200 }}>
      <Stack spacing="md" align="center">
        <Loader 
          size={size} 
          color={theme.primaryColor}
          variant={theme.colorScheme === 'dark' ? 'dots' : 'oval'}
        />
        {message && (
          <Text 
            size="sm" 
            color="dimmed"
            align="center"
            sx={{
              color: theme.colorScheme === 'dark' 
                ? theme.colors.dark[2] 
                : theme.colors.gray[6],
            }}
          >
            {message}
          </Text>
        )}
      </Stack>
    </Center>
  );
} 