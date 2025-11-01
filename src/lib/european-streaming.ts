import { Server } from 'socket.io';
import { EuropeanMarketData, EuropeanMarketIndex } from './european-market-data';

export interface StreamingMarketUpdate {
  marketId: string;
  timestamp: string;
  data: {
    index?: number;
    change?: number;
    changePercent?: number;
    volume?: number;
    stocks?: EuropeanMarketData[];
  };
}

export interface StreamingStockUpdate {
  symbol: string;
  marketId: string;
  timestamp: string;
  data: {
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  };
}

export class EuropeanMarketStreamingService {
  private io: Server;
  private updateIntervals: {[key: string]: NodeJS.Timeout} = {};
  private subscribedClients: Set<string> = new Set();

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected to European markets: ${socket.id}`);

      // Handle market subscriptions
      socket.on('subscribe_european_market', (marketId: string) => {
        this.subscribeToMarket(socket, marketId);
      });

      socket.on('unsubscribe_european_market', (marketId: string) => {
        this.unsubscribeFromMarket(socket, marketId);
      });

      socket.on('subscribe_all_european_markets', () => {
        this.subscribeToAllMarkets(socket);
      });

      socket.on('unsubscribe_all_european_markets', () => {
        this.unsubscribeFromAllMarkets(socket);
      });

      // Handle stock subscriptions
      socket.on('subscribe_european_stock', (data: {symbol: string, marketId: string}) => {
        this.subscribeToStock(socket, data.symbol, data.marketId);
      });

      socket.on('unsubscribe_european_stock', (data: {symbol: string, marketId: string}) => {
        this.unsubscribeFromStock(socket, data.symbol, data.marketId);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected from European markets: ${socket.id}`);
        this.subscribedClients.delete(socket.id);
      });
    });
  }

  private subscribeToMarket(socket: any, marketId: string) {
    socket.join(`european_market_${marketId}`);
    this.subscribedClients.add(socket.id);
    console.log(`Client ${socket.id} subscribed to European market: ${marketId}`);

    // Start streaming if not already started
    if (!this.updateIntervals[marketId]) {
      this.startMarketStreaming(marketId);
    }

    // Send initial data
    this.sendInitialMarketData(socket, marketId);
  }

  private unsubscribeFromMarket(socket: any, marketId: string) {
    socket.leave(`european_market_${marketId}`);
    console.log(`Client ${socket.id} unsubscribed from European market: ${marketId}`);

    // Stop streaming if no more subscribers
    const roomClients = this.io.sockets.adapter.rooms.get(`european_market_${marketId}`);
    if (!roomClients || roomClients.size === 0) {
      this.stopMarketStreaming(marketId);
    }
  }

  private subscribeToAllMarkets(socket: any) {
    const europeanMarkets = ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo'];
    europeanMarkets.forEach(marketId => {
      this.subscribeToMarket(socket, marketId);
    });
  }

  private unsubscribeFromAllMarkets(socket: any) {
    const europeanMarkets = ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo'];
    europeanMarkets.forEach(marketId => {
      this.unsubscribeFromMarket(socket, marketId);
    });
  }

  private subscribeToStock(socket: any, symbol: string, marketId: string) {
    socket.join(`european_stock_${symbol}_${marketId}`);
    console.log(`Client ${socket.id} subscribed to European stock: ${symbol}`);

    // Start stock streaming if not already started
    const stockKey = `${symbol}_${marketId}`;
    if (!this.updateIntervals[stockKey]) {
      this.startStockStreaming(symbol, marketId);
    }

    // Send initial stock data
    this.sendInitialStockData(socket, symbol, marketId);
  }

  private unsubscribeFromStock(socket: any, symbol: string, marketId: string) {
    socket.leave(`european_stock_${symbol}_${marketId}`);
    console.log(`Client ${socket.id} unsubscribed from European stock: ${symbol}`);

    // Stop streaming if no more subscribers
    const roomClients = this.io.sockets.adapter.rooms.get(`european_stock_${symbol}_${marketId}`);
    if (!roomClients || roomClients.size === 0) {
      this.stopStockStreaming(symbol, marketId);
    }
  }

  private startMarketStreaming(marketId: string) {
    console.log(`Starting market streaming for: ${marketId}`);
    
    this.updateIntervals[marketId] = setInterval(() => {
      const update = this.generateMarketUpdate(marketId);
      this.io.to(`european_market_${marketId}`).emit('market_update', update);
    }, 3000); // Update every 3 seconds
  }

  private stopMarketStreaming(marketId: string) {
    if (this.updateIntervals[marketId]) {
      clearInterval(this.updateIntervals[marketId]);
      delete this.updateIntervals[marketId];
      console.log(`Stopped market streaming for: ${marketId}`);
    }
  }

  private startStockStreaming(symbol: string, marketId: string) {
    const stockKey = `${symbol}_${marketId}`;
    console.log(`Starting stock streaming for: ${stockKey}`);
    
    this.updateIntervals[stockKey] = setInterval(() => {
      const update = this.generateStockUpdate(symbol, marketId);
      this.io.to(`european_stock_${symbol}_${marketId}`).emit('stock_update', update);
    }, 2000); // Update every 2 seconds
  }

  private stopStockStreaming(symbol: string, marketId: string) {
    const stockKey = `${symbol}_${marketId}`;
    if (this.updateIntervals[stockKey]) {
      clearInterval(this.updateIntervals[stockKey]);
      delete this.updateIntervals[stockKey];
      console.log(`Stopped stock streaming for: ${stockKey}`);
    }
  }

  private generateMarketUpdate(marketId: string): StreamingMarketUpdate {
    const baseValues: {[key: string]: {index: number, volatility: number}} = {
      'london': { index: 7543.21, volatility: 0.015 },
      'euronext': { index: 8234.56, volatility: 0.016 },
      'xetra': { index: 16876.43, volatility: 0.014 },
      'six': { index: 11234.78, volatility: 0.013 },
      'bme': { index: 9876.54, volatility: 0.018 },
      'nasdaq-nordic': { index: 2345.67, volatility: 0.017 },
      'oslo': { index: 1234.56, volatility: 0.019 }
    };

    const base = baseValues[marketId];
    if (!base) {
      throw new Error(`Unknown market: ${marketId}`);
    }

    const change = (Math.random() - 0.5) * base.index * base.volatility;
    const changePercent = (change / base.index) * 100;
    const volume = Math.floor(Math.random() * 1000000000);

    return {
      marketId,
      timestamp: new Date().toISOString(),
      data: {
        index: base.index + change,
        change,
        changePercent,
        volume
      }
    };
  }

  private generateStockUpdate(symbol: string, marketId: string): StreamingStockUpdate {
    const basePrice = Math.random() * 1000 + 100;
    const change = (Math.random() - 0.5) * basePrice * 0.02; // 2% volatility
    const changePercent = (change / basePrice) * 100;
    const volume = Math.floor(Math.random() * 1000000);

    return {
      symbol,
      marketId,
      timestamp: new Date().toISOString(),
      data: {
        price: basePrice + change,
        change,
        changePercent,
        volume
      }
    };
  }

  private async sendInitialMarketData(socket: any, marketId: string) {
    try {
      // Simulate fetching initial market data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const initialUpdate = this.generateMarketUpdate(marketId);
      socket.emit('initial_market_data', {
        marketId,
        data: initialUpdate.data,
        timestamp: initialUpdate.timestamp
      });
    } catch (error) {
      console.error(`Error sending initial market data for ${marketId}:`, error);
    }
  }

  private async sendInitialStockData(socket: any, symbol: string, marketId: string) {
    try {
      // Simulate fetching initial stock data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const initialUpdate = this.generateStockUpdate(symbol, marketId);
      socket.emit('initial_stock_data', {
        symbol,
        marketId,
        data: initialUpdate.data,
        timestamp: initialUpdate.timestamp
      });
    } catch (error) {
      console.error(`Error sending initial stock data for ${symbol}:`, error);
    }
  }

  // Public methods for external control
  public getActiveSubscriptions(): {[key: string]: number} {
    const subscriptions: {[key: string]: number} = {};
    
    Object.keys(this.updateIntervals).forEach(key => {
      const roomClients = this.io.sockets.adapter.rooms.get(
        key.includes('_') ? `european_stock_${key}` : `european_market_${key}`
      );
      subscriptions[key] = roomClients ? roomClients.size : 0;
    });

    return subscriptions;
  }

  public getSubscriberCount(): number {
    return this.subscribedClients.size;
  }

  public stopAllStreaming() {
    Object.keys(this.updateIntervals).forEach(key => {
      clearInterval(this.updateIntervals[key]);
    });
    this.updateIntervals = {};
    console.log('Stopped all European market streaming');
  }

  // Broadcast market-wide events
  public broadcastMarketAlert(marketId: string, alert: {
    type: 'info' | 'warning' | 'error';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }) {
    this.io.to(`european_market_${marketId}`).emit('market_alert', {
      marketId,
      alert,
      timestamp: new Date().toISOString()
    });
  }

  public broadcastSystemAlert(alert: {
    type: 'info' | 'warning' | 'error';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }) {
    this.io.emit('system_alert', {
      alert,
      timestamp: new Date().toISOString()
    });
  }
}

// Factory function to create and configure the service
export function createEuropeanMarketStreamingService(io: Server): EuropeanMarketStreamingService {
  return new EuropeanMarketStreamingService(io);
}