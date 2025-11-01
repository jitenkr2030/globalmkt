import { MarketAdapter } from '../adapters/market-adapter';

export interface SentimentScore {
  market: string;
  overallSentiment: number;
  foreignInvestment: number;
  institutional: number;
  retail: number;
  newsSentiment: number;
  socialMedia: number;
  policyImpact: number;
  weight: number;
  weightedSentiment: number;
  lastUpdate: Date;
}

export interface RegionalSentimentIndex {
  indexName: string;
  region: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'rising' | 'falling' | 'stable';
  momentum: 'positive' | 'negative' | 'neutral';
  volatility: number;
  confidence: number;
  contributingMarkets: string[];
  keyDrivers: string[];
  riskFactors: string[];
  lastUpdate: Date;
}

export interface SentimentTrend {
  timeframe: string;
  trend: 'bullish' | 'bearish' | 'neutral' | 'volatile';
  strength: number;
  duration: number;
  acceleration: number;
  keyTurningPoints: Array<{
    date: Date;
    value: number;
    event: string;
  }>;
  forecast: {
    direction: 'up' | 'down' | 'sideways';
    confidence: number;
    timeframe: string;
  };
}

export interface TradingSignal {
  id: string;
  signalType: 'buy' | 'sell' | 'hold' | 'reduce' | 'increase';
  strength: 'weak' | 'moderate' | 'strong';
  market: string;
  timeframe: string;
  sentimentScore: number;
  technicalConfirmation: boolean;
  riskRewardRatio: number;
  confidence: number;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  reasoning: string[];
  riskFactors: string[];
  expiration: Date;
}

export class AsianMarketSentimentIndex {
  private marketAdapters: Map<string, MarketAdapter>;
  private sentimentHistory: Map<string, SentimentScore[]>;
  private indexHistory: RegionalSentimentIndex[];

  constructor() {
    this.marketAdapters = new Map();
    this.sentimentHistory = new Map();
    this.indexHistory = [];
  }

  addMarketAdapter(marketId: string, adapter: MarketAdapter): void {
    this.marketAdapters.set(marketId, adapter);
    // Initialize sentiment history for new market
    if (!this.sentimentHistory.has(marketId)) {
      this.sentimentHistory.set(marketId, []);
    }
  }

  async calculateRegionalSentimentIndex(region: string, marketIds: string[]): Promise<RegionalSentimentIndex> {
    const sentimentScores = await this.collectMarketSentiments(marketIds);
    const previousIndex = this.getPreviousIndexValue(region);
    
    // Calculate weighted sentiment index
    const currentValue = this.calculateWeightedSentimentIndex(sentimentScores);
    const change = currentValue - previousIndex;
    const changePercent = previousIndex !== 0 ? (change / previousIndex) * 100 : 0;
    
    const trend = this.determineTrend(change);
    const momentum = this.calculateMomentum(region, currentValue);
    const volatility = this.calculateIndexVolatility(region);
    const confidence = this.calculateIndexConfidence(sentimentScores);
    
    const contributingMarkets = this.getTopContributingMarkets(sentimentScores);
    const keyDrivers = this.identifyKeyDrivers(sentimentScores);
    const riskFactors = this.identifyRiskFactors(sentimentScores);

    const regionalIndex: RegionalSentimentIndex = {
      indexName: `${region.toUpperCase()} Sentiment Index`,
      region,
      currentValue,
      previousValue: previousIndex,
      change,
      changePercent,
      trend,
      momentum,
      volatility,
      confidence,
      contributingMarkets,
      keyDrivers,
      riskFactors,
      lastUpdate: new Date()
    };

    // Store in history
    this.indexHistory.push(regionalIndex);
    
    return regionalIndex;
  }

  async analyzeSentimentTrends(region: string, timeframe: string = '30d'): Promise<SentimentTrend> {
    const historicalData = this.getIndexHistory(region, timeframe);
    
    if (historicalData.length < 5) {
      throw new Error(`Insufficient historical data for ${region} sentiment trend analysis`);
    }

    const values = historicalData.map(d => d.currentValue);
    const trend = this.determineTrendDirection(values);
    const strength = this.calculateTrendStrength(values);
    const duration = this.calculateTrendDuration(historicalData);
    const acceleration = this.calculateTrendAcceleration(values);
    
    const keyTurningPoints = this.identifyTurningPoints(historicalData);
    const forecast = this.generateSentimentForecast(values, timeframe);

    return {
      timeframe,
      trend,
      strength,
      duration,
      acceleration,
      keyTurningPoints,
      forecast
    };
  }

  async generateSentimentTradingSignals(region: string, marketIds: string[]): Promise<TradingSignal[]> {
    const sentimentScores = await this.collectMarketSentiments(marketIds);
    const regionalIndex = await this.calculateRegionalSentimentIndex(region, marketIds);
    const signals: TradingSignal[] = [];

    for (const marketScore of sentimentScores) {
      const marketSignal = this.generateMarketSignal(marketScore, regionalIndex);
      if (marketSignal) {
        signals.push(marketSignal);
      }
    }

    // Generate regional signals
    const regionalSignal = this.generateRegionalSignal(regionalIndex);
    if (regionalSignal) {
      signals.push(regionalSignal);
    }

    return signals
      .filter(signal => signal.confidence > 0.6) // Filter by confidence threshold
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 15); // Top 15 signals
  }

  async getSentimentHeatmap(region: string): Promise<{
    markets: Array<{
      market: string;
      sentiment: number;
      change: number;
      risk: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
    overallSentiment: number;
    riskLevel: 'low' | 'medium' | 'high';
    lastUpdate: Date;
  }> {
    const marketIds = Array.from(this.marketAdapters.keys()).filter(id => 
      this.getMarketRegion(id) === region
    );
    
    const sentimentScores = await this.collectMarketSentiments(marketIds);
    
    const markets = sentimentScores.map(score => ({
      market: score.market,
      sentiment: score.overallSentiment,
      change: this.calculateSentimentChange(score.market),
      risk: this.getSentimentRiskLevel(score.overallSentiment),
      recommendation: this.getSentimentRecommendation(score.overallSentiment)
    }));

    const overallSentiment = markets.reduce((sum, m) => sum + m.sentiment, 0) / markets.length;
    const riskLevel = this.getOverallRiskLevel(markets);

    return {
      markets,
      overallSentiment,
      riskLevel,
      lastUpdate: new Date()
    };
  }

  private async collectMarketSentiments(marketIds: string[]): Promise<SentimentScore[]> {
    const sentimentScores: SentimentScore[] = [];

    for (const marketId of marketIds) {
      try {
        const adapter = this.marketAdapters.get(marketId);
        if (!adapter) continue;

        const marketSentiment = await adapter.getMarketSentiment();
        const weight = this.getMarketWeight(marketId);
        
        const sentimentScore: SentimentScore = {
          market: marketId,
          overallSentiment: marketSentiment.overall,
          foreignInvestment: marketSentiment.foreignInvestment,
          institutional: marketSentiment.institutional,
          retail: marketSentiment.retail,
          newsSentiment: marketSentiment.newsSentiment,
          socialMedia: marketSentiment.socialMedia,
          policyImpact: marketSentiment.policyImpact,
          weight,
          weightedSentiment: marketSentiment.overall * weight,
          lastUpdate: new Date()
        };

        sentimentScores.push(sentimentScore);

        // Store in history
        const history = this.sentimentHistory.get(marketId) || [];
        history.push(sentimentScore);
        this.sentimentHistory.set(marketId, history.slice(-100)); // Keep last 100 entries

      } catch (error) {
        console.warn(`Failed to collect sentiment for market ${marketId}:`, error);
      }
    }

    return sentimentScores;
  }

  private calculateWeightedSentimentIndex(sentimentScores: SentimentScore[]): number {
    if (sentimentScores.length === 0) return 0;

    const totalWeightedSentiment = sentimentScores.reduce((sum, score) => sum + score.weightedSentiment, 0);
    const totalWeight = sentimentScores.reduce((sum, score) => sum + score.weight, 0);
    
    return totalWeight > 0 ? totalWeightedSentiment / totalWeight : 0;
  }

  private getPreviousIndexValue(region: string): number {
    const previousEntries = this.indexHistory.filter(entry => entry.region === region);
    return previousEntries.length > 0 ? previousEntries[previousEntries.length - 1].currentValue : 50; // Default to neutral
  }

  private determineTrend(change: number): 'rising' | 'falling' | 'stable' {
    const threshold = 0.5; // 0.5% threshold
    if (Math.abs(change) < threshold) return 'stable';
    return change > 0 ? 'rising' : 'falling';
  }

  private calculateMomentum(region: string, currentValue: number): 'positive' | 'negative' | 'neutral' {
    const recentEntries = this.indexHistory
      .filter(entry => entry.region === region)
      .slice(-5); // Last 5 entries

    if (recentEntries.length < 3) return 'neutral';

    const values = [...recentEntries.map(e => e.currentValue), currentValue];
    const trend = this.calculateLinearTrend(values);
    
    if (trend > 0.1) return 'positive';
    if (trend < -0.1) return 'negative';
    return 'neutral';
  }

  private calculateIndexVolatility(region: string): number {
    const entries = this.indexHistory.filter(entry => entry.region === region).slice(-20);
    if (entries.length < 5) return 0.1;

    const values = entries.map(e => e.currentValue);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateIndexConfidence(sentimentScores: SentimentScore[]): number {
    if (sentimentScores.length === 0) return 0;

    // Confidence based on consensus and data quality
    const sentiments = sentimentScores.map(s => s.overallSentiment);
    const mean = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
    
    // Lower variance = higher confidence
    const consensusScore = Math.max(0, 1 - variance);
    const dataQualityScore = sentimentScores.length / 6; // More markets = higher quality
    
    return (consensusScore * 0.7 + dataQualityScore * 0.3);
  }

  private getTopContributingMarkets(sentimentScores: SentimentScore[]): string[] {
    return sentimentScores
      .sort((a, b) => Math.abs(b.weightedSentiment) - Math.abs(a.weightedSentiment))
      .slice(0, 5)
      .map(s => s.market);
  }

  private identifyKeyDrivers(sentimentScores: SentimentScore[]): string[] {
    const drivers = [
      'Foreign Investment Flows',
      'Institutional Activity',
      'Retail Participation',
      'News Sentiment',
      'Social Media Trends',
      'Policy Changes',
      'Economic Indicators',
      'Geopolitical Events',
      'Currency Movements',
      'Commodity Prices'
    ];

    // Analyze which sentiment components are most volatile
    const componentVolatility = this.calculateComponentVolatility(sentimentScores);
    const topDrivers = Object.entries(componentVolatility)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([component]) => component);

    return topDrivers.map(component => {
      const driverMap: Record<string, string> = {
        'foreignInvestment': 'Foreign Investment Flows',
        'institutional': 'Institutional Activity',
        'retail': 'Retail Participation',
        'newsSentiment': 'News Sentiment',
        'socialMedia': 'Social Media Trends',
        'policyImpact': 'Policy Changes'
      };
      return driverMap[component] || component;
    });
  }

  private identifyRiskFactors(sentimentScores: SentimentScore[]): string[] {
    const riskFactors = [
      'Sentiment Divergence',
      'Low Confidence Levels',
      'High Volatility',
      'Policy Uncertainty',
      'Geopolitical Risks',
      'Economic Slowdown',
      'Market Correction Risk',
      'Liquidity Concerns'
    ];

    const avgSentiment = sentimentScores.reduce((sum, s) => sum + s.overallSentiment, 0) / sentimentScores.length;
    const sentimentVariance = this.calculateVariance(sentimentScores.map(s => s.overallSentiment));
    
    // Select risk factors based on current conditions
    const selectedFactors: string[] = [];
    
    if (sentimentVariance > 0.1) selectedFactors.push('Sentiment Divergence');
    if (avgSentiment < 0.3 || avgSentiment > 0.7) selectedFactors.push('Extreme Sentiment');
    if (sentimentScores.some(s => s.overallSentiment < 0.2)) selectedFactors.push('Bearish Signals');
    if (sentimentScores.some(s => s.overallSentiment > 0.8)) selectedFactors.push('Overbought Conditions');
    
    return selectedFactors.length > 0 ? selectedFactors : riskFactors.slice(0, 2);
  }

  private determineTrendDirection(values: number[]): 'bullish' | 'bearish' | 'neutral' | 'volatile' {
    if (values.length < 5) return 'neutral';

    const trend = this.calculateLinearTrend(values);
    const volatility = this.calculateVolatility(values);
    
    if (volatility > 0.15) return 'volatile';
    if (trend > 0.05) return 'bullish';
    if (trend < -0.05) return 'bearish';
    return 'neutral';
  }

  private calculateTrendStrength(values: number[]): number {
    const trend = this.calculateLinearTrend(values);
    return Math.min(1, Math.abs(trend) * 10); // Normalize to 0-1
  }

  private calculateTrendDuration(historicalData: RegionalSentimentIndex[]): number {
    if (historicalData.length < 2) return 0;

    let duration = 1;
    const currentTrend = historicalData[historicalData.length - 1].trend;
    
    for (let i = historicalData.length - 2; i >= 0; i--) {
      if (historicalData[i].trend === currentTrend) {
        duration++;
      } else {
        break;
      }
    }

    return duration;
  }

  private calculateTrendAcceleration(values: number[]): number {
    if (values.length < 5) return 0;

    // Calculate second derivative (acceleration)
    const firstDerivatives = [];
    for (let i = 1; i < values.length; i++) {
      firstDerivatives.push(values[i] - values[i-1]);
    }

    const secondDerivatives = [];
    for (let i = 1; i < firstDerivatives.length; i++) {
      secondDerivatives.push(firstDerivatives[i] - firstDerivatives[i-1]);
    }

    return secondDerivatives.length > 0 ? 
      secondDerivatives.reduce((sum, val) => sum + val, 0) / secondDerivatives.length : 0;
  }

  private identifyTurningPoints(historicalData: RegionalSentimentIndex[]): Array<{
    date: Date;
    value: number;
    event: string;
  }> {
    const turningPoints: Array<{ date: Date; value: number; event: string }> = [];
    
    if (historicalData.length < 5) return turningPoints;

    for (let i = 2; i < historicalData.length - 2; i++) {
      const current = historicalData[i];
      const previous = historicalData[i-1];
      const next = historicalData[i+1];

      // Check for local maximum or minimum
      const isLocalMax = current.currentValue > previous.currentValue && 
                       current.currentValue > next.currentValue;
      const isLocalMin = current.currentValue < previous.currentValue && 
                       current.currentValue < next.currentValue;

      if (isLocalMax || isLocalMin) {
        turningPoints.push({
          date: current.lastUpdate,
          value: current.currentValue,
          event: isLocalMax ? 'Local Maximum' : 'Local Minimum'
        });
      }
    }

    return turningPoints.slice(-5); // Return last 5 turning points
  }

  private generateSentimentForecast(values: number[], timeframe: string): {
    direction: 'up' | 'down' | 'sideways';
    confidence: number;
    timeframe: string;
  } {
    if (values.length < 5) {
      return { direction: 'sideways', confidence: 0.3, timeframe };
    }

    const trend = this.calculateLinearTrend(values);
    const volatility = this.calculateVolatility(values);
    
    let direction: 'up' | 'down' | 'sideways';
    if (Math.abs(trend) < volatility * 0.5) {
      direction = 'sideways';
    } else {
      direction = trend > 0 ? 'up' : 'down';
    }

    // Confidence based on trend strength and consistency
    const trendStrength = Math.abs(trend) / volatility;
    const confidence = Math.min(0.9, Math.max(0.3, trendStrength));

    return { direction, confidence, timeframe };
  }

  private generateMarketSignal(marketScore: SentimentScore, regionalIndex: RegionalSentimentIndex): TradingSignal | null {
    const sentiment = marketScore.overallSentiment;
    const regionalSentiment = regionalIndex.currentValue;
    
    let signalType: TradingSignal['signalType'] = 'hold';
    let strength: TradingSignal['strength'] = 'moderate';
    let confidence = 0.5;

    // Generate signal based on sentiment analysis
    if (sentiment > 0.7 && regionalSentiment > 0.6) {
      signalType = 'buy';
      strength = 'strong';
      confidence = 0.8;
    } else if (sentiment > 0.6 && regionalSentiment > 0.5) {
      signalType = 'buy';
      strength = 'moderate';
      confidence = 0.65;
    } else if (sentiment < 0.3 && regionalSentiment < 0.4) {
      signalType = 'sell';
      strength = 'strong';
      confidence = 0.8;
    } else if (sentiment < 0.4 && regionalSentiment < 0.5) {
      signalType = 'sell';
      strength = 'moderate';
      confidence = 0.65;
    } else if (Math.abs(sentiment - 0.5) < 0.1) {
      signalType = 'hold';
      strength = 'moderate';
      confidence = 0.6;
    }

    if (confidence < 0.6) return null; // Filter low confidence signals

    return {
      id: `signal_${marketScore.market}_${Date.now()}`,
      signalType,
      strength,
      market: marketScore.market,
      timeframe: '1d',
      sentimentScore: sentiment,
      technicalConfirmation: this.checkTechnicalConfirmation(marketScore.market),
      riskRewardRatio: this.calculateRiskRewardRatio(signalType, marketScore.market),
      confidence,
      reasoning: this.generateSignalReasoning(signalType, sentiment, regionalSentiment),
      riskFactors: this.generateSignalRiskFactors(marketScore.market),
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }

  private generateRegionalSignal(regionalIndex: RegionalSentimentIndex): TradingSignal | null {
    const sentiment = regionalIndex.currentValue;
    
    let signalType: TradingSignal['signalType'] = 'hold';
    let strength: TradingSignal['strength'] = 'moderate';
    let confidence = 0.5;

    if (sentiment > 0.7) {
      signalType = 'increase';
      strength = 'strong';
      confidence = 0.75;
    } else if (sentiment > 0.6) {
      signalType = 'increase';
      strength = 'moderate';
      confidence = 0.65;
    } else if (sentiment < 0.3) {
      signalType = 'reduce';
      strength = 'strong';
      confidence = 0.75;
    } else if (sentiment < 0.4) {
      signalType = 'reduce';
      strength = 'moderate';
      confidence = 0.65;
    }

    if (confidence < 0.6) return null;

    return {
      id: `regional_signal_${regionalIndex.region}_${Date.now()}`,
      signalType,
      strength,
      market: regionalIndex.region,
      timeframe: '1d',
      sentimentScore: sentiment,
      technicalConfirmation: true,
      riskRewardRatio: this.calculateRegionalRiskRewardRatio(signalType, regionalIndex),
      confidence,
      reasoning: this.generateRegionalSignalReasoning(signalType, sentiment, regionalIndex),
      riskFactors: this.generateRegionalSignalRiskFactors(regionalIndex),
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  // Helper methods
  private getIndexHistory(region: string, timeframe: string): RegionalSentimentIndex[] {
    const days = parseInt(timeframe.replace('d', '')) || 30;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.indexHistory
      .filter(entry => entry.region === region && entry.lastUpdate >= cutoffDate)
      .sort((a, b) => a.lastUpdate.getTime() - b.lastUpdate.getTime());
  }

  private calculateLinearTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateComponentVolatility(sentimentScores: SentimentScore[]): Record<string, number> {
    const components = ['foreignInvestment', 'institutional', 'retail', 'newsSentiment', 'socialMedia', 'policyImpact'];
    const volatility: Record<string, number> = {};

    components.forEach(component => {
      const values = sentimentScores.map(s => s[component as keyof SentimentScore] as number);
      volatility[component] = this.calculateVolatility(values);
    });

    return volatility;
  }

  private calculateSentimentChange(market: string): number {
    const history = this.sentimentHistory.get(market) || [];
    if (history.length < 2) return 0;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];
    
    return current.overallSentiment - previous.overallSentiment;
  }

  private getSentimentRiskLevel(sentiment: number): 'low' | 'medium' | 'high' {
    if (sentiment < 0.3 || sentiment > 0.7) return 'high';
    if (sentiment < 0.4 || sentiment > 0.6) return 'medium';
    return 'low';
  }

  private getSentimentRecommendation(sentiment: number): string {
    if (sentiment > 0.6) return 'Buy';
    if (sentiment < 0.4) return 'Sell';
    return 'Hold';
  }

  private getOverallRiskLevel(markets: Array<{ sentiment: number; risk: string }>): 'low' | 'medium' | 'high' {
    const highRiskCount = markets.filter(m => m.risk === 'high').length;
    const riskRatio = highRiskCount / markets.length;
    
    if (riskRatio > 0.5) return 'high';
    if (riskRatio > 0.25) return 'medium';
    return 'low';
  }

  private getMarketRegion(market: string): string {
    const regionMap: Record<string, string> = {
      'india': 'south_asia',
      'japan': 'east_asia',
      'china': 'east_asia',
      'korea': 'east_asia',
      'hongkong': 'east_asia',
      'singapore': 'southeast_asia',
      'nepal': 'south_asia'
    };
    return regionMap[market] || 'asia';
  }

  private getMarketWeight(market: string): number {
    const weights: Record<string, number> = {
      'india': 0.35,
      'japan': 0.20,
      'china': 0.25,
      'korea': 0.12,
      'hongkong': 0.10,
      'singapore': 0.08,
      'nepal': 0.05
    };
    return weights[market] || 0.1;
  }

  private checkTechnicalConfirmation(market: string): boolean {
    // Simulate technical analysis confirmation
    return Math.random() > 0.3; // 70% chance of confirmation
  }

  private calculateRiskRewardRatio(signalType: string, market: string): number {
    // Simulate risk/reward ratio calculation
    const baseRatio = {
      'buy': 2.5,
      'sell': 2.0,
      'hold': 1.0,
      'reduce': 1.8,
      'increase': 2.2
    };
    return baseRatio[signalType] || 1.5;
  }

  private calculateRegionalRiskRewardRatio(signalType: string, regionalIndex: RegionalSentimentIndex): number {
    const baseRatio = this.calculateRiskRewardRatio(signalType, regionalIndex.region);
    const adjustment = regionalIndex.confidence * 0.5; // Adjust based on confidence
    return baseRatio + adjustment;
  }

  private generateSignalReasoning(signalType: string, sentiment: number, regionalSentiment: number): string[] {
    const reasoning: Record<string, string[]> = {
      'buy': [
        'Strong positive sentiment detected',
        'Regional sentiment supports bullish outlook',
        'Market momentum appears favorable',
        'Risk-reward ratio attractive'
      ],
      'sell': [
        'Negative sentiment indicators',
        'Regional sentiment showing weakness',
        'Market momentum declining',
        'Risk management considerations'
      ],
      'hold': [
        'Neutral sentiment conditions',
        'Market in consolidation phase',
        'Awaiting clearer signals',
        'Balanced risk-reward profile'
      ],
      'reduce': [
        'Regional sentiment deterioration',
        'Risk management priority',
        'Defensive positioning recommended',
        'Preserving capital'
      ],
      'increase': [
        'Regional sentiment improvement',
        'Growth opportunities identified',
        'Confidence in regional outlook',
        'Strategic allocation increase'
      ]
    };

    return reasoning[signalType] || reasoning['hold'];
  }

  private generateRegionalSignalReasoning(signalType: string, sentiment: number, regionalIndex: RegionalSentimentIndex): string[] {
    const baseReasoning = this.generateSignalReasoning(signalType, sentiment, regionalIndex.currentValue);
    const regionalReasoning = [
      `Regional trend: ${regionalIndex.trend}`,
      `Momentum: ${regionalIndex.momentum}`,
      `Confidence level: ${(regionalIndex.confidence * 100).toFixed(1)}%`
    ];
    
    return [...baseReasoning.slice(0, 2), ...regionalReasoning];
  }

  private generateSignalRiskFactors(market: string): string[] {
    const factors = [
      'Market volatility',
      'Sentiment reversal risk',
      'Liquidity constraints',
      'External shocks',
      'Technical failure',
      'Execution risk'
    ];

    return factors.slice(0, 3 + Math.floor(Math.random() * 2));
  }

  private generateRegionalSignalRiskFactors(regionalIndex: RegionalSentimentIndex): string[] {
    const baseFactors = this.generateSignalRiskFactors(regionalIndex.region);
    const regionalFactors = [
      'Regional contagion risk',
      'Cross-market correlation',
      'Systemic risk factors',
      'Regional policy changes'
    ];

    return [...baseFactors.slice(0, 2), ...regionalFactors.slice(0, 2)];
  }
}
