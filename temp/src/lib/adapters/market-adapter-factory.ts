import { MarketConfig, getMarketConfig } from '../market-config';
import { NepalMarketAdapter } from './nepal-market-adapter';

export interface BaseMarketAdapter {
  fetchStockData(symbol: string): Promise<any>;
  fetchTechnicalIndicators(symbol: string): Promise<any>;
  fetchFundamentalData(symbol: string): Promise<any>;
  fetchMarketOverview(): Promise<any>;
}

export class MarketAdapterFactory {
  private static adapters: Map<string, BaseMarketAdapter> = new Map();
  private static rateLimiters: Map<string, { lastCall: number; calls: number }> = new Map();

  static async createAdapter(marketId: string): Promise<BaseMarketAdapter> {
    const config = getMarketConfig(marketId);
    if (!config) {
      throw new Error(\`Market configuration not found for: \${marketId}\`);
    }

    // Check rate limiting
    this.checkRateLimit(marketId, config);

    // Create adapter based on market type
    let adapter: BaseMarketAdapter;
    
    switch (marketId) {
      case 'nepal':
        adapter = new NepalMarketAdapter(config);
        break;
      case 'japan':
      case 'china':
      case 'hongkong':
      case 'korea':
      case 'singapore':
        // For now, use Nepal adapter as base for other markets
        // In production, each market would have its own adapter
        adapter = new NepalMarketAdapter(config);
        break;
      default:
        throw new Error(\`Unsupported market: \${marketId}\`);
    }

    this.adapters.set(marketId, adapter);
    return adapter;
  }

  static getAdapter(marketId: string): BaseMarketAdapter | undefined {
    return this.adapters.get(marketId);
  }

  static async refreshAdapter(marketId: string): Promise<BaseMarketAdapter> {
    this.adapters.delete(marketId);
    return await this.createAdapter(marketId);
  }

  private static checkRateLimit(marketId: string, config: MarketConfig): void {
    const now = Date.now();
    const limiter = this.rateLimiters.get(marketId) || { lastCall: 0, calls: 0 };

    // Reset calls if more than a minute has passed
    if (now - limiter.lastCall > 60000) {
      limiter.calls = 0;
      limiter.lastCall = now;
    }

    // Check if rate limit exceeded
    if (limiter.calls >= config.rateLimit) {
      const waitTime = 60000 - (now - limiter.lastCall);
      throw new Error(\`Rate limit exceeded for \${marketId}. Please wait \${Math.ceil(waitTime / 1000)} seconds.\`);
    }

    limiter.calls++;
    this.rateLimiters.set(marketId, limiter);
  }

  static getMarketStatus(marketId: string): {
    isAvailable: boolean;
    reliability: number;
    lastCheck: Date;
    rateLimitRemaining: number;
  } {
    const config = getMarketConfig(marketId);
    const limiter = this.rateLimiters.get(marketId) || { lastCall: 0, calls: 0 };
    const now = Date.now();
    
    // Reset calls if more than a minute has passed
    const callsInCurrentMinute = now - limiter.lastCall > 60000 ? 0 : limiter.calls;
    
    return {
      isAvailable: config !== undefined,
      reliability: config?.reliability || 0,
      lastCheck: new Date(limiter.lastCall),
      rateLimitRemaining: Math.max(0, (config?.rateLimit || 0) - callsInCurrentMinute)
    };
  }

  static getAllMarketStatuses(): Record<string, {
    isAvailable: boolean;
    reliability: number;
    lastCheck: Date;
    rateLimitRemaining: number;
  }> {
    const statuses: Record<string, any> = {};
    const markets = ['japan', 'china', 'hongkong', 'korea', 'singapore', 'nepal'];
    
    for (const marketId of markets) {
      statuses[marketId] = this.getMarketStatus(marketId);
    }
    
    return statuses;
  }

  static async testConnection(marketId: string): Promise<{
    success: boolean;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const adapter = await this.createAdapter(marketId);
      await adapter.fetchMarketOverview();
      const latency = Date.now() - startTime;
      
      return {
        success: true,
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
