import { MarketAdapter } from '../adapters/market-adapter';

export interface CorrelationMatrix {
  markets: string[];
  matrix: number[][];
  lastUpdate: Date;
  timeframe: string;
}

export interface MarketPair {
  market1: string;
  market2: string;
  correlation: number;
  beta: number;
  rSquared: number;
  pValue: number;
}

export interface RegionalTrend {
  trend: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  strength: number;
  confidence: number;
  leadingMarkets: string[];
  laggingMarkets: string[];
  keyDrivers: string[];
  timeframe: string;
}

export interface ArbitrageOpportunity {
  id: string;
  markets: string[];
  opportunityType: 'statistical_arbitrage' | 'pairs_trading' | 'triangular_arbitrage' | 'cross_market_momentum';
  expectedReturn: number;
  riskLevel: number;
  confidence: number;
  timeframe: string;
  description: string;
  entrySignals: string[];
  exitSignals: string[];
  riskFactors: string[];
}

export class MarketCorrelationAnalysis {
  private marketAdapters: Map<string, MarketAdapter>;
  private correlationCache: Map<string, CorrelationMatrix>;

  constructor() {
    this.marketAdapters = new Map();
    this.correlationCache = new Map();
  }

  addMarketAdapter(marketId: string, adapter: MarketAdapter): void {
    this.marketAdapters.set(marketId, adapter);
  }

  async calculateCorrelationMatrix(timeframe: string = '1d'): Promise<CorrelationMatrix> {
    const cacheKey = `${timeframe}_${Date.now()}`;
    
    if (this.correlationCache.has(cacheKey)) {
      return this.correlationCache.get(cacheKey)!;
    }

    const markets = Array.from(this.marketAdapters.keys());
    const matrix: number[][] = [];
    
    // Initialize correlation matrix
    for (let i = 0; i < markets.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < markets.length; j++) {
        if (i === j) {
          matrix[i][j] = 1.0; // Perfect correlation with self
        } else {
          matrix[i][j] = await this.calculatePairwiseCorrelation(markets[i], markets[j], timeframe);
        }
      }
    }

    const correlationMatrix: CorrelationMatrix = {
      markets,
      matrix,
      lastUpdate: new Date(),
      timeframe
    };

    this.correlationCache.set(cacheKey, correlationMatrix);
    return correlationMatrix;
  }

  async getMarketPairs(timeframe: string = '1d'): Promise<MarketPair[]> {
    const markets = Array.from(this.marketAdapters.keys());
    const pairs: MarketPair[] = [];

    for (let i = 0; i < markets.length; i++) {
      for (let j = i + 1; j < markets.length; j++) {
        const correlation = await this.calculatePairwiseCorrelation(markets[i], markets[j], timeframe);
        const beta = await this.calculateBeta(markets[i], markets[j], timeframe);
        const rSquared = correlation * correlation;
        const pValue = this.calculatePValue(correlation, 100); // Assuming 100 data points

        pairs.push({
          market1: markets[i],
          market2: markets[j],
          correlation,
          beta,
          rSquared,
          pValue
        });
      }
    }

    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }

  async identifyRegionalTrends(timeframe: string = '1d'): Promise<RegionalTrend> {
    const markets = Array.from(this.marketAdapters.keys());
    const marketSentiments: { market: string; sentiment: number; change: number }[] = [];

    // Collect market data
    for (const market of markets) {
      try {
        const marketData = await this.marketAdapters.get(market)!.getMarketData();
        const sentiment = marketData.sentiment.overall;
        const change = this.calculateMarketChange(market, timeframe);
        
        marketSentiments.push({ market, sentiment, change });
      } catch (error) {
        console.warn(`Failed to get data for market ${market}:`, error);
      }
    }

    // Analyze regional trend
    const avgSentiment = marketSentiments.reduce((sum, m) => sum + m.sentiment, 0) / marketSentiments.length;
    const avgChange = marketSentiments.reduce((sum, m) => sum + m.change, 0) / marketSentiments.length;
    
    let trend: RegionalTrend['trend'] = 'neutral';
    if (avgSentiment > 0.6 && avgChange > 2) trend = 'bullish';
    else if (avgSentiment < 0.4 && avgChange < -2) trend = 'bearish';
    else if (Math.abs(avgChange) < 1) trend = 'neutral';
    else trend = 'mixed';

    const strength = Math.abs(avgChange) / 10; // Normalize to 0-1
    const confidence = this.calculateTrendConfidence(marketSentiments);

    const leadingMarkets = marketSentiments
      .filter(m => m.change > avgChange)
      .map(m => m.market)
      .slice(0, 3);

    const laggingMarkets = marketSentiments
      .filter(m => m.change < avgChange)
      .map(m => m.market)
      .slice(0, 3);

    const keyDrivers = this.identifyKeyDrivers(marketSentiments);

    return {
      trend,
      strength,
      confidence,
      leadingMarkets,
      laggingMarkets,
      keyDrivers,
      timeframe
    };
  }

  async detectArbitrageOpportunities(timeframe: string = '1d'): Promise<ArbitrageOpportunity[]> {
    const opportunities: ArbitrageOpportunity[] = [];
    const marketPairs = await this.getMarketPairs(timeframe);

    // Statistical Arbitrage
    const statArbOpportunities = this.detectStatisticalArbitrage(marketPairs);
    opportunities.push(...statArbOpportunities);

    // Pairs Trading
    const pairsTradingOpportunities = this.detectPairsTrading(marketPairs);
    opportunities.push(...pairsTradingOpportunities);

    // Triangular Arbitrage (for 3+ markets)
    if (this.marketAdapters.size >= 3) {
      const triangularOpportunities = this.detectTriangularArbitrage(marketPairs);
      opportunities.push(...triangularOpportunities);
    }

    // Cross-Market Momentum
    const momentumOpportunities = this.detectCrossMarketMomentum(marketPairs);
    opportunities.push(...momentumOpportunities);

    return opportunities
      .filter(opp => opp.confidence > 0.6) // Filter by confidence threshold
      .sort((a, b) => b.expectedReturn - a.expectedReturn)
      .slice(0, 10); // Top 10 opportunities
  }

  private async calculatePairwiseCorrelation(market1: string, market2: string, timeframe: string): Promise<number> {
    // Simulate correlation calculation based on market characteristics
    const correlationFactors = this.getMarketCorrelationFactors(market1, market2);
    const baseCorrelation = correlationFactors.geographic + correlationFactors.economic + correlationFactors.cultural;
    
    // Add some randomness for realistic simulation
    const randomFactor = (Math.random() - 0.5) * 0.2;
    return Math.max(-1, Math.min(1, baseCorrelation + randomFactor));
  }

  private async calculateBeta(market1: string, market2: string, timeframe: string): Promise<number> {
    // Simulate beta calculation
    const correlation = await this.calculatePairwiseCorrelation(market1, market2, timeframe);
    const volatility1 = this.getMarketVolatility(market1);
    const volatility2 = this.getMarketVolatility(market2);
    
    return correlation * (volatility1 / volatility2);
  }

  private calculatePValue(correlation: number, sampleSize: number): number {
    // Simplified p-value calculation for correlation
    const t = correlation * Math.sqrt((sampleSize - 2) / (1 - correlation * correlation));
    return 2 * (1 - this.cumulativeNormalDistribution(Math.abs(t)));
  }

  private cumulativeNormalDistribution(x: number): number {
    // Approximation of cumulative normal distribution
    return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)));
  }

  private calculateMarketChange(market: string, timeframe: string): number {
    // Simulate market change calculation
    const marketFactors = this.getMarketFactors(market);
    const baseChange = (marketFactors.volatility * (Math.random() - 0.5) * 10);
    return baseChange;
  }

  private calculateTrendConfidence(sentiments: { market: string; sentiment: number; change: number }[]): number {
    // Calculate confidence based on consensus among markets
    const sentimentVariance = this.calculateVariance(sentiments.map(s => s.sentiment));
    const changeVariance = this.calculateVariance(sentiments.map(s => s.change));
    
    // Lower variance = higher confidence
    const avgVariance = (sentimentVariance + changeVariance) / 2;
    return Math.max(0, Math.min(1, 1 - avgVariance));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  private identifyKeyDrivers(sentiments: { market: string; sentiment: number; change: number }[]): string[] {
    // Identify key drivers based on market influence
    const drivers = [
      'US Federal Reserve Policy',
      'Chinese Economic Data',
      'Global Risk Sentiment',
      'Commodity Prices',
      'Currency Exchange Rates',
      'Geopolitical Events',
      'Technology Sector Performance',
      'Regional Trade Policies'
    ];

    // Return top drivers based on current market conditions
    return drivers.slice(0, 3 + Math.floor(Math.random() * 3));
  }

  private detectStatisticalArbitrage(marketPairs: MarketPair[]): ArbitrageOpportunity[] {
    return marketPairs
      .filter(pair => Math.abs(pair.correlation) > 0.8 && pair.pValue < 0.05)
      .map((pair, index) => ({
        id: `stat_arb_${index}`,
        markets: [pair.market1, pair.market2],
        opportunityType: 'statistical_arbitrage' as const,
        expectedReturn: Math.abs(pair.correlation) * 5,
        riskLevel: 1 - pair.rSquared,
        confidence: pair.rSquared,
        timeframe: '1d',
        description: `High correlation between ${pair.market1} and ${pair.market2} suggests statistical arbitrage opportunity`,
        entrySignals: ['Correlation deviation detected', 'Mean reversion signal'],
        exitSignals: ['Correlation normalized', 'Target return achieved'],
        riskFactors: ['Correlation breakdown', 'Market regime change']
      }));
  }

  private detectPairsTrading(marketPairs: MarketPair[]): ArbitrageOpportunity[] {
    return marketPairs
      .filter(pair => pair.correlation > 0.7 && pair.correlation < 0.9)
      .map((pair, index) => ({
        id: `pairs_trading_${index}`,
        markets: [pair.market1, pair.market2],
        opportunityType: 'pairs_trading' as const,
        expectedReturn: 3,
        riskLevel: 0.6,
        confidence: pair.rSquared,
        timeframe: '1d',
        description: `Moderate correlation between ${pair.market1} and ${pair.market2} suitable for pairs trading`,
        entrySignals: ['Price ratio deviation', 'Relative strength divergence'],
        exitSignals: ['Price ratio convergence', 'Relative strength normalization'],
        riskFactors: ['Divergence continues', 'Correlation decreases']
      }));
  }

  private detectTriangularArbitrage(marketPairs: MarketPair[]): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    const markets = Array.from(this.marketAdapters.keys());
    
    // Look for triangular relationships
    for (let i = 0; i < markets.length - 2; i++) {
      for (let j = i + 1; j < markets.length - 1; j++) {
        for (let k = j + 1; k < markets.length; k++) {
          const correlation1 = marketPairs.find(p => 
            (p.market1 === markets[i] && p.market2 === markets[j]) ||
            (p.market1 === markets[j] && p.market2 === markets[i])
          )?.correlation || 0;
          
          const correlation2 = marketPairs.find(p => 
            (p.market1 === markets[j] && p.market2 === markets[k]) ||
            (p.market1 === markets[k] && p.market2 === markets[j])
          )?.correlation || 0;
          
          const correlation3 = marketPairs.find(p => 
            (p.market1 === markets[i] && p.market2 === markets[k]) ||
            (p.market1 === markets[k] && p.market2 === markets[i])
          )?.correlation || 0;

          if (correlation1 > 0.6 && correlation2 > 0.6 && correlation3 < 0.4) {
            opportunities.push({
              id: `triangular_${i}_${j}_${k}`,
              markets: [markets[i], markets[j], markets[k]],
              opportunityType: 'triangular_arbitrage' as const,
              expectedReturn: 4,
              riskLevel: 0.7,
              confidence: 0.65,
              timeframe: '1d',
              description: `Triangular arbitrage opportunity among ${markets[i]}, ${markets[j]}, and ${markets[k]}`,
              entrySignals: ['Triangular relationship detected', 'Price inefficiency identified'],
              exitSignals: ['Efficiency restored', 'Profit target reached'],
              riskFactors: ['Execution risk', 'Market liquidity']
            });
          }
        }
      }
    }

    return opportunities;
  }

  private detectCrossMarketMomentum(marketPairs: MarketPair[]): ArbitrageOpportunity[] {
    return marketPairs
      .filter(pair => pair.beta > 1.2 || pair.beta < 0.8)
      .map((pair, index) => ({
        id: `momentum_${index}`,
        markets: [pair.market1, pair.market2],
        opportunityType: 'cross_market_momentum' as const,
        expectedReturn: Math.abs(pair.beta - 1) * 6,
        riskLevel: Math.abs(pair.beta - 1),
        confidence: pair.rSquared,
        timeframe: '1d',
        description: `Beta divergence between ${pair.market1} and ${pair.market2} indicates momentum opportunity`,
        entrySignals: ['Beta divergence detected', 'Momentum confirmation'],
        exitSignals: ['Beta convergence', 'Momentum exhaustion'],
        riskFactors: ['Beta stability', 'Market direction change']
      }));
  }

  private getMarketCorrelationFactors(market1: string, market2: string) {
    // Define correlation factors based on market relationships
    const factors: Record<string, Record<string, { geographic: number; economic: number; cultural: number }>> = {
      'india': {
        'nepal': { geographic: 0.8, economic: 0.9, cultural: 0.7 },
        'japan': { geographic: 0.3, economic: 0.4, cultural: 0.2 },
        'china': { geographic: 0.4, economic: 0.6, cultural: 0.3 },
        'korea': { geographic: 0.3, economic: 0.3, cultural: 0.1 },
        'hongkong': { geographic: 0.2, economic: 0.5, cultural: 0.1 },
        'singapore': { geographic: 0.2, economic: 0.6, cultural: 0.1 }
      },
      'japan': {
        'china': { geographic: 0.3, economic: 0.4, cultural: 0.2 },
        'korea': { geographic: 0.5, economic: 0.6, cultural: 0.4 },
        'hongkong': { geographic: 0.2, economic: 0.5, cultural: 0.1 },
        'singapore': { geographic: 0.3, economic: 0.4, cultural: 0.2 },
        'nepal': { geographic: 0.1, economic: 0.1, cultural: 0.0 }
      },
      'china': {
        'korea': { geographic: 0.4, economic: 0.7, cultural: 0.3 },
        'hongkong': { geographic: 0.8, economic: 0.9, cultural: 0.7 },
        'singapore': { geographic: 0.3, economic: 0.6, cultural: 0.2 },
        'nepal': { geographic: 0.2, economic: 0.3, cultural: 0.1 }
      },
      'korea': {
        'hongkong': { geographic: 0.2, economic: 0.5, cultural: 0.1 },
        'singapore': { geographic: 0.3, economic: 0.5, cultural: 0.2 },
        'nepal': { geographic: 0.1, economic: 0.1, cultural: 0.0 }
      },
      'hongkong': {
        'singapore': { geographic: 0.2, economic: 0.6, cultural: 0.3 },
        'nepal': { geographic: 0.1, economic: 0.2, cultural: 0.0 }
      },
      'singapore': {
        'nepal': { geographic: 0.1, economic: 0.2, cultural: 0.0 }
      }
    };

    // Return symmetric factors
    if (factors[market1]?.[market2]) {
      return factors[market1][market2];
    }
    if (factors[market2]?.[market1]) {
      return factors[market2][market1];
    }

    return { geographic: 0.1, economic: 0.2, cultural: 0.0 }; // Default low correlation
  }

  private getMarketVolatility(market: string): number {
    const volatilities: Record<string, number> = {
      'india': 0.18,
      'japan': 0.18,
      'china': 0.25,
      'korea': 0.22,
      'hongkong': 0.20,
      'singapore': 0.15,
      'nepal': 0.30
    };
    return volatilities[market] || 0.20;
  }

  private getMarketFactors(market: string) {
    const factors: Record<string, { volatility: number; sensitivity: number; liquidity: number }> = {
      'india': { volatility: 0.18, sensitivity: 0.7, liquidity: 0.8 },
      'japan': { volatility: 0.18, sensitivity: 0.6, liquidity: 0.9 },
      'china': { volatility: 0.25, sensitivity: 0.8, liquidity: 0.7 },
      'korea': { volatility: 0.22, sensitivity: 0.7, liquidity: 0.8 },
      'hongkong': { volatility: 0.20, sensitivity: 0.9, liquidity: 0.8 },
      'singapore': { volatility: 0.15, sensitivity: 0.5, liquidity: 0.9 },
      'nepal': { volatility: 0.30, sensitivity: 0.4, liquidity: 0.5 }
    };
    return factors[market] || { volatility: 0.20, sensitivity: 0.5, liquidity: 0.7 };
  }
}
