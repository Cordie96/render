import { Alert, useMantineTheme } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface ErrorAlertProps {
  error: Error;
  onClose?: () => void;
}

export default function ErrorAlert({ error, onClose }: ErrorAlertProps) {
  const theme = useMantineTheme();

  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="Error"
      color="red"
      withCloseButton={!!onClose}
      onClose={onClose}
      styles={(theme) => ({
        root: {
          backgroundColor: theme.colorScheme === 'dark' 
            ? theme.fn.rgba(theme.colors.red[9], 0.15)
            : theme.fn.rgba(theme.colors.red[0], 0.5),
        },
        title: {
          color: theme.colorScheme === 'dark'
            ? theme.colors.red[3]
            : theme.colors.red[7],
        },
        message: {
          color: theme.colorScheme === 'dark'
            ? theme.colors.red[2]
            : theme.colors.red[8],
        },
        closeButton: {
          color: theme.colorScheme === 'dark'
            ? theme.colors.red[3]
            : theme.colors.red[7],
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark'
              ? theme.fn.rgba(theme.colors.red[9], 0.25)
              : theme.fn.rgba(theme.colors.red[0], 0.75),
          },
        },
      })}
    >
      {error.message}
    </Alert>
  );
} 