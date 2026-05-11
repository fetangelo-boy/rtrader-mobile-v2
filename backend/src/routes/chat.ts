import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all chats accessible to user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Chats endpoint - TODO',
    });
  } catch (error) {
    console.error('[CHAT] Get chats error:', error);
    res.status(500).json({ error: 'Failed to get chats' });
  }
});

// Get messages in a chat
router.get('/:chatId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    res.json({
      success: true,
      data: [],
      message: 'Messages endpoint - TODO',
    });
  } catch (error) {
    console.error('[CHAT] Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
