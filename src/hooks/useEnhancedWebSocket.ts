'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Enhanced data types
interface EnhancedMarketData {
  market: string;
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
  status: 'open' | 'closed' | 'holiday' | 'pre-market' | 'post-market';
  bid: number;
  ask: number;
  lastTrade: {
    price: number;
    size: number;
    time: string;
  };
}

interface EnhancedStockData {
  symbol: string;
  market: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  changePercent: number;
  volume: number;
  bid: number;
  ask: number;
  timestamp: string;
  lastTrade: {
    price: number;
    size: number;
    time: string;
  };
  marketCap: number;
  pe: number;
  dividend: number;
}

interface TechnicalIndicator {
  symbol: string;
  indicator: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  timestamp: string;
}

interface MarketNews {
  id: string;
  title: string;
  content: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'low' | 'medium' | 'high';
  symbols: string[];
  timestamp: string;
}

interface OrderBook {
  symbol: string;
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
  timestamp: string;
}

interface TradeStream {
  symbol: string;
  price: number;
  size: number;
  time: string;
  exchange: string;
  conditions: string[];
}

interface HistoricalData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface UseEnhancedWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  marketData: Map<string, EnhancedMarketData>;
  stockData: Map<string, EnhancedStockData>;
  technicalIndicators: Map<string, TechnicalIndicator[]>;
  marketNews: MarketNews[];
  orderBooks: Map<string, OrderBook>;
  tradeStreams: Map<string, TradeStream[]>;
  historicalData: Map<string, HistoricalData[]>;
  
  // Subscription methods
  subscribeToMarket: (market: string, options?: {
    interval?: number;
    includeDepth?: boolean;
    includeNews?: boolean;
  }) => void;
  unsubscribeFromMarket: (market: string) => void;
  
  subscribeToStocks: (symbols: string[], options?: {
    interval?: number;
    includeTechnical?: boolean;
    includeDepth?: boolean;
  }) => void;
  unsubscribeFromStocks: (symbols: string[]) => void;
  
  subscribeToTradeStream: (symbols: string[]) => void;
  unsubscribeFromTradeStream: (symbols: string[]) => void;
  
  subscribeToTechnical: (symbols: string[], indicators: string[]) => void;
  unsubscribeFromTechnical: (symbols: string[]) => void;
  
  subscribeToNews: (options?: { markets?: string[]; symbols?: string[] }) => void;
  unsubscribeFromNews: () => void;
  
  // Data request methods
  requestRealTimeData: (type: 'market' | 'stock', identifier: string) => void;
  requestHistoricalData: (symbol: string, timeframe: string, limit: number) => void;
  
  // Utility methods
  clearData: () => void;
  getConnectionStats: () => { connected: boolean; subscriptions: number; lastUpdate: string };
}

export function useEnhancedWebSocket(): UseEnhancedWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  
  // Data storage
  const marketDataRef = useRef<Map<string, EnhancedMarketData>>(new Map());
  const stockDataRef = useRef<Map<string, EnhancedStockData>>(new Map());
  const technicalIndicatorsRef = useRef<Map<string, TechnicalIndicator[]>>(new Map());
  const marketNewsRef = useRef<MarketNews[]>([]);
  const orderBooksRef = useRef<Map<string, OrderBook>>(new Map());
  const tradeStreamsRef = useRef<Map<string, TradeStream[]>>(new Map());
  const historicalDataRef = useRef<Map<string, HistoricalData[]>>(new Map());
  
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const lastUpdateRef = useRef<string>(new Date().toISOString());
  
  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    socketRef.current = socket;
    
    // Connection events
    socket.on('connect', () => {
      console.log('Connected to enhanced WebSocket');
      setConnected(true);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from enhanced WebSocket:', reason);
      setConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Enhanced WebSocket connection error:', error);
      setConnected(false);
    });
    
    // Data event handlers
    socket.on('enhanced-market-data', (data: EnhancedMarketData) => {
      marketDataRef.current.set(data.market, data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('enhanced-market-update', (data: EnhancedMarketData) => {
      marketDataRef.current.set(data.market, data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('enhanced-stock-data', (data: EnhancedStockData) => {
      stockDataRef.current.set(data.symbol, data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('enhanced-stock-update', (data: EnhancedStockData) => {
      stockDataRef.current.set(data.symbol, data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('technical-indicators', (data: { symbol: string; indicators: TechnicalIndicator[] }) => {
      technicalIndicatorsRef.current.set(data.symbol, data.indicators);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('technical-indicators-update', (data: { symbol: string; indicators: TechnicalIndicator[] }) => {
      technicalIndicatorsRef.current.set(data.symbol, data.indicators);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('market-news', (data: { news: MarketNews[] }) => {
      marketNewsRef.current = data.news;
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('market-news-update', (news: MarketNews) => {
      marketNewsRef.current.unshift(news);
      if (marketNewsRef.current.length > 100) {
        marketNewsRef.current = marketNewsRef.current.slice(0, 100);
      }
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('order-book-data', (data: OrderBook) => {
      orderBooksRef.current.set(data.symbol, data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('order-book-update', (data: OrderBook) => {
      orderBooksRef.current.set(data.symbol, data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('trade-stream-update', (data: TradeStream) => {
      if (!tradeStreamsRef.current.has(data.symbol)) {
        tradeStreamsRef.current.set(data.symbol, []);
      }
      const trades = tradeStreamsRef.current.get(data.symbol)!;
      trades.unshift(data);
      if (trades.length > 100) {
        trades.splice(100);
      }
      lastUpdateRef.current = new Date().toISOString();
    });
    
    socket.on('historical-data', (data: { symbol: string; data: HistoricalData[] }) => {
      historicalDataRef.current.set(data.symbol, data.data);
      lastUpdateRef.current = new Date().toISOString();
    });
    
    // Confirmation events
    socket.on('enhanced-subscription-confirmed', (data: any) => {
      const key = `${data.type}-${data.market || data.symbol || 'news'}`;
      subscriptionsRef.current.add(key);
    });
    
    socket.on('trade-stream-subscription-confirmed', (data: any) => {
      data.symbols.forEach((symbol: string) => {
        subscriptionsRef.current.add(`trade-stream-${symbol}`);
      });
    });
    
    socket.on('technical-subscription-confirmed', (data: any) => {
      data.symbols.forEach((symbol: string) => {
        subscriptionsRef.current.add(`technical-${symbol}`);
      });
    });
    
    socket.on('news-subscription-confirmed', (data: any) => {
      subscriptionsRef.current.add('news');
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Subscription methods
  const subscribeToMarket = useCallback((market: string, options: {
    interval?: number;
    includeDepth?: boolean;
    includeNews?: boolean;
  } = {}) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe:enhanced-market', {
        market,
        ...options
      });
    }
  }, [connected]);
  
  const unsubscribeFromMarket = useCallback((market: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('unsubscribe:enhanced-market', { market });
      subscriptionsRef.current.delete(`market-${market}`);
    }
  }, [connected]);
  
  const subscribeToStocks = useCallback((symbols: string[], options: {
    interval?: number;
    includeTechnical?: boolean;
    includeDepth?: boolean;
  } = {}) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe:enhanced-stocks', {
        symbols,
        ...options
      });
    }
  }, [connected]);
  
  const unsubscribeFromStocks = useCallback((symbols: string[]) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('unsubscribe:enhanced-stocks', { symbols });
      symbols.forEach(symbol => {
        subscriptionsRef.current.delete(`stock-${symbol}`);
      });
    }
  }, [connected]);
  
  const subscribeToTradeStream = useCallback((symbols: string[]) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe:trade-stream', { symbols });
    }
  }, [connected]);
  
  const unsubscribeFromTradeStream = useCallback((symbols: string[]) => {
    if (socketRef.current && connected) {
      symbols.forEach(symbol => {
        subscriptionsRef.current.delete(`trade-stream-${symbol}`);
      });
    }
  }, [connected]);
  
  const subscribeToTechnical = useCallback((symbols: string[], indicators: string[]) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe:technical', { symbols, indicators });
    }
  }, [connected]);
  
  const unsubscribeFromTechnical = useCallback((symbols: string[]) => {
    if (socketRef.current && connected) {
      symbols.forEach(symbol => {
        subscriptionsRef.current.delete(`technical-${symbol}`);
      });
    }
  }, [connected]);
  
  const subscribeToNews = useCallback((options: { markets?: string[]; symbols?: string[] } = {}) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('subscribe:news', options);
    }
  }, [connected]);
  
  const unsubscribeFromNews = useCallback(() => {
    if (socketRef.current && connected) {
      subscriptionsRef.current.delete('news');
    }
  }, [connected]);
  
  // Data request methods
  const requestRealTimeData = useCallback((type: 'market' | 'stock', identifier: string) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('request:real-time-data', { type, identifier });
    }
  }, [connected]);
  
  const requestHistoricalData = useCallback((symbol: string, timeframe: string, limit: number) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('request:historical-data', { symbol, timeframe, limit });
    }
  }, [connected]);
  
  // Utility methods
  const clearData = useCallback(() => {
    marketDataRef.current.clear();
    stockDataRef.current.clear();
    technicalIndicatorsRef.current.clear();
    marketNewsRef.current = [];
    orderBooksRef.current.clear();
    tradeStreamsRef.current.clear();
    historicalDataRef.current.clear();
    subscriptionsRef.current.clear();
    lastUpdateRef.current = new Date().toISOString();
  }, []);
  
  const getConnectionStats = useCallback(() => ({
    connected,
    subscriptions: subscriptionsRef.current.size,
    lastUpdate: lastUpdateRef.current
  }), [connected]);
  
  return {
    socket: socketRef.current,
    connected,
    marketData: marketDataRef.current,
    stockData: stockDataRef.current,
    technicalIndicators: technicalIndicatorsRef.current,
    marketNews: marketNewsRef.current,
    orderBooks: orderBooksRef.current,
    tradeStreams: tradeStreamsRef.current,
    historicalData: historicalDataRef.current,
    
    subscribeToMarket,
    unsubscribeFromMarket,
    subscribeToStocks,
    unsubscribeFromStocks,
    subscribeToTradeStream,
    unsubscribeFromTradeStream,
    subscribeToTechnical,
    unsubscribeFromTechnical,
    subscribeToNews,
    unsubscribeFromNews,
    
    requestRealTimeData,
    requestHistoricalData,
    
    clearData,
    getConnectionStats
  };
}