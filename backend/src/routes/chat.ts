import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { chatService } from '../services/chat.js';

const router = Router();

// Get all chats accessible to user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const chats = await chatService.getAccessibleChats(req.user.userId);
    res.json({
      success: true,
      data: chats,
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
    const { limit = '50', offset = '0' } = req.query;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messages = await chatService.getMessages(
      parseInt(chatId),
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('[CHAT] Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

export default router;
