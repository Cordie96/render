import { useState, useCallback } from 'react';
import { useApiError } from './useApiError';
import { YouTubeVideo } from '../types';
import { searchApi } from '../services/searchApi';
import { notificationService } from '../services/notificationService';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const { handleApiError } = useApiError();

  const search = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await searchApi.searchVideos(query);
      setResults(data);
    } catch (error) {
      const err = handleApiError(error);
      notificationService.error('Failed to search videos');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, handleApiError]);

  return {
    query,
    setQuery,
    results,
    loading,
    search,
  };
} 