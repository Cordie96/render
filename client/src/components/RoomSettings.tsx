import { Paper, Stack, Switch, Group, Text, Button } from '@mantine/core';
import { useCallback } from 'react';
import { useRoom } from '../hooks/useRoom';
import { roomApi } from '../services/api';
import { useError } from '../hooks/useError';

interface RoomSettingsProps {
  roomId: string;
}

export default function RoomSettings({ roomId }: RoomSettingsProps) {
  const { room, refreshRoom } = useRoom(roomId);
  const { handleError } = useError();

  const handleSettingChange = useCallback(async (setting: string, value: boolean) => {
    try {
      await roomApi.updateRoomSettings(roomId, { [setting]: value });
      await refreshRoom();
    } catch (error) {
      handleError(error);
    }
  }, [roomId, refreshRoom, handleError]);

  if (!room) return null;

  return (
    <Paper p="md" withBorder>
      <Stack spacing="md">
        <Text weight={500}>Room Settings</Text>

        <Group position="apart">
          <div>
            <Text>Allow Song Requests</Text>
            <Text size="sm" color="dimmed">
              Let users add songs to the queue
            </Text>
          </div>
          <Switch
            checked={room.settings?.allowRequests ?? true}
            onChange={(event) =>
              handleSettingChange('allowRequests', event.currentTarget.checked)
            }
          />
        </Group>

        <Group position="apart">
          <div>
            <Text>Auto-play Next</Text>
            <Text size="sm" color="dimmed">
              Automatically play next song in queue
            </Text>
          </div>
          <Switch
            checked={room.settings?.autoPlay ?? true}
            onChange={(event) =>
              handleSettingChange('autoPlay', event.currentTarget.checked)
            }
          />
        </Group>
      </Stack>
    </Paper>
  );
} 