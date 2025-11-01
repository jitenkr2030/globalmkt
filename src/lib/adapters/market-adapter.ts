export interface MarketData {
  market: string;
  isOpen: boolean;
  lastUpdate: Date;
  timezone: string;
  currency: string;
  indices: MarketIndex[];
  sentiment: any;
  volume: number;
  volatility: number;
}

export interface StockData {
  symbol: string;
  name: string;
  nameZh?: string;
  nameKo?: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  sector: string;
  chaebol?: string;
  lastUpdate: Date;
  patterns?: any[];
  sentiment?: any;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  nameZh?: string;
  nameKo?: string;
  value: number;
  change: number;
  volume: number;
  description?: string;
}

export interface MarketAdapter {
  getMarketData(): Promise<MarketData>;
  getStockData(symbol: string): Promise<StockData>;
  getIndices(): Promise<MarketIndex[]>;
  getTopGainers(): Promise<StockData[]>;
  getTopLosers(): Promise<StockData[]>;
  getMarketSentiment(): Promise<any>;
}
