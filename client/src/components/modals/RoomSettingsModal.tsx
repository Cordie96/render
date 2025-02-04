import { useState } from 'react';
import { Stack, TextInput, Switch, Group, Button, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import BaseModal from './BaseModal';
import { Room } from '../../types';

interface RoomSettingsModalProps {
  opened: boolean;
  onClose: () => void;
  room: Room;
  onSave: (settings: RoomSettings) => Promise<void>;
}

interface RoomSettings {
  name: string;
  allowGuestControl: boolean;
  autoPlay: boolean;
}

export default function RoomSettingsModal({
  opened,
  onClose,
  room,
  onSave,
}: RoomSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RoomSettings>({
    initialValues: {
      name: room.name,
      allowGuestControl: room.settings?.allowGuestControl ?? false,
      autoPlay: room.settings?.autoPlay ?? true,
    },
  });

  const handleSubmit = async (values: RoomSettings) => {
    try {
      setLoading(true);
      setError(null);
      await onSave(values);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save room settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Room Settings"
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
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </BaseModal>
  );
} 