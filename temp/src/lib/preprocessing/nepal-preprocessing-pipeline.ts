import { StockData, TechnicalIndicators, FundamentalData } from '../adapters/nepal-market-adapter';
import { MarketConfig, getMarketConfig } from '../market-config';

export interface PreprocessingConfig {
  marketId: string;
  normalizePrices: boolean;
  handleMissingData: boolean;
  removeOutliers: boolean;
  smoothData: boolean;
  featureEngineering: boolean;
  timezone: string;
}

export interface ProcessedData {
  symbol: string;
  processedPrice: number;
  processedVolume: number;
  normalizedPrice?: number;
  normalizedVolume?: number;
  outlierRemoved: boolean;
  smoothed: boolean;
  timestamp: Date;
  features?: Record<string, number>;
}

export interface PreprocessingStats {
  originalDataPoints: number;
  processedDataPoints: number;
  outliersRemoved: number;
  missingValuesHandled: number;
  processingTime: number;
  dataQualityScore: number;
}

export class NepalPreprocessingPipeline {
  private config: PreprocessingConfig;
  private marketConfig: MarketConfig;
  private stats: PreprocessingStats;

  constructor(config: PreprocessingConfig) {
    this.config = config;
    this.marketConfig = getMarketConfig(config.marketId)!;
    this.stats = {
      originalDataPoints: 0,
      processedDataPoints: 0,
      outliersRemoved: 0,
      missingValuesHandled: 0,
      processingTime: 0,
      dataQualityScore: 0
    };
  }

  async preprocessStockData(stockData: StockData[]): Promise<ProcessedData[]> {
    const startTime = Date.now();
    this.stats.originalDataPoints = stockData.length;

    let processedData: ProcessedData[] = stockData.map(data => ({
      symbol: data.symbol,
      processedPrice: data.price,
      processedVolume: data.volume,
      outlierRemoved: false,
      smoothed: false,
      timestamp: data.lastUpdated
    }));

    // Step 1: Handle missing data
    if (this.config.handleMissingData) {
      processedData = this.handleMissingData(processedData);
    }

    // Step 2: Remove outliers
    if (this.config.removeOutliers) {
      processedData = this.removeOutliers(processedData);
    }

    // Step 3: Smooth data
    if (this.config.smoothData) {
      processedData = this.smoothData(processedData);
    }

    // Step 4: Normalize data
    if (this.config.normalizePrices) {
      processedData = this.normalizeData(processedData);
    }

    // Step 5: Feature engineering
    if (this.config.featureEngineering) {
      processedData = this.engineerFeatures(processedData);
    }

    // Step 6: Apply timezone conversion
    processedData = this.convertTimezone(processedData);

    this.stats.processedDataPoints = processedData.length;
    this.stats.processingTime = Date.now() - startTime;
    this.stats.dataQualityScore = this.calculateDataQualityScore(processedData);

    return processedData;
  }

  private handleMissingData(data: ProcessedData[]): ProcessedData[] {
    const processed = [...data];
    let handledCount = 0;

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];

      // Handle missing price values
      if (item.processedPrice <= 0 || isNaN(item.processedPrice)) {
        if (i > 0 && i < processed.length - 1) {
          // Linear interpolation
          const prevPrice = processed[i - 1].processedPrice;
          const nextPrice = processed[i + 1].processedPrice;
          item.processedPrice = (prevPrice + nextPrice) / 2;
          handledCount++;
        } else if (i > 0) {
          // Use previous value
          item.processedPrice = processed[i - 1].processedPrice;
          handledCount++;
        } else if (i < processed.length - 1) {
          // Use next value
          item.processedPrice = processed[i + 1].processedPrice;
          handledCount++;
        }
      }

      // Handle missing volume values
      if (item.processedVolume <= 0 || isNaN(item.processedVolume)) {
        if (i > 0) {
          // Use median of recent values
          const recentVolumes = processed
            .slice(Math.max(0, i - 5), i)
            .filter(d => d.processedVolume > 0)
            .map(d => d.processedVolume);
          
          if (recentVolumes.length > 0) {
            item.processedVolume = this.calculateMedian(recentVolumes);
            handledCount++;
          }
        }
      }
    }

    this.stats.missingValuesHandled += handledCount;
    return processed;
  }

  private removeOutliers(data: ProcessedData[]): ProcessedData[] {
    const processed = [...data];
    let removedCount = 0;

    // Calculate price outliers using IQR method
    const prices = processed.map(d => d.processedPrice).filter(p => p > 0);
    const q1 = this.calculatePercentile(prices, 25);
    const q3 = this.calculatePercentile(prices, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Calculate volume outliers
    const volumes = processed.map(d => d.processedVolume).filter(v => v > 0);
    const volQ1 = this.calculatePercentile(volumes, 25);
    const volQ3 = this.calculatePercentile(volumes, 75);
    const volIqr = volQ3 - volQ1;
    const volLowerBound = volQ1 - 1.5 * volIqr;
    const volUpperBound = volQ3 + 1.5 * volIqr;

    // Mark outliers
    for (const item of processed) {
      const isPriceOutlier = item.processedPrice < lowerBound || item.processedPrice > upperBound;
      const isVolumeOutlier = item.processedVolume < volLowerBound || item.processedVolume > volUpperBound;
      
      if (isPriceOutlier || isVolumeOutlier) {
        // For Nepal market, we're more lenient due to higher volatility
        if (Math.abs(item.processedPrice - (q1 + q3) / 2) > 2 * iqr) {
          item.outlierRemoved = true;
          removedCount++;
        }
      }
    }

    this.stats.outliersRemoved += removedCount;
    return processed;
  }

  private smoothData(data: ProcessedData[]): ProcessedData[] {
    const processed = [...data];
    const windowSize = 3; // 3-period moving average

    for (let i = windowSize - 1; i < processed.length; i++) {
      const window = processed.slice(i - windowSize + 1, i + 1);
      
      // Smooth price
      const avgPrice = window.reduce((sum, item) => sum + item.processedPrice, 0) / windowSize;
      processed[i].processedPrice = avgPrice;
      
      // Smooth volume
      const avgVolume = window.reduce((sum, item) => sum + item.processedVolume, 0) / windowSize;
      processed[i].processedVolume = avgVolume;
      
      processed[i].smoothed = true;
    }

    return processed;
  }

  private normalizeData(data: ProcessedData[]): ProcessedData[] {
    const processed = [...data];
    
    // Find min and max values for normalization
    const prices = processed.map(d => d.processedPrice);
    const volumes = processed.map(d => d.processedVolume);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minVolume = Math.min(...volumes);
    const maxVolume = Math.max(...volumes);

    // Apply min-max normalization
    for (const item of processed) {
      item.normalizedPrice = (item.processedPrice - minPrice) / (maxPrice - minPrice);
      item.normalizedVolume = (item.processedVolume - minVolume) / (maxVolume - minVolume);
    }

    return processed;
  }

  private engineerFeatures(data: ProcessedData[]): ProcessedData[] {
    const processed = [...data];

    for (let i = 1; i < processed.length; i++) {
      const current = processed[i];
      const previous = processed[i - 1];
      
      const features: Record<string, number> = {};
      
      // Price change features
      features.priceChange = current.processedPrice - previous.processedPrice;
      features.priceChangePercent = (features.priceChange / previous.processedPrice) * 100;
      
      // Volume change features
      features.volumeChange = current.processedVolume - previous.processedVolume;
      features.volumeChangePercent = (features.volumeChange / previous.processedVolume) * 100;
      
      // Volatility features (using recent data)
      const recentPrices = processed
        .slice(Math.max(0, i - 5), i + 1)
        .map(d => d.processedPrice);
      features.volatility = this.calculateStandardDeviation(recentPrices);
      
      // Price momentum
      features.momentum = this.calculateMomentum(processed.slice(Math.max(0, i - 3), i + 1));
      
      // Relative strength (simplified)
      const recentMarketPrices = processed
        .slice(Math.max(0, i - 10), i + 1)
        .map(d => d.processedPrice);
      features.relativeStrength = current.processedPrice / this.calculateMean(recentMarketPrices);
      
      // Nepal-specific features
      features.nepalMarketAdjusted = this.applyNepalMarketAdjustments(current, features);
      
      current.features = features;
    }

    return processed;
  }

  private convertTimezone(data: ProcessedData[]): ProcessedData[] {
    const processed = [...data];
    
    for (const item of processed) {
      // Convert timestamp to Nepal timezone if needed
      if (this.config.timezone !== 'Asia/Kathmandu') {
        // In a real implementation, you would use a timezone library
        // For now, we'll just ensure the timestamp is properly formatted
        item.timestamp = new Date(item.timestamp);
      }
    }

    return processed;
  }

  private applyNepalMarketAdjustments(data: ProcessedData, features: Record<string, number>): number {
    // Apply Nepal-specific market adjustments
    let adjustedValue = 1.0;
    
    // Adjust for Nepal's higher volatility
    if (Math.abs(features.priceChangePercent) > 3.5) {
      adjustedValue *= 0.9; // Reduce confidence for extreme movements
    }
    
    // Adjust for low liquidity periods
    if (data.processedVolume < 1000) {
      adjustedValue *= 0.8; // Reduce confidence for low volume
    }
    
    // Adjust for market hours (Nepal market: 11:00-15:00)
    const hour = data.timestamp.getHours();
    const minute = data.timestamp.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    if (timeInMinutes < 660 || timeInMinutes > 900) { // Outside market hours
      adjustedValue *= 0.7; // Reduce confidence for off-hours data
    }
    
    return adjustedValue;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateMomentum(values: ProcessedData[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0].processedPrice;
    const last = values[values.length - 1].processedPrice;
    return (last - first) / first;
  }

  private calculateDataQualityScore(data: ProcessedData[]): number {
    let score = 1.0;
    
    // Deduct for missing data
    const missingDataRatio = this.stats.missingValuesHandled / this.stats.originalDataPoints;
    score -= missingDataRatio * 0.3;
    
    // Deduct for outliers
    const outlierRatio = this.stats.outliersRemoved / this.stats.originalDataPoints;
    score -= outlierRatio * 0.2;
    
    // Deduct for data consistency issues
    const priceChanges = data.slice(1).map((item, i) => 
      Math.abs(item.processedPrice - data[i].processedPrice) / data[i].processedPrice
    );
    const avgChange = this.calculateMean(priceChanges);
    if (avgChange > 0.05) { // More than 5% average change
      score -= 0.2;
    }
    
    return Math.max(0, Math.min(1, score));
  }

  getStats(): PreprocessingStats {
    return { ...this.stats };
  }

  getConfig(): PreprocessingConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PreprocessingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  async preprocessTechnicalIndicators(technicalData: TechnicalIndicators[]): Promise<TechnicalIndicators[]> {
    // Preprocess technical indicators with Nepal-specific adjustments
    const processed = [...technicalData];
    
    for (const indicators of processed) {
      // Normalize RSI to handle Nepal's higher volatility
      if (indicators.rsi > 100) indicators.rsi = 100;
      if (indicators.rsi < 0) indicators.rsi = 0;
      
      // Adjust MACD for Nepal market conditions
      indicators.macd *= 0.8; // Reduce MACD sensitivity for emerging market
      
      // Smooth Bollinger Bands for Nepal's volatility
      const bandWidth = indicators.upperBand - indicators.lowerBand;
      indicators.upperBand = indicators.middleBand + (bandWidth * 0.9);
      indicators.lowerBand = indicators.middleBand - (bandWidth * 0.9);
    }
    
    return processed;
  }

  async preprocessFundamentalData(fundamentalData: FundamentalData[]): Promise<FundamentalData[]> {
    // Preprocess fundamental data with Nepal-specific adjustments
    const processed = [...fundamentalData];
    
    for (const data of processed) {
      // Adjust P/E ratio for Nepal's emerging market status
      if (data.pe > 50) data.pe = 50; // Cap at 50 for Nepal market
      
      // Adjust P/B ratio
      if (data.pb > 10) data.pb = 10; // Cap at 10
      
      // Normalize ROE for Nepal's banking sector dominance
      if (data.roe > 30) data.roe = 30; // Cap at 30%
      
      // Adjust dividend yield for Nepal's market conditions
      if (data.dividendYield > 15) data.dividendYield = 15; // Cap at 15%
    }
    
    return processed;
  }

  generatePreprocessingReport(): string {
    return \`
Nepal Market Preprocessing Report
===============================

Configuration:
- Market: \${this.config.marketId}
- Normalize Prices: \${this.config.normalizePrices}
- Handle Missing Data: \${this.config.handleMissingData}
- Remove Outliers: \${this.config.removeOutliers}
- Smooth Data: \${this.config.smoothData}
- Feature Engineering: \${this.config.featureEngineering}

Processing Statistics:
- Original Data Points: \${this.stats.originalDataPoints}
- Processed Data Points: \${this.stats.processedDataPoints}
- Outliers Removed: \${this.stats.outliersRemoved}
- Missing Values Handled: \${this.stats.missingValuesHandled}
- Processing Time: \${this.stats.processingTime}ms
- Data Quality Score: \${(this.stats.dataQualityScore * 100).toFixed(1)}%

Nepal-Specific Adjustments:
- Applied higher volatility tolerance (±3.5%)
- Adjusted for market hours (11:00-15:00 Nepal time)
- Implemented liquidity-based confidence scoring
- Applied emerging market risk adjustments

Recommendations:
\${this.generateRecommendations()}
\`;
  }

  private generateRecommendations(): string {
    const recommendations: string[] = [];
    
    if (this.stats.dataQualityScore < 0.8) {
      recommendations.push('- Data quality is below threshold. Consider additional data sources.');
    }
    
    if (this.stats.outliersRemoved > this.stats.originalDataPoints * 0.1) {
      recommendations.push('- High number of outliers detected. Review data collection process.');
    }
    
    if (this.stats.missingValuesHandled > this.stats.originalDataPoints * 0.05) {
      recommendations.push('- Significant missing data detected. Improve data reliability.');
    }
    
    if (!this.config.featureEngineering) {
      recommendations.push('- Enable feature engineering for better model performance.');
    }
    
    return recommendations.join('\\n') || '- Data preprocessing meets quality standards.';
  }
}
