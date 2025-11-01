import { MarketConfig, getMarketConfig } from '../market-config';
import { StockData, TechnicalIndicators, FundamentalData } from '../adapters/nepal-market-adapter';

export interface ModelPrediction {
  symbol: string;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  predictionDate: Date;
  factors: {
    technical: number;
    fundamental: number;
    market: number;
    sentiment: number;
  };
}

export interface ModelInput {
  symbol: string;
  historicalData: StockData[];
  technicalIndicators: TechnicalIndicators[];
  fundamentalData: FundamentalData[];
  marketContext: {
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    volatility: number;
    volume: number;
    sentiment: number;
  };
}

export interface ModelWeights {
  technical: number;
  fundamental: number;
  market: number;
  sentiment: number;
}

export class BaseKronosModel {
  protected marketConfig: MarketConfig;
  protected weights: ModelWeights;
  protected modelVersion: string;
  protected lastTrained: Date;

  constructor(marketId: string) {
    const config = getMarketConfig(marketId);
    if (!config) {
      throw new Error(`Market configuration not found for: ${marketId}`);
    }
    
    this.marketConfig = config;
    this.modelVersion = '1.0.0';
    this.lastTrained = new Date();
    this.weights = this.initializeWeights(marketId);
  }

  private initializeWeights(marketId: string): ModelWeights {
    // Initialize weights based on market characteristics
    const baseWeights: ModelWeights = {
      technical: 0.4,
      fundamental: 0.3,
      market: 0.2,
      sentiment: 0.1
    };

    // Adjust weights for different markets
    switch (marketId) {
      case 'nepal':
        // Nepal market relies more on fundamental analysis
        return {
          technical: 0.3,
          fundamental: 0.4,
          market: 0.2,
          sentiment: 0.1
        };
      
      case 'japan':
        // Japan market is more technical analysis driven
        return {
          technical: 0.5,
          fundamental: 0.2,
          market: 0.2,
          sentiment: 0.1
        };
      
      case 'china':
        // China market has strong market sentiment influence
        return {
          technical: 0.3,
          fundamental: 0.3,
          market: 0.2,
          sentiment: 0.2
        };
      
      default:
        return baseWeights;
    }
  }

  async predict(input: ModelInput): Promise<ModelPrediction> {
    // Validate input
    this.validateInput(input);
    
    // Calculate individual factor scores
    const technicalScore = this.calculateTechnicalScore(input);
    const fundamentalScore = this.calculateFundamentalScore(input);
    const marketScore = this.calculateMarketScore(input);
    const sentimentScore = this.calculateSentimentScore(input);
    
    // Combine scores using weights
    const combinedScore = this.combineScores(
      technicalScore,
      fundamentalScore,
      marketScore,
      sentimentScore
    );
    
    // Generate prediction
    const prediction = this.generatePrediction(input, combinedScore);
    
    return prediction;
  }

  private validateInput(input: ModelInput): void {
    if (!input.symbol) {
      throw new Error('Symbol is required');
    }
    
    if (input.historicalData.length < 30) {
      throw new Error('Insufficient historical data (minimum 30 days required)');
    }
    
    if (input.technicalIndicators.length === 0) {
      throw new Error('Technical indicators are required');
    }
    
    if (input.fundamentalData.length === 0) {
      throw new Error('Fundamental data are required');
    }
  }

  private calculateTechnicalScore(input: ModelInput): number {
    const latest = input.technicalIndicators[input.technicalIndicators.length - 1];
    
    // RSI scoring
    let rsiScore = 0;
    if (latest.rsi < 30) rsiScore = 0.8; // Oversold
    else if (latest.rsi > 70) rsiScore = 0.2; // Overbought
    else rsiScore = 0.5; // Neutral
    
    // MACD scoring
    const macdScore = latest.macd > latest.signal ? 0.7 : 0.3;
    
    // Moving average scoring
    const maScore = latest.sma20 > latest.sma50 ? 0.6 : 0.4;
    
    // Bollinger Bands scoring
    const bbPosition = (latest.price - latest.lowerBand) / (latest.upperBand - latest.lowerBand);
    const bbScore = bbPosition < 0.2 ? 0.8 : bbPosition > 0.8 ? 0.2 : 0.5;
    
    // Combine technical scores
    return (rsiScore + macdScore + maScore + bbScore) / 4;
  }

  private calculateFundamentalScore(input: ModelInput): number {
    const latest = input.fundamentalData[input.fundamentalData.length - 1];
    
    // P/E ratio scoring
    let peScore = 0;
    if (latest.pe < 10) peScore = 0.8; // Undervalued
    else if (latest.pe > 25) peScore = 0.2; // Overvalued
    else peScore = 0.5; // Fair value
    
    // P/B ratio scoring
    let pbScore = 0;
    if (latest.pb < 1) pbScore = 0.8; // Undervalued
    else if (latest.pb > 3) pbScore = 0.2; // Overvalued
    else pbScore = 0.5; // Fair value
    
    // ROE scoring
    const roeScore = Math.min(1, latest.roe / 20); // Normalize to 0-1
    
    // Dividend yield scoring
    const dividendScore = Math.min(1, latest.dividendYield / 10); // Normalize to 0-1
    
    // Combine fundamental scores
    return (peScore + pbScore + roeScore + dividendScore) / 4;
  }

  private calculateMarketScore(input: ModelInput): number {
    const market = input.marketContext;
    
    // Market trend scoring
    const trendScore = market.marketTrend === 'bullish' ? 0.7 : 
                      market.marketTrend === 'bearish' ? 0.3 : 0.5;
    
    // Volatility scoring (lower volatility is better for prediction)
    const volatilityScore = Math.max(0, 1 - (market.volatility / 0.1));
    
    // Volume scoring
    const volumeScore = Math.min(1, market.volume / 1000000); // Normalize
    
    // Combine market scores
    return (trendScore + volatilityScore + volumeScore) / 3;
  }

  private calculateSentimentScore(input: ModelInput): number {
    const sentiment = input.marketContext.sentiment;
    
    // Normalize sentiment to 0-1 range
    return Math.max(0, Math.min(1, (sentiment + 1) / 2));
  }

  private combineScores(
    technical: number,
    fundamental: number,
    market: number,
    sentiment: number
  ): number {
    return (
      technical * this.weights.technical +
      fundamental * this.weights.fundamental +
      market * this.weights.market +
      sentiment * this.weights.sentiment
    );
  }

  private generatePrediction(input: ModelInput, combinedScore: number): ModelPrediction {
    const latestPrice = input.historicalData[input.historicalData.length - 1].price;
    
    // Calculate price change based on combined score
    const priceChangePercent = (combinedScore - 0.5) * 0.1; // ±5% max change
    const predictedPrice = latestPrice * (1 + priceChangePercent);
    
    // Calculate confidence based on data quality and score consistency
    const confidence = this.calculateConfidence(input, combinedScore);
    
    return {
      symbol: input.symbol,
      predictedPrice,
      confidence,
      timeframe: '7 days',
      predictionDate: new Date(),
      factors: {
        technical: this.calculateTechnicalScore(input),
        fundamental: this.calculateFundamentalScore(input),
        market: this.calculateMarketScore(input),
        sentiment: this.calculateSentimentScore(input)
      }
    };
  }

  private calculateConfidence(input: ModelInput, combinedScore: number): number {
    // Base confidence on data quality
    let confidence = 0.5;
    
    // More historical data increases confidence
    if (input.historicalData.length > 100) confidence += 0.1;
    else if (input.historicalData.length > 50) confidence += 0.05;
    
    // Consistent technical indicators increase confidence
    const technicalVariance = this.calculateVariance(
      input.technicalIndicators.map(t => t.rsi)
    );
    if (technicalVariance < 100) confidence += 0.1;
    
    // Stable fundamental data increases confidence
    const fundamentalVariance = this.calculateVariance(
      input.fundamentalData.map(f => f.pe)
    );
    if (fundamentalVariance < 5) confidence += 0.1;
    
    // Extreme scores reduce confidence
    if (combinedScore < 0.2 || combinedScore > 0.8) confidence -= 0.1;
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  updateWeights(newWeights: ModelWeights): void {
    // Validate weights sum to 1
    const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 1.0) > 0.01) {
      throw new Error('Weights must sum to 1.0');
    }
    
    this.weights = newWeights;
  }

  getWeights(): ModelWeights {
    return { ...this.weights };
  }

  getModelVersion(): string {
    return this.modelVersion;
  }

  getLastTrained(): Date {
    return this.lastTrained;
  }

  async trainModel(trainingData: ModelInput[]): Promise<void> {
    // Simulate model training
    console.log(`Training model for market ${this.marketConfig.id}...`);
    
    // In a real implementation, this would involve:
    // 1. Data preprocessing
    // 2. Feature engineering
    // 3. Model training with neural networks
    // 4. Hyperparameter optimization
    // 5. Model validation
    
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.lastTrained = new Date();
    console.log(`Model training completed for market ${this.marketConfig.id}`);
  }

  async evaluateModel(testData: ModelInput[]): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }> {
    // Simulate model evaluation
    console.log(`Evaluating model for market ${this.marketConfig.id}...`);
    
    // In a real implementation, this would:
    // 1. Make predictions on test data
    // 2. Compare predictions with actual values
    // 3. Calculate evaluation metrics
    
    // Simulate evaluation time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock evaluation metrics
    return {
      accuracy: 0.85 + Math.random() * 0.1,
      precision: 0.82 + Math.random() * 0.1,
      recall: 0.80 + Math.random() * 0.15,
      f1Score: 0.81 + Math.random() * 0.12
    };
  }

  async saveModel(): Promise<string> {
    // Simulate model saving
    const modelId = `${this.marketConfig.id}_${this.modelVersion}_${Date.now()}`;
    console.log(`Model saved with ID: ${modelId}`);
    return modelId;
  }

  async loadModel(modelId: string): Promise<void> {
    // Simulate model loading
    console.log(`Loading model: ${modelId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Model loaded successfully`);
  }

  getMarketConfig(): MarketConfig {
    return this.marketConfig;
  }

  clone(): BaseKronosModel {
    const cloned = new BaseKronosModel(this.marketConfig.id);
    cloned.weights = { ...this.weights };
    cloned.modelVersion = this.modelVersion;
    cloned.lastTrained = new Date(this.lastTrained);
    return cloned;
  }
}
