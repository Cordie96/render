import { Center, Loader, Text, Stack, Paper, useMantineTheme } from '@mantine/core';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingScreen({ 
  message = 'Loading...', 
  fullScreen = true 
}: LoadingScreenProps) {
  const theme = useMantineTheme();

  return (
    <Center style={{ height: fullScreen ? '100vh' : '100%', minHeight: 400 }}>
      <Paper 
        p="xl"
        radius="md"
        style={{
          backgroundColor: theme.colorScheme === 'dark' 
            ? theme.fn.rgba(theme.colors.dark[8], 0.6) 
            : theme.fn.rgba(theme.white, 0.8),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack spacing="lg" align="center">
          <Loader 
            size="xl" 
            color={theme.primaryColor}
            variant={theme.colorScheme === 'dark' ? 'dots' : 'oval'}
          />
          <Text 
            size="lg" 
            weight={500}
            align="center"
            sx={{
              color: theme.colorScheme === 'dark' 
                ? theme.colors.dark[0] 
                : theme.colors.gray[8],
            }}
          >
            {message}
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
} 