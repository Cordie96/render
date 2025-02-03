import { useState, useCallback } from 'react';

interface UseFormSubmitOptions<T> {
  onSubmit: (values: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useFormSubmit<T>({ onSubmit, onSuccess, onError }: UseFormSubmitOptions<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = useCallback(
    async (values: T) => {
      try {
        setLoading(true);
        setError(null);
        await onSubmit(values);
        onSuccess?.();
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [onSubmit, onSuccess, onError]
  );

  return {
    loading,
    error,
    handleSubmit,
  };
} 