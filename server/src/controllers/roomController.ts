import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name = `Room ${nanoid(6)}` } = req.body;
    const userId = req.user!.id;

    const room = await prisma.room.create({
      data: {
        name,
        hostId: userId,
        isActive: true,
        participants: {
          create: {
            userId,
            role: 'HOST',
          },
        },
      },
      include: {
        participants: true,
        host: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
};

export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
        participants: {
          some: {
            userId: req.user!.id,
          },
        },
      },
      include: {
        host: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        lastActive: 'desc',
      },
    });

    res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
};

export const closeRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.user!.id;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { hostId: true },
    });

    if (!room || room.hostId !== userId) {
      return res.status(403).json({ error: 'Not authorized to close room' });
    }

    await prisma.room.update({
      where: { id: roomId },
      data: { isActive: false },
    });

    // Notify all participants
    req.app.get('io').to(roomId).emit('room-closed');

    res.json({ success: true });
  } catch (error) {
    console.error('Close room error:', error);
    res.status(500).json({ error: 'Failed to close room' });
  }
};

export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room || !room.isActive) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const participant = await prisma.roomParticipant.create({
      data: {
        roomId,
        userId: req.user!.id,
        role: 'VIEWER',
      },
    });

    res.status(200).json(participant);
  } catch (error) {
    res.status(400).json({ error: 'Failed to join room' });
  }
}; 