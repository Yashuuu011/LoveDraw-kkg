import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

export const sendFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) return res.status(400).json({ success: false, message: 'Receiver ID is required.' });
    if (senderId === receiverId) return res.status(400).json({ success: false, message: 'You cannot send a friend request to yourself.' });

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) return res.status(404).json({ success: false, message: 'User not found.' });

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId }
        ]
      }
    });

    if (existingFriendship) {
      return res.status(400).json({ success: false, message: 'You are already friends.' });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId, status: 'PENDING' },
          { senderId: receiverId, receiverId: senderId, status: 'PENDING' }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'A pending friend request already exists between you two.' });
    }

    let request = await prisma.friendRequest.findFirst({
      where: { senderId, receiverId }
    });

    try {
      if (request) {
        request = await prisma.friendRequest.update({
          where: { id: request.id },
          data: { status: 'PENDING', createdAt: new Date() }
        });
      } else {
        request = await prisma.friendRequest.create({
          data: { senderId, receiverId }
        });
      }
    } catch (dbError: any) {
      console.error('Database Error in Friend Request:', dbError);
      return res.status(500).json({ success: false, message: 'Database failed to process the request.' });
    }

    // Notify receiver
    const senderUser = await prisma.user.findUnique({ where: { id: senderId } });
    const io = getIO();
    io.to(receiverId).emit('friend_request', {
      requestId: request.id,
      sender: {
        id: req.user.id,
        name: req.user.name,
        avatarUrl: senderUser?.avatarUrl
      }
    });

    return res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    console.error('Friend request error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to send friend request.' });
  }
};

export const getFriendRequests = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const requests = await prisma.friendRequest.findMany({
      where: { receiverId: req.user.id, status: 'PENDING' },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch friend requests.' });
  }
};

export const acceptFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const { id } = req.params;

    const request = await prisma.friendRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Friend request not found.' });

    if (request.receiverId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to accept this request.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Request is no longer pending.' });
    }

    // Update request status
    await prisma.friendRequest.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });

    // Create friendships for both directions (optional, or just one record if querying allows)
    // To keep it simple, we create 2 records so query logic is easy, or 1 and use OR. We will use 1 record and OR logic when fetching friends.
    await prisma.friendship.create({
      data: { userId: request.senderId, friendId: request.receiverId }
    });

    const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    const io = getIO();
    io.to(request.senderId).emit('friend_request_accepted', {
      friendId: req.user.id,
      name: req.user.name,
      avatarUrl: currentUser?.avatarUrl
    });

    return res.json({ success: true, message: 'Friend request accepted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to accept friend request.' });
  }
};

export const rejectFriendRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const { id } = req.params;

    const request = await prisma.friendRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Friend request not found.' });

    if (request.receiverId !== req.user.id && request.senderId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to reject or cancel this request.' });
    }

    await prisma.friendRequest.delete({
      where: { id }
    });

    return res.json({ success: true, message: 'Friend request rejected/cancelled.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to reject friend request.' });
  }
};

export const getFriends = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { friendId: req.user.id }
        ]
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, isOnline: true, lastSeen: true } },
        friend: { select: { id: true, name: true, avatarUrl: true, isOnline: true, lastSeen: true } }
      }
    });

    // Extract the actual friend from the relation
    const friends = friendships.map(f => {
      if (f.userId === req.user?.id) return f.friend;
      return f.user;
    });

    return res.json({ success: true, data: friends });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch friends.' });
  }
};

export const removeFriend = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    
    const { friendId } = req.params;

    const deleted = await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId: req.user.id, friendId },
          { userId: friendId, friendId: req.user.id }
        ]
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ success: false, message: 'Friendship not found.' });
    }

    return res.json({ success: true, message: 'Friend removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove friend.' });
  }
};
