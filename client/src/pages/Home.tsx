import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  TextInput,
  Paper,
} from '@mantine/core';
import { useError } from '../hooks/useError';
import { roomApi } from '../utils/api';
import ErrorAlert from '../components/ErrorAlert';

export default function Home() {
  const navigate = useNavigate();
  const { error, handleError, clearError } = useError();
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;
    
    setLoading(true);
    try {
      const { data } = await roomApi.create(roomName);
      navigate(`/screen/${data.id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      {error && <ErrorAlert error={error} onClose={clearError} />}

      <Stack spacing="xl">
        <Title order={2} align="center">Welcome to Karaoke Party</Title>

        <Paper p="xl" radius="md" withBorder>
          <Stack spacing="md">
            <Title order={3}>Create a Room</Title>
            <Text color="dimmed" size="sm">
              Start a new karaoke session and invite your friends!
            </Text>

            <Group grow>
              <TextInput
                placeholder="Enter room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              />
              <Button onClick={handleCreateRoom} loading={loading}>
                Create Room
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper p="xl" radius="md" withBorder>
          <Stack spacing="md">
            <Title order={3}>Join a Room</Title>
            <Text color="dimmed" size="sm">
              Join an existing karaoke session as a remote controller.
            </Text>

            <Button
              variant="light"
              onClick={() => navigate('/remote')}
              fullWidth
            >
              Scan QR Code
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 