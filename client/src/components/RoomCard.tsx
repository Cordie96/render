import { Card, Text, Group, Button, ActionIcon } from '@mantine/core';
import { IconDoor, IconTrash } from '@tabler/icons-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onJoin: () => void;
  onDelete?: () => void;
}

export default function RoomCard({ room, onJoin, onDelete }: RoomCardProps) {
  return (
    <Card p="md" withBorder>
      <Group position="apart">
        <div>
          <Text weight={500}>{room.name}</Text>
          <Text size="sm" color="dimmed">
            Hosted by {room.hostName}
          </Text>
        </div>
        <Group>
          <Button
            variant="light"
            leftIcon={<IconDoor size={16} />}
            onClick={onJoin}
          >
            Join
          </Button>
          {onDelete && (
            <ActionIcon color="red" variant="light" onClick={onDelete}>
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Card>
  );
} 