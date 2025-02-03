import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with default value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('initializes with stored value when it exists', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored value');
  });

  it('updates stored value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new value');
    });

    expect(result.current[0]).toBe('new value');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('new value');
  });

  it('handles complex objects', () => {
    const defaultValue = { test: 'value', number: 42 };
    const { result } = renderHook(() => useLocalStorage('test-key', defaultValue));

    const newValue = { test: 'new value', number: 43 };
    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual(newValue);
  });

  it('handles function updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe(1);
  });

  it('handles invalid stored JSON', () => {
    localStorage.setItem('test-key', 'invalid json');
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('syncs between multiple hooks with same key', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('test-key', 'default'));
    const { result: result2 } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result1.current[1]('new value');
    });

    expect(result2.current[0]).toBe('new value');
  });
}); 