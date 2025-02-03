import { youtubeApi } from '../utils/api';

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelTitle: string;
}

export interface SearchResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

class YouTubeService {
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    const parts = [];
    if (hours) parts.push(hours.padStart(2, '0'));
    parts.push(minutes ? minutes.padStart(2, '0') : '00');
    parts.push(seconds ? seconds.padStart(2, '0') : '00');

    return parts.join(':');
  }

  private transformVideoData(item: any): YouTubeVideo {
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      duration: this.formatDuration(item.contentDetails?.duration || ''),
      channelTitle: item.snippet.channelTitle,
    };
  }

  async search(query: string, pageToken?: string): Promise<SearchResponse> {
    try {
      const { data } = await youtubeApi.search(query);
      return {
        items: data.items.map(this.transformVideoData),
        nextPageToken: data.nextPageToken,
      };
    } catch (error) {
      console.error('YouTube search failed:', error);
      throw new Error('Failed to search YouTube videos');
    }
  }
}

export const youtubeService = new YouTubeService(); 