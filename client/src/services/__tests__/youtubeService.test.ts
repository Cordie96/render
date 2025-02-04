import { youtubeService } from '../youtubeService';
import api from '../api';
import { vi } from 'vitest';

// Mock the API client
vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('youtubeService', () => {
  const mockApiResponse = {
    data: {
      items: [
        {
          id: { videoId: 'video1' },
          snippet: {
            title: 'Test Video 1',
            channelTitle: 'Test Channel 1',
            thumbnails: {
              medium: {
                url: 'https://example.com/thumb1.jpg',
              },
            },
          },
          contentDetails: {
            duration: 'PT3M45S',
          },
        },
        {
          id: { videoId: 'video2' },
          snippet: {
            title: 'Test Video 2',
            channelTitle: 'Test Channel 2',
            thumbnails: {
              medium: {
                url: 'https://example.com/thumb2.jpg',
              },
            },
          },
          contentDetails: {
            duration: 'PT4M20S',
          },
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue(mockApiResponse);
  });

  describe('search', () => {
    it('returns formatted search results', async () => {
      const results = await youtubeService.search('test query');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'video1',
        title: 'Test Video 1',
        channelTitle: 'Test Channel 1',
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        duration: '3:45',
      });
    });

    it('handles empty response', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { items: [] } });

      const results = await youtubeService.search('test query');

      expect(results).toHaveLength(0);
    });

    it('handles API errors', async () => {
      const error = new Error('API error');
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(youtubeService.search('test query')).rejects.toThrow('API error');
    });

    it('formats duration correctly', async () => {
      const results = await youtubeService.search('test query');

      expect(results[0].duration).toBe('3:45');
      expect(results[1].duration).toBe('4:20');
    });
  });
}); 