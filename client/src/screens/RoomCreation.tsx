import { Container, Paper, Title, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import RoomForm from '../components/forms/RoomForm';
import { useFormSubmit } from '../hooks/useFormSubmit';
import { roomApi } from '../services/api';
import ErrorAlert from '../components/ErrorAlert';
import { useError } from '../hooks/useError';

export default function RoomCreation() {
  const navigate = useNavigate();
  const { error, clearError } = useError();
  const { loading, handleSubmit } = useFormSubmit({
    onSubmit: async (values) => {
      const room = await roomApi.createRoom(values.name);
      navigate(`/screen/${room.id}`);
    },
  });

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack spacing="lg">
          <Title order={2} align="center">
            Create a Room
          </Title>

          {error && <ErrorAlert error={error} onClose={clearError} />}

          <RoomForm onSubmit={handleSubmit} loading={loading} />
        </Stack>
      </Paper>
    </Container>
  );
} 