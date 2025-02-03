export interface QueueItem {
  id: string;
  roomId: string;
  youtubeVideoId: string;
  title: string;
  addedById: string;
  position: number;
  status: 'pending' | 'playing' | 'completed';
  addedAt: string;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  isActive: boolean;
  createdAt: string;
  lastActive: string;
} 