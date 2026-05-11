import { Router, Request, Response } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { subscriptionService } from '../services/subscription.js';
import { db } from '../config/database.js';
import { users } from '../db/schema.js';

const router = Router();

// Get pending payments for admin
router.get('/pending-payments', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const payments = await subscriptionService.getPendingPayments();
    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('[ADMIN] Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to get pending payments' });
  }
});

// Verify payment (approve)
router.post('/verify-payment/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const subscription = await subscriptionService.approvePayment(parseInt(id), req.user.userId);

    res.json({
      success: true,
      data: subscription,
      message: 'Payment approved',
    });
  } catch (error) {
    console.error('[ADMIN] Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Reject payment
router.post('/reject-payment/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.rejectPayment(parseInt(id));

    res.json({
      success: true,
      data: subscription,
      message: 'Payment rejected',
    });
  } catch (error) {
    console.error('[ADMIN] Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Get statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);
    const stats = await subscriptionService.getStats();

    res.json({
      success: true,
      data: {
        totalUsers: allUsers.length,
        activeSubscriptions: stats.activeSubscriptions,
        totalRevenue: stats.totalRevenue,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
