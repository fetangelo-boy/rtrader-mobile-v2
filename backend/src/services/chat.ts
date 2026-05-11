import { db } from '../config/database.js';
import { chats, messages, chatParticipants } from '../db/schema.js';
import { eq, and, desc, gt } from 'drizzle-orm';

export class ChatService {
  async getAccessibleChats(userId: number) {
    try {
      // Get all chats user has access to
      // For now, return all chats (can add subscription checks later)
      return await db.select().from(chats).orderBy(chats.sortOrder);
    } catch (error) {
      console.error('[ChatService] Error getting chats:', error);
      throw error;
    }
  }

  async getMessages(chatId: number, limit = 50, offset = 0) {
    try {
      const result = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.createdAt))
        .limit(limit)
        .offset(offset);

      return result.reverse();
    } catch (error) {
      console.error('[ChatService] Error getting messages:', error);
      throw error;
    }
  }

  async saveMessage(chatId: number, userId: number, content: string, mediaUrl?: string) {
    try {
      const result = await db
        .insert(messages)
        .values({
          chatId,
          userId,
          content: content || null,
          mediaUrl: mediaUrl || null,
          mediaType: mediaUrl ? 'link' : null,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('[ChatService] Error saving message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: number, userId: number) {
    try {
      const msg = await db
        .select()
        .from(messages)
        .where(eq(messages.id, messageId));

      if (!msg[0]) {
        throw new Error('Message not found');
      }

      if (msg[0].userId !== userId) {
        throw new Error('Unauthorized');
      }

      await db.update(messages).set({ isDeleted: true }).where(eq(messages.id, messageId));
    } catch (error) {
      console.error('[ChatService] Error deleting message:', error);
      throw error;
    }
  }

  async addChatParticipant(chatId: number, userId: number) {
    try {
      const existing = await db
        .select()
        .from(chatParticipants)
        .where(and(eq(chatParticipants.chatId, chatId), eq(chatParticipants.userId, userId)));

      if (existing.length > 0) {
        return existing[0];
      }

      const result = await db
        .insert(chatParticipants)
        .values({
          chatId,
          userId,
          role: 'participant',
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error('[ChatService] Error adding participant:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
