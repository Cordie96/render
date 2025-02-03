import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useNotification } from '../useNotification';

describe('useNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty notifications', () => {
    const { result } = renderHook(() => useNotification());
    expect(result.current.notifications).toEqual([]);
  });

  it('adds notification', () => {
    const { result } = renderHook(() => useNotification());
    const notification = {
      id: '1',
      message: 'Test notification',
      type: 'success' as const,
    };

    act(() => {
      result.current.addNotification(notification);
    });

    expect(result.current.notifications).toContainEqual(notification);
  });

  it('removes notification', () => {
    const { result } = renderHook(() => useNotification());
    const notification = {
      id: '1',
      message: 'Test notification',
      type: 'success' as const,
    };

    act(() => {
      result.current.addNotification(notification);
    });

    act(() => {
      result.current.removeNotification(notification.id);
    });

    expect(result.current.notifications).not.toContainEqual(notification);
  });

  it('auto-removes notifications after timeout', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotification());
    const notification = {
      id: '1',
      message: 'Test notification',
      type: 'success' as const,
    };

    act(() => {
      result.current.addNotification(notification);
    });

    expect(result.current.notifications).toContainEqual(notification);

    act(() => {
      vi.advanceTimersByTime(5000); // Default timeout
    });

    expect(result.current.notifications).not.toContainEqual(notification);
    vi.useRealTimers();
  });

  it('clears all notifications', () => {
    const { result } = renderHook(() => useNotification());
    const notifications = [
      {
        id: '1',
        message: 'Test notification 1',
        type: 'success' as const,
      },
      {
        id: '2',
        message: 'Test notification 2',
        type: 'error' as const,
      },
    ];

    act(() => {
      notifications.forEach(notification => {
        result.current.addNotification(notification);
      });
    });

    expect(result.current.notifications).toHaveLength(2);

    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('handles multiple notifications with same message', () => {
    const { result } = renderHook(() => useNotification());
    const message = 'Test notification';

    act(() => {
      result.current.addNotification({
        id: '1',
        message,
        type: 'success',
      });
      result.current.addNotification({
        id: '2',
        message,
        type: 'success',
      });
    });

    expect(result.current.notifications).toHaveLength(2);
    expect(result.current.notifications[0].id).not.toBe(result.current.notifications[1].id);
  });
}); 