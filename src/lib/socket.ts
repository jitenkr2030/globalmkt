import { Server } from 'socket.io';

interface MarketSubscription {
  market: string;
  symbols?: string[];
  interval?: number;
}

interface MarketData {
  market: string;
  index: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
  status: 'open' | 'closed' | 'holiday';
}

interface StockData {
  symbol: string;
  market: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export function setupSocket(io: Server) {
  // Store active subscriptions
  const subscriptions = new Map<string, MarketSubscription[]>();
  
  // Market data simulation
  const marketDataMap = new Map<string, MarketData>([
    ['india', {
      market: 'india',
      index: 19456.78,
      change: 89.34,
      changePercent: 0.46,
      volume: 450000000,
      timestamp: new Date().toISOString(),
      status: 'open'
    }],
    ['nepal', {
      market: 'nepal',
      index: 2184.52,
      change: 12.34,
      changePercent: 0.57,
      volume: 12500000,
      timestamp: new Date().toISOString(),
      status: 'open'
    }],
    ['japan', {
      market: 'japan',
      index: 32847.23,
      change: -156.78,
      changePercent: -0.47,
      volume: 2500000000,
      timestamp: new Date().toISOString(),
      status: 'closed'
    }],
    ['china', {
      market: 'china',
      index: 3087.45,
      change: 23.67,
      changePercent: 0.77,
      volume: 3200000000,
      timestamp: new Date().toISOString(),
      status: 'closed'
    }],
    ['hongkong', {
      market: 'hongkong',
      index: 17892.34,
      change: 89.12,
      changePercent: 0.50,
      volume: 1800000000,
      timestamp: new Date().toISOString(),
      status: 'closed'
    }],
    ['singapore', {
      market: 'singapore',
      index: 3234.56,
      change: -12.45,
      changePercent: -0.38,
      volume: 850000000,
      timestamp: new Date().toISOString(),
      status: 'closed'
    }],
    ['korea', {
      market: 'korea',
      index: 2456.78,
      change: 34.56,
      changePercent: 1.43,
      volume: 1200000000,
      timestamp: new Date().toISOString(),
      status: 'closed'
    }]
  ]);

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Initialize subscriptions for this client
    subscriptions.set(socket.id, []);
    
    // Handle market subscriptions
    socket.on('subscribe:market', (data: MarketSubscription) => {
      console.log('Client subscribed to market:', data);
      
      // Add to subscriptions
      const clientSubs = subscriptions.get(socket.id) || [];
      clientSubs.push(data);
      subscriptions.set(socket.id, clientSubs);
      
      // Join market room
      socket.join(`${data.market}-market`);
      
      // Send initial data
      const marketData = marketDataMap.get(data.market);
      if (marketData) {
        socket.emit('market-data', marketData);
      }
      
      // Send confirmation
      socket.emit('subscription:confirmed', {
        market: data.market,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle stock subscriptions
    socket.on('subscribe:stocks', (data: { market: string; symbols: string[] }) => {
      console.log('Client subscribed to stocks:', data);
      socket.join(`${data.market}-stocks`);
      
      // Send confirmation
      socket.emit('stocks:subscription:confirmed', {
        market: data.market,
        symbols: data.symbols,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle regional subscriptions
    socket.on('subscribe:regional', (data: { region: string }) => {
      console.log('Client subscribed to regional data:', data);
      socket.join(`${data.region}-region`);
      
      // Send regional market data
      const regionalMarkets = Array.from(marketDataMap.keys()).filter(market => {
        // Simple region mapping - in real implementation, this would be more sophisticated
        if (data.region === 'asia') return ['india', 'nepal', 'japan', 'china', 'hongkong', 'singapore', 'korea'].includes(market);
        return false;
      });
      
      const regionalData = regionalMarkets.map(market => marketDataMap.get(market)).filter(Boolean);
      
      socket.emit('regional-data', {
        region: data.region,
        markets: regionalData,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle correlation data requests
    socket.on('request:correlation', (data: { markets: string[] }) => {
      console.log('Correlation data request:', data);
      
      // Mock correlation data
      const correlationData = [
        { market1: data.markets[0], market2: data.markets[1], correlation: 0.78, strength: 'strong' },
        { market1: data.markets[0], market2: data.markets[2], correlation: 0.45, strength: 'weak' },
        { market1: data.markets[1], market2: data.markets[2], correlation: 0.65, strength: 'moderate' }
      ];
      
      socket.emit('correlation-data', {
        correlations: correlationData,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle market data requests
    socket.on('request:market-data', (data: { market: string }) => {
      console.log('Market data request:', data);
      
      const marketData = marketDataMap.get(data.market);
      if (marketData) {
        socket.emit('market-data', marketData);
      } else {
        socket.emit('error', {
          message: `Market data not found for ${data.market}`,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Handle unsubscribe
    socket.on('unsubscribe:market', (data: { market: string }) => {
      console.log('Client unsubscribed from market:', data);
      socket.leave(`${data.market}-market`);
      
      // Remove from subscriptions
      const clientSubs = subscriptions.get(socket.id) || [];
      const updatedSubs = clientSubs.filter(sub => sub.market !== data.market);
      subscriptions.set(socket.id, updatedSubs);
      
      socket.emit('unsubscription:confirmed', {
        market: data.market,
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Clean up subscriptions
      subscriptions.delete(socket.id);
    });
  });
  
  // Simulate real-time market data updates
  setInterval(() => {
    // Update market data with random variations
    marketDataMap.forEach((data, market) => {
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const newChange = data.change + (Math.random() - 0.5) * 10;
      const newChangePercent = (newChange / (data.index - newChange)) * 100;
      
      const updatedData: MarketData = {
        ...data,
        change: newChange,
        changePercent: newChangePercent,
        volume: data.volume + Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString()
      };
      
      marketDataMap.set(market, updatedData);
      
      // Emit to all clients subscribed to this market
      io.to(`${market}-market`).emit('market-update', updatedData);
    });
    
    // Emit regional updates
    const regions = ['asia'];
    regions.forEach(region => {
      const regionalMarkets = Array.from(marketDataMap.keys()).filter(market => {
        if (region === 'asia') return ['india', 'nepal', 'japan', 'china', 'hongkong', 'singapore', 'korea'].includes(market);
        return false;
      });
      
      const regionalData = regionalMarkets.map(market => marketDataMap.get(market)).filter(Boolean);
      
      io.to(`${region}-region`).emit('regional-update', {
        region,
        markets: regionalData,
        timestamp: new Date().toISOString()
      });
    });
  }, 5000); // Update every 5 seconds
  
  console.log('Multi-Market Socket.IO server setup complete');
}
