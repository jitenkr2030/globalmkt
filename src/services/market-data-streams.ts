export interface MarketStreamConfig {
  market: string;
  symbols: string[];
  interval: number;
  enabled: boolean;
}

export interface StreamData {
  market: string;
  symbol?: string;
  data: any;
  timestamp: string;
}

export class MarketDataStreams {
  private streams: Map<string, MarketStreamConfig> = new Map();
  private callbacks: Map<string, ((data: StreamData) => void)[]> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeDefaultStreams();
  }

  private initializeDefaultStreams() {
    // Initialize default market streams
    const defaultMarkets = ['india', 'nepal', 'japan', 'china', 'hongkong', 'singapore', 'korea'];
    
    defaultMarkets.forEach(market => {
      this.createStream({
        market,
        symbols: this.getDefaultSymbols(market),
        interval: 5000, // 5 seconds
        enabled: true
      });
    });
  }

  private getDefaultSymbols(market: string): string[] {
    const symbolMap: Record<string, string[]> = {
      india: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'],
      nepal: ['NABIL', 'NICA', 'EBL', 'NBL', 'SANIMA'],
      japan: ['7203', '9984', '6758', '4502', '8306'],
      china: ['000001', '000002', '600036', '600519', '000858'],
      hongkong: ['00700', '005', '0941', '1299', '0883'],
      singapore: ['D05', 'O39', 'U11', 'Z74', 'C07'],
      korea: ['005930', '000660', '207940', '005490', '068270']
    };

    return symbolMap[market] || [];
  }

  createStream(config: MarketStreamConfig): void {
    const streamId = `${config.market}-${config.symbols.join('-')}`;
    
    this.streams.set(streamId, config);
    this.callbacks.set(streamId, []);

    if (config.enabled) {
      this.startStream(streamId);
    }

    console.log(`Created market data stream: ${streamId}`);
  }

  startStream(streamId: string): void {
    const config = this.streams.get(streamId);
    if (!config) {
      console.error(`Stream configuration not found: ${streamId}`);
      return;
    }

    if (this.intervals.has(streamId)) {
      console.log(`Stream already running: ${streamId}`);
      return;
    }

    const interval = setInterval(() => {
      this.generateStreamData(streamId, config);
    }, config.interval);

    this.intervals.set(streamId, interval);
    console.log(`Started market data stream: ${streamId}`);
  }

  stopStream(streamId: string): void {
    const interval = this.intervals.get(streamId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(streamId);
      console.log(`Stopped market data stream: ${streamId}`);
    }
  }

  private generateStreamData(streamId: string, config: MarketStreamConfig): void {
    const callbacks = this.callbacks.get(streamId) || [];
    
    if (callbacks.length === 0) return;

    // Generate market-level data
    const marketData = this.generateMarketData(config.market);
    
    // Generate stock-level data for each symbol
    config.symbols.forEach(symbol => {
      const stockData = this.generateStockData(config.market, symbol);
      
      const streamData: StreamData = {
        market: config.market,
        symbol,
        data: {
          ...marketData,
          ...stockData
        },
        timestamp: new Date().toISOString()
      };

      callbacks.forEach(callback => {
        try {
          callback(streamData);
        } catch (error) {
          console.error(`Error in stream callback for ${streamId}:`, error);
        }
      });
    });
  }

  private generateMarketData(market: string) {
    const baseData: Record<string, any> = {
      india: { index: 19456.78, volume: 450000000, status: 'open' },
      nepal: { index: 2184.52, volume: 12500000, status: 'open' },
      japan: { index: 32847.23, volume: 2500000000, status: 'closed' },
      china: { index: 3087.45, volume: 3200000000, status: 'closed' },
      hongkong: { index: 17892.34, volume: 1800000000, status: 'closed' },
      singapore: { index: 3234.56, volume: 850000000, status: 'closed' },
      korea: { index: 2456.78, volume: 1200000000, status: 'closed' }
    };

    const data = baseData[market] || { index: 1000, volume: 1000000, status: 'closed' };
    
    // Add random variations
    const variation = (Math.random() - 0.5) * 0.02;
    const newChange = (Math.random() - 0.5) * 20;
    const newChangePercent = (newChange / (data.index - newChange)) * 100;

    return {
      ...data,
      change: newChange,
      changePercent: newChangePercent,
      volume: data.volume + Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString()
    };
  }

  private generateStockData(market: string, symbol: string) {
    const basePrices: Record<string, Record<string, number>> = {
      india: { 'RELIANCE': 2456.78, 'TCS': 3845.20, 'HDFCBANK': 1567.89, 'INFY': 1456.78, 'ICICIBANK': 987.65 },
      nepal: { 'NABIL': 845.50, 'NICA': 678.25, 'EBL': 432.10, 'NBL': 567.89, 'SANIMA': 345.67 },
      japan: { '7203': 2456.78, '9984': 5678.90, '6758': 3456.78, '4502': 1234.56, '8306': 2345.67 },
      china: { '000001': 12.34, '000002': 18.90, '600036': 34.56, '600519': 456.78, '000858': 23.45 },
      hongkong: { '00700': 368.20, '005': 45.67, '0941': 234.56, '1299': 123.45, '0883': 67.89 },
      singapore: { 'D05': 32.45, 'O39': 12.89, 'U11': 23.45, 'Z74': 34.56, 'C07': 45.67 },
      korea: { '005930': 68450.00, '000660': 145600.00, '207940': 89000.00, '005490': 45600.00, '068270': 234000.00 }
    };

    const basePrice = basePrices[market]?.[symbol] || 100;
    const change = (Math.random() - 0.5) * basePrice * 0.05;
    const changePercent = (change / basePrice) * 100;

    return {
      price: basePrice + change,
      change: change,
      changePercent: changePercent,
      volume: Math.floor(Math.random() * 1000000) + 10000
    };
  }

  subscribe(streamId: string, callback: (data: StreamData) => void): () => void {
    if (!this.callbacks.has(streamId)) {
      this.callbacks.set(streamId, []);
    }

    const callbacks = this.callbacks.get(streamId)!;
    callbacks.push(callback);

    console.log(`Subscribed to stream: ${streamId}`);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(streamId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
      console.log(`Unsubscribed from stream: ${streamId}`);
    };
  }

  getStreamStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    
    this.streams.forEach((config, streamId) => {
      status[streamId] = {
        ...config,
        running: this.intervals.has(streamId),
        subscribers: this.callbacks.get(streamId)?.length || 0
      };
    });

    return status;
  }

  updateStreamConfig(streamId: string, updates: Partial<MarketStreamConfig>): void {
    const config = this.streams.get(streamId);
    if (!config) {
      console.error(`Stream not found: ${streamId}`);
      return;
    }

    const updatedConfig = { ...config, ...updates };
    this.streams.set(streamId, updatedConfig);

    // Restart stream if interval changed
    if (updates.interval !== undefined && updates.interval !== config.interval) {
      this.stopStream(streamId);
      if (updatedConfig.enabled) {
        this.startStream(streamId);
      }
    }

    // Start/stop stream if enabled status changed
    if (updates.enabled !== undefined && updates.enabled !== config.enabled) {
      if (updates.enabled) {
        this.startStream(streamId);
      } else {
        this.stopStream(streamId);
      }
    }

    console.log(`Updated stream config: ${streamId}`, updatedConfig);
  }

  removeStream(streamId: string): void {
    this.stopStream(streamId);
    this.streams.delete(streamId);
    this.callbacks.delete(streamId);
    console.log(`Removed stream: ${streamId}`);
  }

  getAllStreams(): MarketStreamConfig[] {
    return Array.from(this.streams.values());
  }

  getMarketStreams(market: string): MarketStreamConfig[] {
    return Array.from(this.streams.values()).filter(stream => stream.market === market);
  }
}

// Singleton instance
export const marketDataStreams = new MarketDataStreams();