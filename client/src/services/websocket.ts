import { Socket } from 'socket.io-client';
import { QueueItem } from '../types';

export interface PlayerCommand {
  roomId: string;
  command: 'play' | 'pause' | 'seek';
  time?: number;
}

export interface QueueUpdate {
  type: 'add' | 'remove' | 'update' | 'reorder';
  item?: QueueItem;
  items?: QueueItem[];
}

export class WebSocketService {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  // Room events
  joinRoom(roomId: string) {
    this.socket.emit('join-room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket.emit('leave-room', roomId);
  }

  // Player commands
  sendPlayerCommand(command: PlayerCommand) {
    this.socket.emit('player-command', command);
  }

  // Queue management
  addToQueue(roomId: string, video: { youtubeVideoId: string; title: string }) {
    this.socket.emit('add-to-queue', { roomId, video });
  }

  removeFromQueue(roomId: string, itemId: string) {
    this.socket.emit('remove-from-queue', { roomId, itemId });
  }

  reorderQueue(roomId: string, startIndex: number, endIndex: number) {
    this.socket.emit('reorder-queue', { roomId, startIndex, endIndex });
  }

  // Event listeners
  onQueueUpdate(callback: (update: QueueUpdate) => void) {
    this.socket.on('queue-updated', callback);
    return () => this.socket.off('queue-updated', callback);
  }

  onPlayerCommand(callback: (command: PlayerCommand) => void) {
    this.socket.on('player-command', callback);
    return () => this.socket.off('player-command', callback);
  }

  onRoomClosed(callback: () => void) {
    this.socket.on('room-closed', callback);
    return () => this.socket.off('room-closed', callback);
  }

  onError(callback: (error: { message: string }) => void) {
    this.socket.on('error', callback);
    return () => this.socket.off('error', callback);
  }
} 