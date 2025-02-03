import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addToQueue = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { youtubeVideoId, title } = req.body;

    const lastItem = await prisma.queueItem.findFirst({
      where: { roomId },
      orderBy: { position: 'desc' },
    });

    const newPosition = lastItem ? lastItem.position + 1 : 0;

    const queueItem = await prisma.queueItem.create({
      data: {
        roomId,
        youtubeVideoId,
        title,
        addedById: req.user!.id,
        position: newPosition,
        status: 'PENDING',
      },
    });

    // Emit socket event for real-time updates
    req.app.get('io').to(roomId).emit('queue-updated', {
      type: 'add',
      item: queueItem,
    });

    res.status(201).json(queueItem);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add to queue' });
  }
};

export const removeFromQueue = async (req: Request, res: Response) => {
  try {
    const { roomId, itemId } = req.params;

    await prisma.queueItem.delete({
      where: { id: itemId },
    });

    // Emit socket event for real-time updates
    req.app.get('io').to(roomId).emit('queue-updated', {
      type: 'remove',
      itemId,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: 'Failed to remove from queue' });
  }
}; 