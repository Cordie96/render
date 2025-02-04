import axios from 'axios';
import { logger } from '../utils/logger';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const MAX_VIDEO_DURATION = 10 * 60; // 10 minutes in seconds

interface YouTubeVideoDetails {
  id: string;
  title: string;
  duration: number;
  isAvailable: boolean;
  isAppropriate: boolean;
}

export async function validateYouTubeVideo(videoId: string): Promise<YouTubeVideoDetails> {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'contentDetails,status,snippet',
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    if (!response.data.items?.length) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const duration = parseDuration(video.contentDetails.duration);

    // Check if video is available and appropriate
    const isAvailable = video.status.uploadStatus === 'processed' 
      && !video.status.privacyStatus === 'private';
    
    const isAppropriate = !video.contentDetails.contentRating 
      && video.status.embeddable;

    return {
      id: videoId,
      title: video.snippet.title,
      duration,
      isAvailable,
      isAppropriate
    };
  } catch (error) {
    logger.error('YouTube API error:', error);
    throw new Error('Failed to validate YouTube video');
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0') * 3600;
  const minutes = parseInt(match[2] || '0') * 60;
  const seconds = parseInt(match[3] || '0');

  return hours + minutes + seconds;
}

export const searchVideos = async (query: string) => {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query + ' karaoke',
        type: 'video',
        videoCategoryId: '10', // Music category
        key: process.env.YOUTUBE_API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));
  } catch (error) {
    console.error('YouTube API Error:', error);
    throw new Error('Failed to search videos');
  }
}; 