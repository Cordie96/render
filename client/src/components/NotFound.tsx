import { Container, Title, Text, Button, Stack, Paper, useMantineTheme } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  const theme = useMantineTheme();

  return (
    <Container size="sm" py="xl">
      <Paper
        p="xl"
        radius="md"
        style={{
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
        }}
      >
        <Stack align="center" spacing="lg">
          <Title
            order={2}
            align="center"
            sx={{
              color: theme.colorScheme === 'dark' ? theme.white : theme.black,
            }}
          >
            Page not found
          </Title>
          
          <Text 
            color="dimmed" 
            align="center"
            size="lg"
            sx={{
              maxWidth: 500,
              color: theme.colorScheme === 'dark' 
                ? theme.colors.dark[2] 
                : theme.colors.gray[6],
            }}
          >
            The page you are looking for doesn't exist or has been moved.
          </Text>

          <Button
            variant="light"
            leftIcon={<IconArrowLeft size={16} />}
            onClick={() => navigate('/')}
            sx={(theme) => ({
              '&:hover': {
                backgroundColor: theme.fn.rgba(
                  theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 9 : 1],
                  0.35
                ),
              },
            })}
          >
            Back to home
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
} 