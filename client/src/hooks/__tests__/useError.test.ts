import { renderHook, act } from '@testing-library/react';
import { useError } from '../useError';
import { AxiosError } from 'axios';

describe('useError', () => {
  it('handles string errors', () => {
    const { result } = renderHook(() => useError());

    act(() => {
      result.current.handleError('Test error message');
    });

    expect(result.current.error).toBe('Test error message');
  });

  it('handles Error objects', () => {
    const { result } = renderHook(() => useError());
    const error = new Error('Test error');

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toBe('Test error');
  });

  it('handles Axios errors', () => {
    const { result } = renderHook(() => useError());
    const error = new AxiosError();
    error.response = {
      data: { message: 'API error message' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {},
    };

    act(() => {
      result.current.handleError(error);
    });

    expect(result.current.error).toBe('API error message');
  });

  it('clears error', () => {
    const { result } = renderHook(() => useError());

    act(() => {
      result.current.handleError('Test error');
    });
    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
}); 