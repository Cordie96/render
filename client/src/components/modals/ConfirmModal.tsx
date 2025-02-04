import { Stack, Text, Group, Button } from '@mantine/core';
import BaseModal from './BaseModal';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  danger?: boolean;
}

export default function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  danger = false,
}: ConfirmModalProps) {
  return (
    <BaseModal
      opened={opened}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <Stack spacing="lg">
        <Text size="sm">{message}</Text>

        <Group position="right" spacing="sm">
          <Button 
            variant="default" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            color={danger ? 'red' : undefined}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </BaseModal>
  );
} 