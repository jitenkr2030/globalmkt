// Client-side Socket.IO setup for Vercel deployment
import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;

  connect() {
    if (typeof window === 'undefined') return null;

    // Ensure socket connection is established
    fetch('/api/socketio').catch(() => {
      console.log('Socket.IO server initialization failed, continuing anyway...');
    });

    this.socket = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    if (!this.socket && typeof window !== 'undefined') {
      return this.connect();
    }
    return this.socket;
  }

  // Market data subscription
  subscribeToMarketData(symbols: string[], callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribe-market-data', symbols);
      socket.on('market-data-update', callback);
    }
  }

  // Trading signals subscription
  subscribeToTradingSignals(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribe-trading-signals');
      socket.on('trading-signal', callback);
    }
  }

  // Portfolio updates subscription
  subscribeToPortfolioUpdates(callback: (data: any) => void) {
    const socket = this.getSocket();
    if (socket) {
      socket.emit('subscribe-portfolio');
      socket.on('portfolio-update', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager();

// Client-side hook for using socket
export const useSocket = () => {
  if (typeof window !== 'undefined') {
    return socketManager.getSocket();
  }
  return null;
};

// Initialize socket connection
export const initializeSocket = () => {
  return socketManager.connect();
};

// Disconnect socket
export const disconnectSocket = () => {
  socketManager.disconnect();
};