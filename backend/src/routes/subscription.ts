import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Subscription plans endpoint - TODO',
    });
  } catch (error) {
    console.error('[SUBSCRIPTION] Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Get user's subscription status
router.get('/my-subscription', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: null,
      message: 'User subscription endpoint - TODO',
    });
  } catch (error) {
    console.error('[SUBSCRIPTION] Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Upload payment screenshot
router.post('/upload-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      message: 'Payment upload endpoint - TODO',
    });
  } catch (error) {
    console.error('[SUBSCRIPTION] Upload payment error:', error);
    res.status(500).json({ error: 'Failed to upload payment' });
  }
});

export default router;
