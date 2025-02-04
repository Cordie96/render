export interface Room {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  isActive: boolean;
  createdAt: string;
  settings?: {
    allowGuestControl: boolean;
    autoPlay: boolean;
  };
}

export interface QueueItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  addedBy: string;
  addedById: string;
  addedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string;
} 