import { PrismaClient, QueueItem } from '@prisma/client';
import { io } from '../websocket/server';
import { logger } from '../utils/logger';
import { validateYouTubeVideo } from './youtubeService';

const prisma = new PrismaClient();
const MAX_VIDEO_DURATION = 10 * 60; // 10 minutes

export async function processQueueItem(item: QueueItem) {
  try {
    // Update item status to processing
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { status: 'PLAYING' }
    });

    // Notify room participants
    io.to(`room:${item.roomId}`).emit('queue:update', {
      type: 'status_update',
      itemId: item.id,
      status: 'PLAYING'
    });

    // Validate YouTube video
    const videoDetails = await validateAndProcessVideo(item);

    // Update item with video details
    await prisma.queueItem.update({
      where: { id: item.id },
      data: {
        status: 'COMPLETED',
        title: videoDetails.title,
        duration: videoDetails.duration
      }
    });

    // Notify completion
    io.to(`room:${item.roomId}`).emit('queue:update', {
      type: 'status_update',
      itemId: item.id,
      status: 'COMPLETED',
      videoDetails
    });

  } catch (error) {
    logger.error(`Error processing queue item ${item.id}:`, error);
    
    // Update item status to error
    await prisma.queueItem.update({
      where: { id: item.id },
      data: { 
        status: 'ERROR',
        errorMessage: error.message
      }
    });

    // Notify error
    io.to(`room:${item.roomId}`).emit('queue:update', {
      type: 'error',
      itemId: item.id,
      error: error.message || 'Failed to process queue item'
    });
  }
}

async function validateAndProcessVideo(item: QueueItem) {
  const videoDetails = await validateYouTubeVideo(item.youtubeVideoId);

  if (!videoDetails.isAvailable) {
    throw new Error('Video is not available');
  }

  if (!videoDetails.isAppropriate) {
    throw new Error('Video content is not appropriate');
  }

  if (videoDetails.duration > MAX_VIDEO_DURATION) {
    throw new Error('Video exceeds maximum duration');
  }

  return videoDetails;
} 