import { useCallback } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

export function useApiError() {
  const handleApiError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
      return new Error(message);
    }
    
    if (error instanceof Error) {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
      return error;
    }

    const genericError = new Error('An unexpected error occurred');
    notifications.show({
      title: 'Error',
      message: genericError.message,
      color: 'red',
    });
    return genericError;
  }, []);

  return { handleApiError };
} 