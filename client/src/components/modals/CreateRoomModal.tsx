import { useState } from 'react';
import { Stack, TextInput, Switch, Group, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import BaseModal from './BaseModal';
import { roomService } from '../../services/roomService';
import { RoomSettings } from '../../types';

interface CreateRoomModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ opened, onClose }: CreateRoomModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<RoomSettings>({
    initialValues: {
      name: '',
      allowGuestControl: false,
      autoPlay: true,
    },
    validate: {
      name: (value) => (!value ? 'Room name is required' : null),
    },
  });

  const handleSubmit = async (values: RoomSettings) => {
    try {
      setLoading(true);
      setError(null);
      const room = await roomService.createRoom(values);
      onClose();
      navigate(`/room/${room.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Create Room"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {error && (
            <Alert color="red" title="Error" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}

          <TextInput
            label="Room Name"
            placeholder="Enter room name"
            required
            {...form.getInputProps('name')}
          />

          <Switch
            label="Allow Guest Control"
            description="Let guests control playback"
            {...form.getInputProps('allowGuestControl', { type: 'checkbox' })}
          />

          <Switch
            label="Auto Play"
            description="Automatically play next song in queue"
            {...form.getInputProps('autoPlay', { type: 'checkbox' })}
          />

          <Group position="right" spacing="sm">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Room
            </Button>
          </Group>
        </Stack>
      </form>
    </BaseModal>
  );
} 