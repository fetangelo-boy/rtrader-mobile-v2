import { db } from '../config/database.js';
import { subscriptionPlans, userSubscriptions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export class SubscriptionService {
  async getAllPlans() {
    try {
      return await db.select().from(subscriptionPlans);
    } catch (error) {
      console.error('[SubscriptionService] Error getting plans:', error);
      throw error;
    }
  }

  async getUserSubscription(userId: number) {
    try {
      const result = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .orderBy(userSubscriptions.createdAt);

      // Return active subscription if exists
      const active = result.find((sub) => {
        if (sub.status !== 'active') return false;
        if (!sub.expiresAt) return true;
        return new Date(sub.expiresAt) > new Date();
      });

      return active || result[result.length - 1] || null;
    } catch (error) {
      console.error('[SubscriptionService] Error getting subscription:', error);
      throw error;
    }
  }

  async createPaymentRequest(
    userId: number,
    planId: number,
    screenshotUrl: string
  ) {
    try {
      const result = await db
        .insert(userSubscriptions)
        .values({
          userId,
          planId,
          status: 'pending',
          paymentScreenshotUrl: screenshotUrl,
          paymentDate: new Date(),
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('[SubscriptionService] Error creating payment request:', error);
      throw error;
    }
  }

  async getPendingPayments(limit = 50) {
    try {
      return await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.status, 'pending'))
        .limit(limit);
    } catch (error) {
      console.error('[SubscriptionService] Error getting pending payments:', error);
      throw error;
    }
  }

  async approvePayment(subscriptionId: number, adminId: number) {
    try {
      const durationDays = 30; // Default, should get from plan
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const result = await db
        .update(userSubscriptions)
        .set({
          status: 'active',
          verifiedBy: adminId,
          verifiedAt: new Date(),
          expiresAt,
        })
        .where(eq(userSubscriptions.id, subscriptionId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('[SubscriptionService] Error approving payment:', error);
      throw error;
    }
  }

  async rejectPayment(subscriptionId: number) {
    try {
      const result = await db
        .update(userSubscriptions)
        .set({ status: 'expired' })
        .where(eq(userSubscriptions.id, subscriptionId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('[SubscriptionService] Error rejecting payment:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const activeCount = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.status, 'active'));

      return {
        activeSubscriptions: activeCount.length,
        totalRevenue: '0', // TODO: Calculate from plans
      };
    } catch (error) {
      console.error('[SubscriptionService] Error getting stats:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
