import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorAlertProps {
  error: Error;
  onClose?: () => void;
}

export default function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="Error"
      color="red"
      withCloseButton={!!onClose}
      onClose={onClose}
    >
      {error.message}
    </Alert>
  );
} 