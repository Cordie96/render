import { Stack, Title, Button, Group, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import RoomCard from './RoomCard';
import { useRooms } from '../hooks/useRooms';
import { useAuth } from '../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import LoadingOverlay from './LoadingOverlay';

export default function RoomList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { rooms, loading, error, deleteRoom } = useRooms();

  if (loading) {
    return <LoadingOverlay message="Loading rooms..." />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <Stack spacing="xl">
      <Group position="apart">
        <Title order={2}>Available Rooms</Title>
        <Button onClick={() => navigate('/create')}>Create Room</Button>
      </Group>

      {rooms.length === 0 ? (
        <Text align="center" color="dimmed">
          No rooms available. Create one to get started!
        </Text>
      ) : (
        <Stack spacing="md">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={() => navigate(`/screen/${room.id}`)}
              onDelete={
                user?.id === room.hostId
                  ? () => deleteRoom(room.id)
                  : undefined
              }
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
} 