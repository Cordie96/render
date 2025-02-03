import { Group, Title, Button, Text, ActionIcon, Menu } from '@mantine/core';
import { IconDeviceRemote, IconDotsVertical, IconCopy, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Room } from '../types';

interface RoomHeaderProps {
  room: Room;
  onDelete?: () => void;
}

export default function RoomHeader({ room, onDelete }: RoomHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isHost = user?.id === room.hostId;

  const copyRoomLink = () => {
    const url = `${window.location.origin}/screen/${room.id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <Group position="apart">
      <div>
        <Title order={2}>{room.name}</Title>
        <Text size="sm" color="dimmed">
          Hosted by {room.hostName}
        </Text>
      </div>

      <Group>
        <Button
          variant="light"
          leftIcon={<IconDeviceRemote size={16} />}
          onClick={() => navigate(`/remote/${room.id}`)}
        >
          Open Remote
        </Button>

        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon>
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item icon={<IconCopy size={16} />} onClick={copyRoomLink}>
              Copy Room Link
            </Menu.Item>
            {isHost && onDelete && (
              <Menu.Item
                color="red"
                icon={<IconTrash size={16} />}
                onClick={onDelete}
              >
                Delete Room
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
} 