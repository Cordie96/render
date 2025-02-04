import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Paper, Stack, Title, Button, Group, useMantineTheme } from '@mantine/core';
import { IconDeviceRemote, IconQrcode, IconSettings } from '@tabler/icons-react';
import QRCode from 'qrcode.react';
import PlayerManager from '../components/player/PlayerManager';
import QueueManager from '../components/queue/QueueManager';
import { useRoom } from '../hooks/useRoom';
import { useQueue } from '../hooks/useQueue';
import { useAuth } from '../contexts/AuthContext';
import ErrorAlert from '../components/ErrorAlert';
import LoadingOverlay from '../components/LoadingOverlay';
import PageHeader from '../components/PageHeader';
import QRCodeModal from '../components/modals/QRCodeModal';
import RoomSettingsModal from '../components/modals/RoomSettingsModal';
import { RoomSettings } from '../types';

export default function RoomScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const { user } = useAuth();
  const { room, loading: roomLoading, error: roomError, updateSettings } = useRoom(roomId!);
  const { queue, currentItem, loading: queueLoading } = useQueue(roomId!);
  const [qrModalOpened, setQrModalOpened] = useState(false);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  const isHost = room?.hostId === user?.id;

  const headerActions = [
    {
      label: 'Settings',
      icon: IconSettings,
      onClick: () => setSettingsModalOpened(true),
      variant: 'light',
    },
    {
      label: 'Remote Control',
      icon: IconDeviceRemote,
      onClick: () => navigate(`/remote/${roomId}`),
    },
    {
      label: 'Show QR Code',
      icon: IconQrcode,
      onClick: () => setQrModalOpened(true),
    },
  ];

  const handleSaveSettings = async (settings: RoomSettings) => {
    try {
      await updateSettings(settings);
    } catch (error) {
      // Error is already handled by useRoom hook
      console.error('Failed to update room settings:', error);
    }
  };

  if (roomLoading) {
    return <LoadingOverlay message="Loading room..." />;
  }

  if (roomError) {
    return <ErrorAlert error={roomError} />;
  }

  if (!room) {
    return <ErrorAlert error={new Error('Room not found')} />;
  }

  return (
    <Container size="xl" py="xl">
      <Stack spacing="lg">
        <PageHeader 
          title={room.name}
          subtitle={`Hosted by ${room.hostName}`}
          actions={headerActions}
        />

        <Grid gutter="lg">
          <Grid.Col span={8}>
            <Paper 
              p="md" 
              radius="md"
              style={{
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
              }}
            >
              <PlayerManager
                roomId={roomId!}
                currentItem={currentItem}
                isHost={isHost}
              />
            </Paper>
          </Grid.Col>

          <Grid.Col span={4}>
            <Paper 
              p="md" 
              radius="md"
              style={{
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
              }}
            >
              <Stack spacing="md">
                <Title order={3}>Room QR Code</Title>
                <QRCode
                  value={`${window.location.origin}/remote/${roomId}`}
                  size={200}
                  level="H"
                  bgColor={theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white}
                  fgColor={theme.colorScheme === 'dark' ? theme.white : theme.black}
                  style={{ margin: '0 auto' }}
                />
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper 
              p="md" 
              radius="md"
              style={{
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
              }}
            >
              <QueueManager
                roomId={roomId!}
                queue={queue}
                currentItem={currentItem}
                isHost={isHost}
                loading={queueLoading}
              />
            </Paper>
          </Grid.Col>
        </Grid>

        <QRCodeModal
          opened={qrModalOpened}
          onClose={() => setQrModalOpened(false)}
          roomId={roomId!}
          roomName={room.name}
        />

        {isHost && (
          <RoomSettingsModal
            opened={settingsModalOpened}
            onClose={() => setSettingsModalOpened(false)}
            room={room}
            onSave={handleSaveSettings}
          />
        )}
      </Stack>
    </Container>
  );
} 