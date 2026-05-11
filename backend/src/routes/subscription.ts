import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { subscriptionService } from '../services/subscription.js';

const router = Router();

// Get subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await subscriptionService.getAllPlans();
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('[SUBSCRIPTION] Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Get user's subscription status
router.get('/my-subscription', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await subscriptionService.getUserSubscription(req.user.userId);
    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('[SUBSCRIPTION] Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Upload payment screenshot
router.post('/upload-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { planId, screenshotUrl } = req.body;

    if (!planId || !screenshotUrl) {
      return res.status(400).json({ error: 'Missing planId or screenshotUrl' });
    }

    const subscription = await subscriptionService.createPaymentRequest(
      req.user.userId,
      planId,
      screenshotUrl
    );

    res.json({
      success: true,
      data: subscription,
      message: 'Payment screenshot uploaded. Awaiting admin approval.',
    });
  } catch (error) {
    console.error('[SUBSCRIPTION] Upload payment error:', error);
    res.status(500).json({ error: 'Failed to upload payment' });
  }
});

export default router;
