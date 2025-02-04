import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { validateYouTubeVideo } from '../services/youtubeService';
import { logger } from '../utils/logger';

// Mock axios and logger
vi.mock('axios');
vi.mock('../utils/logger');

describe('youtubeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateYouTubeVideo', () => {
    const mockVideoId = 'test123';
    const mockValidResponse = {
      data: {
        items: [{
          id: mockVideoId,
          snippet: {
            title: 'Test Video'
          },
          contentDetails: {
            duration: 'PT5M30S',
            contentRating: {}
          },
          status: {
            uploadStatus: 'processed',
            privacyStatus: 'public',
            embeddable: true
          }
        }]
      }
    };

    it('successfully validates an appropriate video', async () => {
      (axios.get as any).mockResolvedValueOnce(mockValidResponse);

      const result = await validateYouTubeVideo(mockVideoId);

      expect(result).toEqual({
        id: mockVideoId,
        title: 'Test Video',
        duration: 330, // 5m30s in seconds
        isAvailable: true,
        isAppropriate: true
      });
    });

    it('throws error when video is not found', async () => {
      (axios.get as any).mockResolvedValueOnce({ data: { items: [] } });

      await expect(validateYouTubeVideo(mockVideoId))
        .rejects
        .toThrow('Video not found');
    });

    it('marks video as inappropriate when not embeddable', async () => {
      const response = {
        ...mockValidResponse,
        data: {
          items: [{
            ...mockValidResponse.data.items[0],
            status: { ...mockValidResponse.data.items[0].status, embeddable: false }
          }]
        }
      };
      
      (axios.get as any).mockResolvedValueOnce(response);

      const result = await validateYouTubeVideo(mockVideoId);
      expect(result.isAppropriate).toBe(false);
    });

    it('handles API errors gracefully', async () => {
      (axios.get as any).mockRejectedValueOnce(new Error('API Error'));
      (logger.error as any).mockImplementation(() => {});

      await expect(validateYouTubeVideo(mockVideoId))
        .rejects
        .toThrow('Failed to validate YouTube video');
      
      expect(logger.error).toHaveBeenCalled();
    });
  });
}); 