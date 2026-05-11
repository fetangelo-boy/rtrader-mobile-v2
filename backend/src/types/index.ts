// JWT Payload
export interface JWTPayload {
  userId: number;
  phone: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

// API Response
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Request/Response
export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyOTPRequest {
  phone: string;
  code: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    phone: string;
    displayName: string | null;
    role: 'user' | 'admin';
  };
}

// Subscription
export interface CreateSubscriptionPaymentRequest {
  planId: number;
  screenshotUrl: string;
}

export interface AdminVerifyPaymentRequest {
  subscriptionId: number;
  approve: boolean;
}

// Socket Events
export interface SocketMessage {
  chatId: number;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'link';
  replyToId?: number;
}

export interface SocketTyping {
  chatId: number;
  isTyping: boolean;
}
