import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../config/jwt.js';
import type { JWTPayload } from '../types/index.js';

// Store active connections
const userConnections = new Map<number, Set<string>>();

export function initializeSocket(io: SocketIOServer) {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Missing authentication token'));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return next(new Error('Invalid token'));
    }

    // Attach user to socket
    (socket as any).user = payload;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JWTPayload;
    console.log(`[SOCKET] User ${user.userId} connected: ${socket.id}`);

    // Track user connection
    if (!userConnections.has(user.userId)) {
      userConnections.set(user.userId, new Set());
    }
    userConnections.get(user.userId)!.add(socket.id);

    // Join user's personal room for notifications
    socket.join(`user:${user.userId}`);

    // Join general broadcast room
    socket.join('broadcast');

    // Handle chat join
    socket.on('chat:join', (chatId: number) => {
      socket.join(`chat:${chatId}`);
      console.log(`[SOCKET] User ${user.userId} joined chat ${chatId}`);
    });

    // Handle chat leave
    socket.on('chat:leave', (chatId: number) => {
      socket.leave(`chat:${chatId}`);
      console.log(`[SOCKET] User ${user.userId} left chat ${chatId}`);
    });

    // Handle typing indicator
    socket.on('chat:typing', (chatId: number, isTyping: boolean) => {
      socket.to(`chat:${chatId}`).emit('user:typing', {
        userId: user.userId,
        displayName: 'User', // TODO: Get from DB
        isTyping,
        timestamp: Date.now(),
      });
    });

    // Handle message (real implementation in chat service)
    socket.on('chat:message', (data: any) => {
      console.log(`[SOCKET] Message from user ${user.userId}:`, data);
      // TODO: Save to DB and broadcast
      io.to(`chat:${data.chatId}`).emit('chat:message', {
        ...data,
        userId: user.userId,
        timestamp: Date.now(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`[SOCKET] User ${user.userId} disconnected: ${socket.id}`);
      const connections = userConnections.get(user.userId);
      if (connections) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          userConnections.delete(user.userId);
        }
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`[SOCKET] Error for user ${user.userId}:`, error);
    });
  });

  console.log('[SOCKET.IO] Initialized successfully');
}

// Helper to send notification to user
export function notifyUser(io: SocketIOServer, userId: number, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}

// Helper to broadcast to chat
export function broadcastToChat(io: SocketIOServer, chatId: number, event: string, data: any) {
  io.to(`chat:${chatId}`).emit(event, data);
}
