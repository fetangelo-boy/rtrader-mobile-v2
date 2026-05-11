import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { db } from './config/database.js';
import { initializeSocket } from './socket/index.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import subscriptionRoutes from './routes/subscription.js';
import adminRoutes from './routes/admin.js';

const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:8081',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: Date.now() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Socket.io
initializeSocket(io);

// Error handling
app.use((err: any, _req: Request, res: Response) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Trading Club Backend Server Started  ║
╚════════════════════════════════════════╝
📱 API: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🗄️  Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configured'}
${process.env.NODE_ENV === 'production' ? '⚠️  Running in PRODUCTION' : '🔧 Running in DEVELOPMENT'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
});
