import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Stack, Title, Button, Group } from '@mantine/core';
import { IconDeviceRemote } from '@tabler/icons-react';
import PlayerManager from '../components/PlayerManager';
import QueueManager from '../components/QueueManager';
import { useRoom } from '../hooks/useRoom';
import ErrorAlert from '../components/ErrorAlert';
import LoadingOverlay from '../components/LoadingOverlay';

export default function RoomScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, loading, error } = useRoom(roomId!);

  useEffect(() => {
    if (!loading && !room) {
      navigate('/');
    }
  }, [loading, room, navigate]);

  if (loading) {
    return <LoadingOverlay message="Loading room..." />;
  }

  if (error) {
    return <ErrorAlert error={error} />;
  }

  if (!room) {
    return null;
  }

  return (
    <Container size="xl" py="xl">
      <Stack spacing="xl">
        <Group position="apart">
          <Title order={2}>{room.name}</Title>
          <Button
            variant="light"
            leftIcon={<IconDeviceRemote size={16} />}
            onClick={() => navigate(`/remote/${roomId}`)}
          >
            Open Remote
          </Button>
        </Group>

        <Grid>
          <Grid.Col md={8}>
            <Paper p="md" withBorder>
              <PlayerManager
                roomId={roomId!}
                currentItem={null}
                onVideoEnd={() => {}}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col md={4}>
            <Paper p="md" withBorder>
              <QueueManager roomId={roomId!} />
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
} 