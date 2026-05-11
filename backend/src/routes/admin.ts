import { Router, Request, Response } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// Get pending payments for admin
router.get('/pending-payments', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [],
      message: 'Pending payments endpoint - TODO',
    });
  } catch (error) {
    console.error('[ADMIN] Get pending payments error:', error);
    res.status(500).json({ error: 'Failed to get pending payments' });
  }
});

// Verify payment (approve)
router.post('/verify-payment/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    res.json({
      success: true,
      message: 'Payment verified - TODO',
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
    res.json({
      success: true,
      message: 'Payment rejected - TODO',
    });
  } catch (error) {
    console.error('[ADMIN] Reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Get statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
      },
      message: 'Stats endpoint - TODO',
    });
  } catch (error) {
    console.error('[ADMIN] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
