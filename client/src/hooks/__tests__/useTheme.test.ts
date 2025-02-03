import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with system theme preference', () => {
    const mockMatchMedia = vi.fn(() => ({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('toggles theme', () => {
    const { result } = renderHook(() => useTheme());
    const initialTheme = result.current.theme;

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).not.toBe(initialTheme);
  });

  it('persists theme preference in localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('loads theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('updates theme based on system preference changes', () => {
    let callback: ((e: { matches: boolean }) => void) | null = null;
    const mockMatchMedia = vi.fn(() => ({
      matches: false,
      addListener: (cb: any) => {
        callback = cb;
      },
      removeListener: vi.fn(),
    }));
    window.matchMedia = mockMatchMedia;

    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');

    act(() => {
      if (callback) {
        callback({ matches: true });
      }
    });

    expect(result.current.theme).toBe('dark');
  });

  it('cleans up media query listener on unmount', () => {
    const removeListener = vi.fn();
    const mockMatchMedia = vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener,
    }));
    window.matchMedia = mockMatchMedia;

    const { unmount } = renderHook(() => useTheme());
    unmount();

    expect(removeListener).toHaveBeenCalled();
  });
}); 