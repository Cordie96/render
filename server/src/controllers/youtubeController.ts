import { Request, Response } from 'express';
import * as youtubeService from '../services/youtubeService';

export const searchVideos = async (req: Request, res: Response) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const videos = await youtubeService.searchVideos(query);
    res.json({ items: videos });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
}; 