import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true
    }
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lovedraw_secret_key_romantic_2026_super_secure') as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      
      if (!user) return next(new Error('User not found'));

      // Attach user info to socket
      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${userId}`);

    // Mark user as online
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true }
    });

    // Join personal room for private notifications
    socket.join(userId);

    // Broadcast online status to friends
    socket.broadcast.emit('user_online', { userId });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('typing', ({ roomId, receiverId }) => {
      socket.to(roomId).emit('typing', { userId, roomId });
    });

    socket.on('stop_typing', ({ roomId, receiverId }) => {
      socket.to(roomId).emit('stop_typing', { userId, roomId });
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      
      // Check if user has other active sockets before marking offline
      const sockets = await io.in(userId).fetchSockets();
      if (sockets.length === 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeen: new Date() }
        });
        socket.broadcast.emit('user_offline', { userId, lastSeen: new Date() });
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
