export interface RoomSettings {
  name: string;
  isPrivate: boolean;
  maxParticipants?: number;
  allowGuestControl: boolean;
}

export interface RoomParticipant {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
}

export interface Room {
  id: string;
  settings: RoomSettings;
  participants: RoomParticipant[];
  currentItem?: QueueItem;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  id: string;
  youtubeVideoId: string;
  title: string;
  addedById: string;
  addedAt: string;
} 