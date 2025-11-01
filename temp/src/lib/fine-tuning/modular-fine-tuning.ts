import { MarketConfig, getMarketConfig } from '../market-config';
import { StockData, TechnicalIndicators, FundamentalData } from '../adapters/nepal-market-adapter';

export interface FineTuningConfig {
  marketId: string;
  modelType: 'lstm' | 'transformer' | 'cnn' | 'hybrid';
  features: string[];
  targetVariable: string;
  timeHorizon: number; // in days
  validationSplit: number;
  batchSize: number;
  epochs: number;
  learningRate: number;
  optimization: 'adam' | 'sgd' | 'rmsprop';
  regularization: {
    type: 'l1' | 'l2' | 'dropout';
    strength: number;
  };
}

export interface TrainingData {
  features: number[][];
  targets: number[];
  timestamps: Date[];
  symbols: string[];
}

export interface ModelMetrics {
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mae: number;
  mse: number;
  rmse: number;
  r2Score: number;
}

export interface FineTuningResult {
  modelId: string;
  marketId: string;
  config: FineTuningConfig;
  metrics: ModelMetrics;
  trainingTime: number;
  modelSize: number;
  createdAt: Date;
  status: 'training' | 'completed' | 'failed' | 'deployed';
}

export class ModularFineTuningArchitecture {
  private models: Map<string, FineTuningResult> = new Map();
  private trainingQueue: FineTuningConfig[] = [];
  private isTraining = false;

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    const defaultConfigs: FineTuningConfig[] = [
      {
        marketId: 'nepal',
        modelType: 'lstm',
        features: ['price', 'volume', 'rsi', 'sma20', 'sma50', 'macd', 'signal'],
        targetVariable: 'price',
        timeHorizon: 7,
        validationSplit: 0.2,
        batchSize: 32,
        epochs: 100,
        learningRate: 0.001,
        optimization: 'adam',
        regularization: {
          type: 'dropout',
          strength: 0.2
        }
      },
      {
        marketId: 'nepal',
        modelType: 'transformer',
        features: ['price', 'volume', 'changePercent', 'pe', 'pb', 'roe'],
        targetVariable: 'changePercent',
        timeHorizon: 14,
        validationSplit: 0.2,
        batchSize: 16,
        epochs: 50,
        learningRate: 0.0001,
        optimization: 'adam',
        regularization: {
          type: 'dropout',
          strength: 0.3
        }
      },
      {
        marketId: 'nepal',
        modelType: 'hybrid',
        features: ['price', 'volume', 'rsi', 'macd', 'pe', 'pb', 'roe', 'debtToEquity'],
        targetVariable: 'price',
        timeHorizon: 30,
        validationSplit: 0.25,
        batchSize: 64,
        epochs: 150,
        learningRate: 0.0005,
        optimization: 'adam',
        regularization: {
          type: 'l2',
          strength: 0.01
        }
      }
    ];

    this.trainingQueue = defaultConfigs;
  }

  async startFineTuning(): Promise<void> {
    if (this.isTraining) {
      throw new Error('Fine-tuning already in progress');
    }

    this.isTraining = true;
    
    while (this.trainingQueue.length > 0) {
      const config = this.trainingQueue.shift()!;
      
      try {
        const result = await this.trainModel(config);
        this.models.set(result.modelId, result);
        console.log(\`Model \${result.modelId} trained successfully for market \${config.marketId}\`);
      } catch (error) {
        console.error(\`Failed to train model for market \${config.marketId}:\`, error);
      }
    }
    
    this.isTraining = false;
  }

  private async trainModel(config: FineTuningConfig): Promise<FineTuningResult> {
    const startTime = Date.now();
    const modelId = this.generateModelId(config);
    
    // Simulate training process
    await this.simulateTraining(config);
    
    const trainingTime = Date.now() - startTime;
    const metrics = this.generateMockMetrics(config);
    
    const result: FineTuningResult = {
      modelId,
      marketId: config.marketId,
      config,
      metrics,
      trainingTime,
      modelSize: this.calculateModelSize(config),
      createdAt: new Date(),
      status: 'completed'
    };
    
    return result;
  }

  private generateModelId(config: FineTuningConfig): string {
    const timestamp = Date.now();
    return \`\${config.marketId}_\${config.modelType}_\${timestamp}\`;
  }

  private async simulateTraining(config: FineTuningConfig): Promise<void> {
    // Simulate training time based on complexity
    const baseTime = 5000; // 5 seconds base
    const complexityMultiplier = {
      'lstm': 1.0,
      'transformer': 2.0,
      'cnn': 1.5,
      'hybrid': 2.5
    };
    
    const trainingTime = baseTime * complexityMultiplier[config.modelType] * (config.epochs / 100);
    await new Promise(resolve => setTimeout(resolve, trainingTime));
  }

  private generateMockMetrics(config: FineTuningConfig): ModelMetrics {
    const baseAccuracy = {
      'lstm': 0.85,
      'transformer': 0.88,
      'cnn': 0.82,
      'hybrid': 0.90
    };
    
    const accuracy = baseAccuracy[config.modelType] + (Math.random() - 0.5) * 0.1;
    
    return {
      loss: 0.1 + Math.random() * 0.2,
      accuracy: Math.max(0, Math.min(1, accuracy)),
      precision: Math.max(0, Math.min(1, accuracy + (Math.random() - 0.5) * 0.05)),
      recall: Math.max(0, Math.min(1, accuracy + (Math.random() - 0.5) * 0.05)),
      f1Score: Math.max(0, Math.min(1, accuracy + (Math.random() - 0.5) * 0.03)),
      mae: Math.random() * 0.1,
      mse: Math.random() * 0.05,
      rmse: Math.random() * 0.2,
      r2Score: Math.max(0, Math.min(1, accuracy + (Math.random() - 0.5) * 0.08))
    };
  }

  private calculateModelSize(config: FineTuningConfig): number {
    const baseSize = {
      'lstm': 10, // MB
      'transformer': 50,
      'cnn': 25,
      'hybrid': 75
    };
    
    return baseSize[config.modelType] * (config.features.length / 10);
  }

  async prepareTrainingData(
    marketId: string,
    stockData: StockData[],
    technicalData: TechnicalIndicators[],
    fundamentalData: FundamentalData[]
  ): Promise<TrainingData> {
    const config = getMarketConfig(marketId);
    if (!config) {
      throw new Error(\`Market configuration not found for: \${marketId}\`);
    }

    // Combine all data sources
    const combinedData = this.combineDataSources(stockData, technicalData, fundamentalData);
    
    // Extract features based on configuration
    const features = this.extractFeatures(combinedData);
    const targets = this.extractTargets(combinedData, 'price');
    
    return {
      features,
      targets,
      timestamps: combinedData.map(d => d.timestamp),
      symbols: combinedData.map(d => d.symbol)
    };
  }

  private combineDataSources(
    stockData: StockData[],
    technicalData: TechnicalIndicators[],
    fundamentalData: FundamentalData[]
  ): Array<{
    symbol: string;
    timestamp: Date;
    price: number;
    volume: number;
    changePercent: number;
    rsi: number;
    sma20: number;
    sma50: number;
    macd: number;
    signal: number;
    pe: number;
    pb: number;
    roe: number;
    debtToEquity: number;
  }> {
    // This is a simplified combination - in practice, you'd need proper data alignment
    const combined: any[] = [];
    
    // For now, create mock combined data
    for (let i = 0; i < Math.min(stockData.length, technicalData.length, fundamentalData.length); i++) {
      combined.push({
        symbol: stockData[i].symbol,
        timestamp: stockData[i].lastUpdated,
        price: stockData[i].price,
        volume: stockData[i].volume,
        changePercent: stockData[i].changePercent,
        rsi: technicalData[i].rsi,
        sma20: technicalData[i].sma20,
        sma50: technicalData[i].sma50,
        macd: technicalData[i].macd,
        signal: technicalData[i].signal,
        pe: fundamentalData[i].pe,
        pb: fundamentalData[i].pb,
        roe: fundamentalData[i].roe,
        debtToEquity: fundamentalData[i].debtToEquity
      });
    }
    
    return combined;
  }

  private extractFeatures(data: any[]): number[][] {
    const features = [
      'price', 'volume', 'changePercent', 'rsi', 'sma20', 'sma50', 'macd', 'signal', 'pe', 'pb', 'roe', 'debtToEquity'
    ];
    
    return data.map(item => features.map(feature => item[feature] || 0));
  }

  private extractTargets(data: any[], targetVariable: string): number[] {
    return data.map(item => item[targetVariable] || 0);
  }

  getModels(): FineTuningResult[] {
    return Array.from(this.models.values());
  }

  getModel(modelId: string): FineTuningResult | undefined {
    return this.models.get(modelId);
  }

  getModelsByMarket(marketId: string): FineTuningResult[] {
    return Array.from(this.models.values()).filter(model => model.marketId === marketId);
  }

  async deployModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(\`Model not found: \${modelId}\`);
    }

    model.status = 'deployed';
    this.models.set(modelId, model);
    
    console.log(\`Model \${modelId} deployed for market \${model.marketId}\`);
  }

  addToTrainingQueue(config: FineTuningConfig): void {
    this.trainingQueue.push(config);
    console.log(\`Added training configuration for market \${config.marketId} to queue\`);
  }

  getTrainingQueue(): FineTuningConfig[] {
    return [...this.trainingQueue];
  }

  isModelTraining(): boolean {
    return this.isTraining;
  }

  generateMarketSpecificConfig(marketId: string): FineTuningConfig {
    const marketConfig = getMarketConfig(marketId);
    if (!marketConfig) {
      throw new Error(\`Market configuration not found for: \${marketId}\`);
    }

    // Generate market-specific configuration based on market characteristics
    const baseConfig: FineTuningConfig = {
      marketId,
      modelType: 'lstm',
      features: ['price', 'volume', 'changePercent'],
      targetVariable: 'price',
      timeHorizon: 7,
      validationSplit: 0.2,
      batchSize: 32,
      epochs: 100,
      learningRate: 0.001,
      optimization: 'adam',
      regularization: {
        type: 'dropout',
        strength: 0.2
      }
    };

    // Adjust configuration based on market characteristics
    if (marketConfig.emergingMarket) {
      // Higher volatility markets need different parameters
      baseConfig.timeHorizon = 5; // Shorter time horizon for volatile markets
      baseConfig.batchSize = 16; // Smaller batch size for better adaptation
      baseConfig.epochs = 150; // More epochs for better learning
      baseConfig.regularization.strength = 0.3; // Stronger regularization
    }

    if (marketId === 'nepal') {
      // Nepal-specific adjustments
      baseConfig.modelType = 'hybrid';
      baseConfig.features = ['price', 'volume', 'changePercent', 'rsi', 'sma20', 'pe', 'pb'];
      baseConfig.timeHorizon = 14;
      baseConfig.learningRate = 0.0005;
    }

    return baseConfig;
  }
}
