// User
export interface User {
  id: number;
  phone: string;
  displayName: string | null;
  role: 'user' | 'admin';
}

// Auth
export interface JWTPayload {
  userId: number;
  phone: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// Chat
export interface Chat {
  id: number;
  name: string;
  description: string | null;
  type: 'read_only' | 'mutual';
  icon: string | null;
  sortOrder: number;
}

// Message
export interface Message {
  id: number;
  chatId: number;
  userId: number;
  content: string | null;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | 'link' | null;
  replyToId: number | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subscription
export interface SubscriptionPlan {
  id: number;
  name: string;
  durationDays: number;
  price: string;
  description: string | null;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  status: 'pending' | 'verified' | 'active' | 'expired';
  expiresAt: string | null;
}
