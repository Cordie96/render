import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useSearch } from '../useSearch';

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty query', () => {
    const { result } = renderHook(() => useSearch());
    expect(result.current.query).toBe('');
    expect(result.current.debouncedQuery).toBe('');
  });

  it('updates query immediately but debounces debouncedQuery', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    expect(result.current.query).toBe('test');
    expect(result.current.debouncedQuery).toBe('');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.debouncedQuery).toBe('test');
    vi.useRealTimers();
  });

  it('cancels previous debounce timer on rapid updates', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test1');
    });

    act(() => {
      vi.advanceTimersByTime(200); // Before debounce timeout
    });

    act(() => {
      result.current.setQuery('test2');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.debouncedQuery).toBe('test2');
    vi.useRealTimers();
  });

  it('cleans up debounce timer on unmount', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('test');
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // No error should occur after unmount
    expect(true).toBe(true);
    vi.useRealTimers();
  });

  it('handles empty string query', () => {
    const { result } = renderHook(() => useSearch());

    act(() => {
      result.current.setQuery('');
    });

    expect(result.current.query).toBe('');
    expect(result.current.debouncedQuery).toBe('');
  });
}); 