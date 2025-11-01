import { Server } from 'socket.io';
import ZAI from 'z-ai-web-dev-sdk';

// Enhanced interfaces for real-time data streaming
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

interface StockData {
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

interface MarketDepth {
  symbol: string;
  levels: Array<{
    price: number;
    bidSize: number;
    askSize: number;
    totalBidSize: number;
    totalAskSize: number;
  }>;
  timestamp: string;
}

export function setupEnhancedWebSocket(io: Server) {
  // Enhanced market data storage
  const marketDataMap = new Map<string, EnhancedMarketData>();
  const stockDataMap = new Map<string, StockData>();
  const technicalIndicators = new Map<string, TechnicalIndicator[]>();
  const orderBooks = new Map<string, OrderBook>();
  const tradeStreams = new Map<string, TradeStream[]>();
  const marketNews = new Map<string, MarketNews[]>();
  
  // Initialize enhanced market data
  const initializeMarketData = () => {
    const markets = [
      'NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX', 'SSE', 'BSE', 'NSE', 
      'SGX', 'KRX', 'ASX', 'TWSE', 'BVB', 'IDX', 'PSE', 'SET'
    ];
    
    markets.forEach(market => {
      const baseIndex = 1000 + Math.random() * 9000;
      marketDataMap.set(market, {
        market,
        index: baseIndex,
        open: baseIndex,
        high: baseIndex,
        low: baseIndex,
        close: baseIndex,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 1000000000),
        timestamp: new Date().toISOString(),
        status: 'open',
        bid: baseIndex - 0.5,
        ask: baseIndex + 0.5,
        lastTrade: {
          price: baseIndex,
          size: Math.floor(Math.random() * 1000),
          time: new Date().toISOString()
        }
      });
    });
    
    // Initialize stock data for major symbols
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];
    symbols.forEach(symbol => {
      const basePrice = 50 + Math.random() * 500;
      stockDataMap.set(symbol, {
        symbol,
        market: 'NYSE',
        price: basePrice,
        open: basePrice,
        high: basePrice,
        low: basePrice,
        close: basePrice,
        change: 0,
        changePercent: 0,
        volume: Math.floor(Math.random() * 10000000),
        bid: basePrice - 0.01,
        ask: basePrice + 0.01,
        timestamp: new Date().toISOString(),
        lastTrade: {
          price: basePrice,
          size: Math.floor(Math.random() * 1000),
          time: new Date().toISOString()
        },
        marketCap: basePrice * (1000000000 + Math.random() * 10000000000),
        pe: 15 + Math.random() * 30,
        dividend: Math.random() * 5
      });
      
      // Initialize order book
      orderBooks.set(symbol, {
        symbol,
        bids: [],
        asks: [],
        timestamp: new Date().toISOString()
      });
      
      // Initialize technical indicators
      technicalIndicators.set(symbol, [
        {
          symbol,
          indicator: 'RSI',
          value: 30 + Math.random() * 40,
          signal: 'hold',
          timestamp: new Date().toISOString()
        },
        {
          symbol,
          indicator: 'MACD',
          value: Math.random() * 2 - 1,
          signal: 'hold',
          timestamp: new Date().toISOString()
        },
        {
          symbol,
          indicator: 'SMA',
          value: basePrice,
          signal: 'hold',
          timestamp: new Date().toISOString()
        }
      ]);
    });
    
    // Initialize market news
    const newsSources = ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal'];
    for (let i = 0; i < 20; i++) {
      const news: MarketNews = {
        id: `news-${i}`,
        title: `Market Update: ${['Tech', 'Finance', 'Energy', 'Healthcare', 'Consumer'][Math.floor(Math.random() * 5)]} Sector News`,
        content: 'Breaking market news affecting global trading patterns...',
        source: newsSources[Math.floor(Math.random() * newsSources.length)],
        sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
        impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        symbols: symbols.slice(0, Math.floor(Math.random() * 3) + 1),
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      };
      
      if (!marketNews.has('global')) {
        marketNews.set('global', []);
      }
      marketNews.get('global')!.push(news);
    }
  };
  
  initializeMarketData();
  
  // Enhanced subscription management
  const subscriptions = new Map<string, Set<string>>();
  
  io.on('connection', (socket) => {
    console.log('Client connected to enhanced WebSocket:', socket.id);
    
    // Initialize client subscriptions
    subscriptions.set(socket.id, new Set());
    
    // Enhanced market subscription
    socket.on('subscribe:enhanced-market', (data: { 
      market: string; 
      interval?: number;
      includeDepth?: boolean;
      includeNews?: boolean;
    }) => {
      console.log('Enhanced market subscription:', data);
      
      const clientSubs = subscriptions.get(socket.id) || new Set();
      clientSubs.add(`market-${data.market}`);
      subscriptions.set(socket.id, clientSubs);
      
      socket.join(`enhanced-${data.market}`);
      
      // Send initial market data
      const marketData = marketDataMap.get(data.market);
      if (marketData) {
        socket.emit('enhanced-market-data', marketData);
      }
      
      // Send order book if requested
      if (data.includeDepth) {
        const orderBook = orderBooks.get(data.market);
        if (orderBook) {
          socket.emit('order-book-data', orderBook);
        }
      }
      
      // Send news if requested
      if (data.includeNews) {
        const news = marketNews.get('global') || [];
        socket.emit('market-news', { news, market: data.market });
      }
      
      socket.emit('enhanced-subscription-confirmed', {
        type: 'market',
        market: data.market,
        timestamp: new Date().toISOString()
      });
    });
    
    // Stock subscription with real-time data
    socket.on('subscribe:enhanced-stocks', (data: {
      symbols: string[];
      interval?: number;
      includeTechnical?: boolean;
      includeDepth?: boolean;
    }) => {
      console.log('Enhanced stock subscription:', data);
      
      const clientSubs = subscriptions.get(socket.id) || new Set();
      data.symbols.forEach(symbol => {
        clientSubs.add(`stock-${symbol}`);
        socket.join(`enhanced-stock-${symbol}`);
      });
      subscriptions.set(socket.id, clientSubs);
      
      // Send initial stock data
      data.symbols.forEach(symbol => {
        const stockData = stockDataMap.get(symbol);
        if (stockData) {
          socket.emit('enhanced-stock-data', stockData);
        }
        
        // Send technical indicators if requested
        if (data.includeTechnical) {
          const indicators = technicalIndicators.get(symbol);
          if (indicators) {
            socket.emit('technical-indicators', { symbol, indicators });
          }
        }
        
        // Send order book if requested
        if (data.includeDepth) {
          const orderBook = orderBooks.get(symbol);
          if (orderBook) {
            socket.emit('order-book-data', orderBook);
          }
        }
      });
      
      socket.emit('enhanced-subscription-confirmed', {
        type: 'stocks',
        symbols: data.symbols,
        timestamp: new Date().toISOString()
      });
    });
    
    // Real-time trade stream subscription
    socket.on('subscribe:trade-stream', (data: { symbols: string[] }) => {
      console.log('Trade stream subscription:', data);
      
      data.symbols.forEach(symbol => {
        socket.join(`trade-stream-${symbol}`);
      });
      
      socket.emit('trade-stream-subscription-confirmed', {
        symbols: data.symbols,
        timestamp: new Date().toISOString()
      });
    });
    
    // Technical indicators subscription
    socket.on('subscribe:technical', (data: { symbols: string[]; indicators: string[] }) => {
      console.log('Technical indicators subscription:', data);
      
      data.symbols.forEach(symbol => {
        socket.join(`technical-${symbol}`);
        
        // Send current indicators
        const indicators = technicalIndicators.get(symbol);
        if (indicators) {
          const filteredIndicators = indicators.filter(ind => 
            data.indicators.includes(ind.indicator)
          );
          socket.emit('technical-indicators', { symbol, indicators: filteredIndicators });
        }
      });
      
      socket.emit('technical-subscription-confirmed', {
        symbols: data.symbols,
        indicators: data.indicators,
        timestamp: new Date().toISOString()
      });
    });
    
    // Market news subscription
    socket.on('subscribe:news', (data: { markets?: string[]; symbols?: string[] }) => {
      console.log('News subscription:', data);
      
      socket.join('market-news');
      
      // Send recent news
      const news = marketNews.get('global') || [];
      let filteredNews = news;
      
      if (data.markets || data.symbols) {
        filteredNews = news.filter(item => {
          if (data.markets && item.symbols.some(symbol => data.markets!.includes(symbol))) {
            return true;
          }
          if (data.symbols && item.symbols.some(symbol => data.symbols!.includes(symbol))) {
            return true;
          }
          return false;
        });
      }
      
      socket.emit('market-news', { news: filteredNews, timestamp: new Date().toISOString() });
      
      socket.emit('news-subscription-confirmed', {
        markets: data.markets,
        symbols: data.symbols,
        timestamp: new Date().toISOString()
      });
    });
    
    // Real-time data requests
    socket.on('request:real-time-data', (data: { type: 'market' | 'stock'; identifier: string }) => {
      console.log('Real-time data request:', data);
      
      if (data.type === 'market') {
        const marketData = marketDataMap.get(data.identifier);
        if (marketData) {
          socket.emit('real-time-market-data', marketData);
        }
      } else if (data.type === 'stock') {
        const stockData = stockDataMap.get(data.identifier);
        if (stockData) {
          socket.emit('real-time-stock-data', stockData);
        }
      }
    });
    
    // Historical data request
    socket.on('request:historical-data', (data: { 
      symbol: string; 
      timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
      limit: number;
    }) => {
      console.log('Historical data request:', data);
      
      // Generate mock historical data
      const historicalData = generateHistoricalData(data.symbol, data.timeframe, data.limit);
      
      socket.emit('historical-data', {
        symbol: data.symbol,
        timeframe: data.timeframe,
        data: historicalData,
        timestamp: new Date().toISOString()
      });
    });
    
    // Unsubscribe handlers
    socket.on('unsubscribe:enhanced-market', (data: { market: string }) => {
      console.log('Unsubscribe from enhanced market:', data);
      socket.leave(`enhanced-${data.market}`);
      
      const clientSubs = subscriptions.get(socket.id) || new Set();
      clientSubs.delete(`market-${data.market}`);
      subscriptions.set(socket.id, clientSubs);
    });
    
    socket.on('unsubscribe:enhanced-stocks', (data: { symbols: string[] }) => {
      console.log('Unsubscribe from enhanced stocks:', data);
      
      const clientSubs = subscriptions.get(socket.id) || new Set();
      data.symbols.forEach(symbol => {
        socket.leave(`enhanced-stock-${symbol}`);
        clientSubs.delete(`stock-${symbol}`);
      });
      subscriptions.set(socket.id, clientSubs);
    });
    
    // Disconnection handler
    socket.on('disconnect', () => {
      console.log('Client disconnected from enhanced WebSocket:', socket.id);
      subscriptions.delete(socket.id);
    });
  });
  
  // Real-time data simulation
  const updateMarketData = () => {
    marketDataMap.forEach((data, market) => {
      const variation = (Math.random() - 0.5) * 0.001; // ±0.1% variation
      const newIndex = data.index * (1 + variation);
      const newChange = newIndex - data.open;
      const newChangePercent = (newChange / data.open) * 100;
      
      const updatedData: EnhancedMarketData = {
        ...data,
        index: newIndex,
        high: Math.max(data.high, newIndex),
        low: Math.min(data.low, newIndex),
        change: newChange,
        changePercent: newChangePercent,
        volume: data.volume + Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
        bid: newIndex - 0.5,
        ask: newIndex + 0.5,
        lastTrade: {
          price: newIndex,
          size: Math.floor(Math.random() * 1000),
          time: new Date().toISOString()
        }
      };
      
      marketDataMap.set(market, updatedData);
      
      // Emit to subscribed clients
      io.to(`enhanced-${market}`).emit('enhanced-market-update', updatedData);
    });
  };
  
  const updateStockData = () => {
    stockDataMap.forEach((data, symbol) => {
      const variation = (Math.random() - 0.5) * 0.002; // ±0.2% variation
      const newPrice = data.price * (1 + variation);
      const newChange = newPrice - data.open;
      const newChangePercent = (newChange / data.open) * 100;
      
      const updatedData: StockData = {
        ...data,
        price: newPrice,
        high: Math.max(data.high, newPrice),
        low: Math.min(data.low, newPrice),
        change: newChange,
        changePercent: newChangePercent,
        volume: data.volume + Math.floor(Math.random() * 100000),
        bid: newPrice - 0.01,
        ask: newPrice + 0.01,
        timestamp: new Date().toISOString(),
        lastTrade: {
          price: newPrice,
          size: Math.floor(Math.random() * 1000),
          time: new Date().toISOString()
        }
      };
      
      stockDataMap.set(symbol, updatedData);
      
      // Emit to subscribed clients
      io.to(`enhanced-stock-${symbol}`).emit('enhanced-stock-update', updatedData);
      
      // Generate trade stream
      const trade: TradeStream = {
        symbol,
        price: newPrice,
        size: Math.floor(Math.random() * 1000),
        time: new Date().toISOString(),
        exchange: 'NYSE',
        conditions: ['@', 'T']
      };
      
      io.to(`trade-stream-${symbol}`).emit('trade-stream-update', trade);
      
      // Update order book
      updateOrderBook(symbol, newPrice);
    });
  };
  
  const updateTechnicalIndicators = () => {
    stockDataMap.forEach((data, symbol) => {
      const indicators = technicalIndicators.get(symbol);
      if (indicators) {
        const updatedIndicators = indicators.map(indicator => {
          const variation = (Math.random() - 0.5) * 0.1;
          const newValue = indicator.value + variation;
          let signal: 'buy' | 'sell' | 'hold' = 'hold';
          
          if (indicator.indicator === 'RSI') {
            if (newValue < 30) signal = 'buy';
            else if (newValue > 70) signal = 'sell';
          } else if (indicator.indicator === 'MACD') {
            if (newValue > 0.5) signal = 'buy';
            else if (newValue < -0.5) signal = 'sell';
          }
          
          return {
            ...indicator,
            value: newValue,
            signal,
            timestamp: new Date().toISOString()
          };
        });
        
        technicalIndicators.set(symbol, updatedIndicators);
        
        // Emit to subscribed clients
        io.to(`technical-${symbol}`).emit('technical-indicators-update', {
          symbol,
          indicators: updatedIndicators
        });
      }
    });
  };
  
  const updateOrderBook = (symbol: string, currentPrice: number) => {
    const orderBook = orderBooks.get(symbol);
    if (orderBook) {
      // Generate new bids and asks
      const newBids = [];
      const newAsks = [];
      
      for (let i = 0; i < 5; i++) {
        newBids.push({
          price: currentPrice - (i + 1) * 0.01,
          size: Math.floor(Math.random() * 10000)
        });
        newAsks.push({
          price: currentPrice + (i + 1) * 0.01,
          size: Math.floor(Math.random() * 10000)
        });
      }
      
      const updatedOrderBook: OrderBook = {
        ...orderBook,
        bids: newBids,
        asks: newAsks,
        timestamp: new Date().toISOString()
      };
      
      orderBooks.set(symbol, updatedOrderBook);
      
      // Emit to subscribed clients
      io.to(`enhanced-stock-${symbol}`).emit('order-book-update', updatedOrderBook);
    }
  };
  
  const generateMarketNews = () => {
    if (Math.random() < 0.3) { // 30% chance of new news
      const newsSources = ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'Wall Street Journal'];
      const symbols = Array.from(stockDataMap.keys());
      const randomSymbols = symbols.slice(0, Math.floor(Math.random() * 3) + 1);
      
      const news: MarketNews = {
        id: `news-${Date.now()}`,
        title: `Breaking: ${['Market', 'Economic', 'Corporate', 'Technical'][Math.floor(Math.random() * 4)]} News`,
        content: 'Important market development affecting trading patterns...',
        source: newsSources[Math.floor(Math.random() * newsSources.length)],
        sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
        impact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        symbols: randomSymbols,
        timestamp: new Date().toISOString()
      };
      
      if (!marketNews.has('global')) {
        marketNews.set('global', []);
      }
      
      const newsList = marketNews.get('global')!;
      newsList.unshift(news);
      
      // Keep only last 50 news items
      if (newsList.length > 50) {
        newsList.splice(50);
      }
      
      // Emit to subscribed clients
      io.to('market-news').emit('market-news-update', news);
    }
  };
  
  const generateHistoricalData = (symbol: string, timeframe: string, limit: number) => {
    const data = [];
    const basePrice = stockDataMap.get(symbol)?.price || 100;
    
    for (let i = 0; i < limit; i++) {
      const variation = (Math.random() - 0.5) * 0.02;
      const price = basePrice * (1 + variation);
      
      data.push({
        timestamp: new Date(Date.now() - (limit - i) * 60000).toISOString(),
        open: price * (1 - Math.random() * 0.01),
        high: price * (1 + Math.random() * 0.01),
        low: price * (1 - Math.random() * 0.01),
        close: price,
        volume: Math.floor(Math.random() * 1000000)
      });
    }
    
    return data;
  };
  
  // Set up update intervals
  setInterval(updateMarketData, 1000); // Update market data every second
  setInterval(updateStockData, 500);   // Update stock data every 500ms
  setInterval(updateTechnicalIndicators, 5000); // Update indicators every 5 seconds
  setInterval(generateMarketNews, 30000); // Generate news every 30 seconds
  
  console.log('Enhanced WebSocket server setup complete');
}

// Helper function to generate historical data
function generateHistoricalData(symbol: string, timeframe: string, limit: number) {
  const data = [];
  const basePrice = 100 + Math.random() * 500;
  
  for (let i = 0; i < limit; i++) {
    const variation = (Math.random() - 0.5) * 0.02;
    const price = basePrice * (1 + variation);
    
    data.push({
      timestamp: new Date(Date.now() - (limit - i) * 60000).toISOString(),
      open: price * (1 - Math.random() * 0.01),
      high: price * (1 + Math.random() * 0.01),
      low: price * (1 - Math.random() * 0.01),
      close: price,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  
  return data;
}