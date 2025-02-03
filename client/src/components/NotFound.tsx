import { Container, Title, Text, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container size="sm" py="xl">
      <Stack align="center" spacing="md">
        <Title order={1}>404</Title>
        <Title order={2}>Page not found</Title>
        <Text color="dimmed" size="lg" align="center">
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <Button onClick={() => navigate('/')}>
          Return to home
        </Button>
      </Stack>
    </Container>
  );
} 