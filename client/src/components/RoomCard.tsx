import { Card, Text, Group, Button, ActionIcon, useMantineTheme } from '@mantine/core';
import { IconDoor, IconTrash } from '@tabler/icons-react';
import { Room } from '../types';

interface RoomCardProps {
  room: Room;
  onJoin: () => void;
  onDelete?: () => void;
}

export default function RoomCard({ room, onJoin, onDelete }: RoomCardProps) {
  const theme = useMantineTheme();

  return (
    <Card 
      className="card-hover"
      p="lg"
      radius="md"
      style={{
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
      }}
    >
      <Group position="apart" mb="xs">
        <Text size="lg" weight={500}>
          {room.name}
        </Text>
        <Text size="sm" color="dimmed">
          Created {new Date(room.createdAt).toLocaleDateString()}
        </Text>
      </Group>

      <Group position="apart" mt="md">
        <Button
          leftIcon={<IconDoor size={16} />}
          variant="light"
          onClick={onJoin}
        >
          Join Room
        </Button>

        {onDelete && (
          <ActionIcon 
            color="red" 
            variant="light" 
            onClick={onDelete}
            sx={{
              '&:hover': {
                backgroundColor: theme.fn.rgba(theme.colors.red[9], 0.15),
              },
            }}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Card>
  );
} 