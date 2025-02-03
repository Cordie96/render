import axios from 'axios';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

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