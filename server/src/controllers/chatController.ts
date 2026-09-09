import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const { search } = req.query;
    let whereClause: any = { id: { not: req.user.id } };

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { phone: { contains: search } },
        { name: { contains: search } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
      take: 20 // limit results for search
    });
    
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

const areFriends = async (userId: string, friendId: string) => {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });
  return !!friendship;
};

export const getOrCreateRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const { partnerId } = req.body;
    if (!partnerId) return res.status(400).json({ success: false, message: 'partnerId is required.' });

    // Enforce friendship!
    const isFriend = await areFriends(req.user.id, partnerId);
    if (!isFriend) {
      return res.status(403).json({ success: false, message: 'You can only message confirmed friends.' });
    }

    // Check if room already exists
    const existingRooms = await prisma.chatRoom.findMany({
      where: {
        AND: [
          { participants: { some: { userId: req.user.id } } },
          { participants: { some: { userId: partnerId } } }
        ]
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, isOnline: true, lastSeen: true } } } }
      }
    });

    if (existingRooms.length > 0) {
      return res.json({ success: true, data: existingRooms[0] });
    }

    // Create new room
    const newRoom = await prisma.chatRoom.create({
      data: {
        participants: {
          create: [
            { userId: req.user.id },
            { userId: partnerId }
          ]
        }
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, isOnline: true, lastSeen: true } } } }
      }
    });

    return res.status(201).json({ success: true, data: newRoom });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create chat room.' });
  }
};

export const getMyRooms = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });

    const rooms = await prisma.chatRoom.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatarUrl: true, isOnline: true, lastSeen: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 } // Get last message
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json({ success: true, data: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch chat rooms.' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    const { id } = req.params;

    // Verify participation
    const participant = await prisma.chatParticipant.findUnique({
      where: { chatRoomId_userId: { chatRoomId: id, userId: req.user.id } }
    });
    if (!participant) return res.status(403).json({ success: false, message: 'Access denied.' });

    const messages = await prisma.chatMessage.findMany({
      where: { chatRoomId: id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
    });

    return res.json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    const { id } = req.params;
    const { content, mediaUrl, mediaType } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message content or media is required.' });
    }

    // Verify participation
    const participants = await prisma.chatParticipant.findMany({
      where: { chatRoomId: id }
    });
    
    const isParticipant = participants.some(p => p.userId === req.user?.id);
    if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied.' });

    // Verify friendship still exists before allowing send
    const partnerId = participants.find(p => p.userId !== req.user?.id)?.userId;
    if (partnerId) {
      const isFriend = await areFriends(req.user.id, partnerId);
      if (!isFriend) {
         return res.status(403).json({ success: false, message: 'You are no longer friends with this user.' });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId: id,
        senderId: req.user.id,
        content,
        mediaUrl,
        mediaType
      },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
    });

    // Update room updatedAt
    await prisma.chatRoom.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    // Emit via Socket.io
    const io = getIO();
    io.to(id).emit('new_message', message);
    if (partnerId) {
      // Alert the partner directly in case they are not in the room yet
      io.to(partnerId).emit('message_notification', { roomId: id, message });
    }

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};
