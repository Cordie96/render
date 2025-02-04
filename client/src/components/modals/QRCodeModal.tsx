import { Stack, Title, Text, useMantineTheme } from '@mantine/core';
import QRCode from 'qrcode.react';
import BaseModal from './BaseModal';

interface QRCodeModalProps {
  opened: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
}

export default function QRCodeModal({ opened, onClose, roomId, roomName }: QRCodeModalProps) {
  const theme = useMantineTheme();

  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title="Join Room"
    >
      <Stack spacing="md" align="center" py="md">
        <Text size="lg" weight={500}>
          Scan to join {roomName}
        </Text>
        <QRCode
          value={`${window.location.origin}/remote/${roomId}`}
          size={250}
          level="H"
          bgColor={theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white}
          fgColor={theme.colorScheme === 'dark' ? theme.white : theme.black}
        />
        <Text size="sm" color="dimmed" align="center">
          Or share this link:
          <br />
          <Text component="span" weight={500} color={theme.primaryColor}>
            {window.location.origin}/remote/{roomId}
          </Text>
        </Text>
      </Stack>
    </BaseModal>
  );
} 