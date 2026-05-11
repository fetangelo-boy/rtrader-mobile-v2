import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'ws://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  async connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) {
      console.warn('No auth token, cannot connect to socket');
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id);
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      this.emit('disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
      this.emit('error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Chat events
  joinChat(chatId: number) {
    this.socket?.emit('chat:join', chatId);
  }

  leaveChat(chatId: number) {
    this.socket?.emit('chat:leave', chatId);
  }

  sendMessage(chatId: number, content: string, mediaUrl?: string) {
    this.socket?.emit('chat:message', {
      chatId,
      content,
      mediaUrl,
      mediaType: mediaUrl ? 'link' : null,
    });
  }

  setTyping(chatId: number, isTyping: boolean) {
    this.socket?.emit('chat:typing', chatId, isTyping);
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

export const socketService = new SocketService();
