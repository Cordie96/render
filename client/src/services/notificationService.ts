import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export const notificationService = {
  success: (message: string, title = 'Success') => {
    notifications.show({
      title,
      message,
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  },

  error: (message: string, title = 'Error') => {
    notifications.show({
      title,
      message,
      color: 'red',
      icon: <IconX size={16} />,
    });
  },

  info: (message: string, title = 'Info') => {
    notifications.show({
      title,
      message,
      color: 'blue',
    });
  },
};

export default notificationService; 