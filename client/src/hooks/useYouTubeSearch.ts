import { useState, useCallback } from 'react';
import { YouTubeVideo, youtubeService } from '../services/youtube';
import { useError } from './useError';

export function useYouTubeSearch() {
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const { handleError } = useError();

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await youtubeService.search(query);
      setResults(response.items);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const loadMore = useCallback(async (query: string) => {
    if (!nextPageToken || !query.trim()) return;

    setLoading(true);
    try {
      const response = await youtubeService.search(query, nextPageToken);
      setResults(prev => [...prev, ...response.items]);
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [nextPageToken, handleError]);

  return {
    results,
    loading,
    hasMore: Boolean(nextPageToken),
    search,
    loadMore,
  };
} 