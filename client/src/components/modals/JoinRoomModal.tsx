import { useState } from 'react';
import { Stack, TextInput, Group, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import BaseModal from './BaseModal';
import { roomService } from '../../services/roomService';

interface JoinRoomModalProps {
  opened: boolean;
  onClose: () => void;
}

interface JoinRoomForm {
  roomId: string;
}

export default function JoinRoomModal({ opened, onClose }: JoinRoomModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<JoinRoomForm>({
    initialValues: {
      roomId: '',
    },
    validate: {
      roomId: (value) => (!value ? 'Room ID is required' : null),
    },
  });

  const handleSubmit = async (values: JoinRoomForm) => {
    try {
      setLoading(true);
      setError(null);
      await roomService.joinRoom(values.roomId);
      onClose();
      navigate(`/remote/${values.roomId}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Join Room"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {error && (
            <Alert color="red" title="Error" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}

          <TextInput
            label="Room ID"
            placeholder="Enter room ID"
            required
            {...form.getInputProps('roomId')}
          />

          <Group position="right" spacing="sm">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Join Room
            </Button>
          </Group>
        </Stack>
      </form>
    </BaseModal>
  );
} 