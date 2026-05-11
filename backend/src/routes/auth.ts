import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../config/database.js';
import { users, otpCodes, refreshTokens } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../config/jwt.js';
import { authMiddleware } from '../middleware/auth.js';
import type { SendOTPRequest, VerifyOTPRequest } from '../types/index.js';

const router = Router();

// Send OTP to phone
router.post('/send-otp', async (req: Request<{}, {}, SendOTPRequest>, res: Response) => {
  try {
    const { phone } = req.body;

    // Validate phone
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP code
    await db.insert(otpCodes).values({
      phone,
      code,
      expiresAt,
      attempts: 0,
      isUsed: false,
    });

    // TODO: Send SMS via Twilio or other SMS service
    console.log(`[OTP] Phone: ${phone}, Code: ${code}`); // For development

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('[AUTH] Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and issue JWT
router.post('/verify-otp', async (req: Request<{}, {}, VerifyOTPRequest>, res: Response) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and code are required' });
    }

    // Find valid OTP
    const otpRecord = await db
      .select()
      .from(otpCodes)
      .where(eq(otpCodes.phone, phone))
      .orderBy(otpCodes.createdAt)
      .limit(1);

    if (!otpRecord[0]) {
      return res.status(400).json({ error: 'No OTP found for this phone' });
    }

    const otp = otpRecord[0];

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Check if already used
    if (otp.isUsed) {
      return res.status(400).json({ error: 'OTP already used' });
    }

    // Check code
    if (otp.code !== code) {
      await db.update(otpCodes).set({ attempts: otp.attempts + 1 }).where(eq(otpCodes.id, otp.id));
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Mark OTP as used
    await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, otp.id));

    // Find or create user
    let user = (
      await db.select().from(users).where(eq(users.phone, phone))
    )[0];

    if (!user) {
      const result = await db
        .insert(users)
        .values({
          phone,
          displayName: null,
          role: 'user',
          isBlocked: false,
        })
        .returning();
      user = result[0];
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account is blocked' });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isRevoked: false,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AUTH] Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Check if token is revoked
    const tokenRecord = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken));

    if (!tokenRecord[0] || tokenRecord[0].isRevoked) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Get user
    const user = (
      await db.select().from(users).where(eq(users.id, payload.userId))
    )[0];

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('[AUTH] Refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = (
      await db.select().from(users).where(eq(users.id, req.user.userId))
    )[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[AUTH] Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
