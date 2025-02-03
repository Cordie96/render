import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Stack, Title } from '@mantine/core';
import { useRoomManagement } from '../hooks/useRoomManagement';
import { useError } from '../hooks/useError';
import ErrorAlert from './ErrorAlert';

export default function RoomCreation() {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createRoom } = useRoomManagement();
  const { error, clearError } = useError();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      setLoading(true);
      const room = await createRoom(roomName);
      navigate(`/screen/${room.id}`);
    } catch (error) {
      // Error is handled by useError hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" shadow="sm">
      <Stack spacing="md">
        <Title order={2}>Create a Room</Title>
        {error && <ErrorAlert error={error} onClose={clearError} />}
        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Room Name"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
            <Button type="submit" loading={loading}>
              Create Room
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
} 