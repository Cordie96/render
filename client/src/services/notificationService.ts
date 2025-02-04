import { notifications } from '@mantine/notifications';

export const notificationService = {
  success: (message: string) => {
    notifications.show({
      title: 'Success',
      message,
      color: 'green',
      autoClose: 3000,
    });
  },

  error: (message: string) => {
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
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