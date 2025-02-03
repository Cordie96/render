import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { socketAuth } from '../middleware/socketAuth';

const prisma = new PrismaClient();

interface PlayerState {
  currentTime: number;
  state: number;
  videoId: string;
}

export function setupWebSocketHandlers(io: Server) {
  // Add authentication middleware
  io.use(socketAuth);

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.id;
    console.log(`User ${userId} connected`);

    socket.on('join-room', async (roomId: string) => {
      try {
        // Check if user is allowed to join room
        const participant = await prisma.roomParticipant.findFirst({
          where: {
            roomId,
            userId,
          },
        });

        if (!participant) {
          throw new Error('Not authorized to join room');
        }

        socket.join(roomId);
        console.log(`User ${userId} joined room: ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leave-room', async (roomId: string) => {
      try {
        socket.leave(roomId);
        
        // Remove participant from room
        await prisma.roomParticipant.deleteMany({
          where: {
            roomId,
            userId: socket.data.user.id,
          },
        });

        // Check if room is empty
        const participants = await prisma.roomParticipant.count({
          where: { roomId },
        });

        if (participants === 0) {
          await prisma.room.update({
            where: { id: roomId },
            data: { isActive: false },
          });
        }

        console.log(`User ${socket.data.user.id} left room: ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    socket.on('player-command', ({ roomId, command }) => {
      io.to(roomId).emit('player-command', command);
    });

    socket.on('player-state-request', () => {
      socket.broadcast.to(Array.from(socket.rooms)[1]).emit('player-state-request');
    });

    socket.on('player-state-response', (state: PlayerState) => {
      socket.broadcast.to(Array.from(socket.rooms)[1]).emit('player-state-sync', state);
    });

    socket.on('player-state-sync', (state: PlayerState) => {
      socket.broadcast.to(Array.from(socket.rooms)[1]).emit('player-state-sync', state);
    });

    socket.on('update-queue-item', async ({ roomId, itemId, status }) => {
      try {
        const updatedItem = await prisma.queueItem.update({
          where: { id: itemId },
          data: { status },
        });

        io.to(roomId).emit('queue-updated', {
          type: 'update',
          item: updatedItem,
        });

        if (status === 'COMPLETED') {
          // Get next item in queue
          const nextItem = await prisma.queueItem.findFirst({
            where: {
              roomId,
              status: 'PENDING',
            },
            orderBy: {
              position: 'asc',
            },
          });

          if (nextItem) {
            io.to(roomId).emit('queue-updated', {
              type: 'next',
              item: nextItem,
            });
          }
        }
      } catch (error) {
        console.error('Error updating queue item:', error);
      }
    });

    socket.on('room-activity', async ({ roomId }) => {
      try {
        await prisma.room.update({
          where: { id: roomId },
          data: { lastActive: new Date() },
        });
      } catch (error) {
        console.error('Error updating room activity:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
} 