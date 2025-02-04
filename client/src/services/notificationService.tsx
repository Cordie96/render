import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export const notificationService = {
  success: (message: string) => {
    notifications.show({
      title: 'Success',
      message,
      color: 'green',
      icon: <IconCheck size={16} />,
      autoClose: 3000,
    });
  },

  error: (message: string) => {
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
      icon: <IconX size={16} />,
      autoClose: 5000,
    });
  },

  warning: (message: string) => {
    notifications.show({
      title: 'Warning',
      message,
      color: 'yellow',
      autoClose: 4000,
    });
  },
};

export default notificationService; 