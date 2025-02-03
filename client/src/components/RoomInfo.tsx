import { Paper, Stack, Title, Text, CopyButton, Button, Group } from '@mantine/core';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import QRCode from 'qrcode.react';
import { Room } from '../types';

interface RoomInfoProps {
  room: Room;
  onClose?: () => void;
}

export default function RoomInfo({ room, onClose }: RoomInfoProps) {
  const remoteUrl = `${window.location.origin}/remote/${room.id}`;

  return (
    <Paper p="md" shadow="sm">
      <Stack spacing="md">
        <Title order={2}>{room.name}</Title>
        <Text size="sm" color="dimmed">
          Share this link with others to let them join and add songs to the queue:
        </Text>
        <Group position="apart">
          <Text size="sm" style={{ wordBreak: 'break-all' }}>
            {remoteUrl}
          </Text>
          <CopyButton value={remoteUrl} timeout={2000}>
            {({ copied, copy }) => (
              <Button
                color={copied ? 'teal' : 'blue'}
                onClick={copy}
                leftIcon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                compact
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </CopyButton>
        </Group>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <QRCode value={remoteUrl} size={200} level="H" />
        </div>
        {onClose && (
          <Button color="red" onClick={onClose}>
            Close Room
          </Button>
        )}
      </Stack>
    </Paper>
  );
} 