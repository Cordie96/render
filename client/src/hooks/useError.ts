import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '../utils/api';

export function useError() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError;
      setError(apiError?.message || 'An unexpected error occurred');
    } else if (error instanceof Error) {
      setError(error.message);
    } else if (typeof error === 'string') {
      setError(error);
    } else {
      setError('An unexpected error occurred');
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
} 