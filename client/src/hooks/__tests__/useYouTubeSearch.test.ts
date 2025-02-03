import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useYouTubeSearch } from '../useYouTubeSearch';
import { youtubeService } from '../../services/youtube';

vi.mock('../../services/youtube', () => ({
  youtubeService: {
    search: vi.fn(),
  },
}));

describe('useYouTubeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty results', () => {
    const { result } = renderHook(() => useYouTubeSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(false);
  });

  it('handles search', async () => {
    const mockResults = {
      items: [
        { id: '1', title: 'Test Song 1' },
        { id: '2', title: 'Test Song 2' },
      ],
      nextPageToken: 'next-token',
    };

    (youtubeService.search as jest.Mock).mockResolvedValueOnce(mockResults);

    const { result } = renderHook(() => useYouTubeSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    expect(result.current.results).toEqual(mockResults.items);
    expect(result.current.hasMore).toBe(true);
    expect(youtubeService.search).toHaveBeenCalledWith('test query');
  });

  it('handles empty search query', async () => {
    const { result } = renderHook(() => useYouTubeSearch());

    await act(async () => {
      await result.current.search('');
    });

    expect(result.current.results).toEqual([]);
    expect(youtubeService.search).not.toHaveBeenCalled();
  });

  it('handles load more', async () => {
    const initialResults = {
      items: [{ id: '1', title: 'Test Song 1' }],
      nextPageToken: 'next-token',
    };

    const moreResults = {
      items: [{ id: '2', title: 'Test Song 2' }],
      nextPageToken: undefined,
    };

    (youtubeService.search as jest.Mock)
      .mockResolvedValueOnce(initialResults)
      .mockResolvedValueOnce(moreResults);

    const { result } = renderHook(() => useYouTubeSearch());

    // Initial search
    await act(async () => {
      await result.current.search('test query');
    });

    // Load more
    await act(async () => {
      await result.current.loadMore('test query');
    });

    expect(result.current.results).toEqual([
      ...initialResults.items,
      ...moreResults.items,
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it('handles search error', async () => {
    const mockError = new Error('Search failed');
    (youtubeService.search as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useYouTubeSearch());

    await act(async () => {
      await result.current.search('test query');
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
}); 