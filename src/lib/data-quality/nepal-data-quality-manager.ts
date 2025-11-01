import { StockData, TechnicalIndicators, FundamentalData } from '../adapters/nepal-market-adapter';

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  validity: number;
  overall: number;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  validate: (data: any) => boolean;
}

export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class NepalDataQualityManager {
  private validationRules: ValidationRule[];
  private qualityHistory: DataQualityMetrics[];
  private thresholds = {
    completeness: 0.95,
    accuracy: 0.90,
    timeliness: 0.85,
    consistency: 0.90,
    validity: 0.95
  };

  constructor() {
    this.validationRules = this.initializeValidationRules();
    this.qualityHistory = [];
  }

  private initializeValidationRules(): ValidationRule[] {
    return [
      {
        id: 'price_positive',
        name: 'Positive Price',
        description: 'Stock price must be positive',
        severity: 'critical',
        validate: (data: StockData) => data.price > 0
      },
      {
        id: 'volume_positive',
        name: 'Positive Volume',
        description: 'Trading volume must be positive',
        severity: 'high',
        validate: (data: StockData) => data.volume > 0
      },
      {
        id: 'price_reasonable',
        name: 'Reasonable Price Range',
        description: 'Price should be within expected range for NEPSE',
        severity: 'high',
        validate: (data: StockData) => data.price >= 10 && data.price <= 50000
      },
      {
        id: 'change_percent_reasonable',
        name: 'Reasonable Change Percentage',
        description: 'Daily change should be within ±10% for normal trading',
        severity: 'medium',
        validate: (data: StockData) => Math.abs(data.changePercent) <= 10
      },
      {
        id: 'rsi_range',
        name: 'RSI Range',
        description: 'RSI should be between 0 and 100',
        severity: 'high',
        validate: (data: TechnicalIndicators) => data.rsi >= 0 && data.rsi <= 100
      },
      {
        id: 'pe_positive',
        name: 'Positive P/E Ratio',
        description: 'P/E ratio should be positive',
        severity: 'medium',
        validate: (data: FundamentalData) => data.pe > 0
      },
      {
        id: 'pb_positive',
        name: 'Positive P/B Ratio',
        description: 'P/B ratio should be positive',
        severity: 'medium',
        validate: (data: FundamentalData) => data.pb > 0
      },
      {
        id: 'roe_reasonable',
        name: 'Reasonable ROE',
        description: 'ROE should be within reasonable range',
        severity: 'medium',
        validate: (data: FundamentalData) => data.roe >= -50 && data.roe <= 100
      },
      {
        id: 'market_cap_positive',
        name: 'Positive Market Cap',
        description: 'Market capitalization should be positive',
        severity: 'high',
        validate: (data: StockData) => data.marketCap > 0
      },
      {
        id: 'timestamp_recent',
        name: 'Recent Timestamp',
        description: 'Data should be recently updated',
        severity: 'medium',
        validate: (data: StockData) => {
          const now = new Date();
          const dataTime = new Date(data.lastUpdated);
          const timeDiff = now.getTime() - dataTime.getTime();
          return timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
        }
      }
    ];
  }

  async validateStockData(data: StockData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const rule of this.validationRules) {
      try {
        const passed = rule.validate(data);
        results.push({
          ruleId: rule.id,
          passed,
          message: passed ? 'Passed' : `Failed: ${rule.description}`,
          severity: rule.severity,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          message: `Error validating rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'high',
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }

  async validateTechnicalIndicators(data: TechnicalIndicators): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    const technicalRules = this.validationRules.filter(rule => 
      rule.id === 'rsi_range'
    );
    
    for (const rule of technicalRules) {
      try {
        const passed = rule.validate(data);
        results.push({
          ruleId: rule.id,
          passed,
          message: passed ? 'Passed' : `Failed: ${rule.description}`,
          severity: rule.severity,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          message: `Error validating rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'high',
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }

  async validateFundamentalData(data: FundamentalData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    const fundamentalRules = this.validationRules.filter(rule => 
      ['pe_positive', 'pb_positive', 'roe_reasonable'].includes(rule.id)
    );
    
    for (const rule of fundamentalRules) {
      try {
        const passed = rule.validate(data);
        results.push({
          ruleId: rule.id,
          passed,
          message: passed ? 'Passed' : `Failed: ${rule.description}`,
          severity: rule.severity,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          message: `Error validating rule: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'high',
          timestamp: new Date()
        });
      }
    }
    
    return results;
  }

  async calculateDataQuality(
    stockData: StockData[],
    technicalData: TechnicalIndicators[],
    fundamentalData: FundamentalData[]
  ): Promise<DataQualityMetrics> {
    // Completeness: Check for missing data
    const completeness = this.calculateCompleteness(stockData, technicalData, fundamentalData);
    
    // Accuracy: Validate data against rules
    const accuracy = await this.calculateAccuracy(stockData, technicalData, fundamentalData);
    
    // Timeliness: Check how recent the data is
    const timeliness = this.calculateTimeliness(stockData);
    
    // Consistency: Check for data consistency across different sources
    const consistency = this.calculateConsistency(stockData);
    
    // Validity: Check if data is within expected ranges
    const validity = await this.calculateValidity(stockData, technicalData, fundamentalData);
    
    const overall = (completeness + accuracy + timeliness + consistency + validity) / 5;
    
    const metrics: DataQualityMetrics = {
      completeness,
      accuracy,
      timeliness,
      consistency,
      validity,
      overall
    };
    
    this.qualityHistory.push(metrics);
    
    return metrics;
  }

  private calculateCompleteness(
    stockData: StockData[],
    technicalData: TechnicalIndicators[],
    fundamentalData: FundamentalData[]
  ): number {
    let totalFields = 0;
    let filledFields = 0;
    
    // Check stock data completeness
    stockData.forEach(data => {
      const fields = Object.keys(data);
      totalFields += fields.length;
      filledFields += fields.filter(key => data[key as keyof StockData] !== null && data[key as keyof StockData] !== undefined).length;
    });
    
    // Check technical data completeness
    technicalData.forEach(data => {
      const fields = Object.keys(data);
      totalFields += fields.length;
      filledFields += fields.filter(key => data[key as keyof TechnicalIndicators] !== null && data[key as keyof TechnicalIndicators] !== undefined).length;
    });
    
    // Check fundamental data completeness
    fundamentalData.forEach(data => {
      const fields = Object.keys(data);
      totalFields += fields.length;
      filledFields += fields.filter(key => data[key as keyof FundamentalData] !== null && data[key as keyof FundamentalData] !== undefined).length;
    });
    
    return totalFields > 0 ? filledFields / totalFields : 0;
  }

  private async calculateAccuracy(
    stockData: StockData[],
    technicalData: TechnicalIndicators[],
    fundamentalData: FundamentalData[]
  ): Promise<number> {
    let totalValidations = 0;
    let passedValidations = 0;
    
    // Validate stock data
    for (const data of stockData) {
      const results = await this.validateStockData(data);
      totalValidations += results.length;
      passedValidations += results.filter(r => r.passed).length;
    }
    
    // Validate technical data
    for (const data of technicalData) {
      const results = await this.validateTechnicalIndicators(data);
      totalValidations += results.length;
      passedValidations += results.filter(r => r.passed).length;
    }
    
    // Validate fundamental data
    for (const data of fundamentalData) {
      const results = await this.validateFundamentalData(data);
      totalValidations += results.length;
      passedValidations += results.filter(r => r.passed).length;
    }
    
    return totalValidations > 0 ? passedValidations / totalValidations : 0;
  }

  private calculateTimeliness(stockData: StockData[]): number {
    if (stockData.length === 0) return 0;
    
    const now = new Date();
    let totalTimeliness = 0;
    
    stockData.forEach(data => {
      const dataTime = new Date(data.lastUpdated);
      const timeDiff = now.getTime() - dataTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // Score based on how recent the data is (1.0 for < 1 hour, 0.0 for > 24 hours)
      const timelinessScore = Math.max(0, 1 - (hoursDiff / 24));
      totalTimeliness += timelinessScore;
    });
    
    return totalTimeliness / stockData.length;
  }

  private calculateConsistency(stockData: StockData[]): number {
    if (stockData.length < 2) return 1.0;
    
    // Check for consistency in price changes and volumes
    let consistencyScore = 1.0;
    let inconsistencies = 0;
    
    for (let i = 1; i < stockData.length; i++) {
      const current = stockData[i];
      const previous = stockData[i - 1];
      
      // Check for extreme price changes
      const priceChangePercent = Math.abs((current.price - previous.price) / previous.price);
      if (priceChangePercent > 0.1) { // More than 10% change
        inconsistencies++;
      }
      
      // Check for volume consistency
      const volumeChangePercent = Math.abs((current.volume - previous.volume) / previous.volume);
      if (volumeChangePercent > 5.0) { // More than 500% volume change
        inconsistencies++;
      }
    }
    
    consistencyScore = Math.max(0, 1 - (inconsistencies / stockData.length));
    return consistencyScore;
  }

  private async calculateValidity(
    stockData: StockData[],
    technicalData: TechnicalIndicators[],
    fundamentalData: FundamentalData[]
  ): Promise<number> {
    let totalChecks = 0;
    let passedChecks = 0;
    
    // Check stock data validity
    stockData.forEach(data => {
      totalChecks++;
      if (data.price > 0 && data.volume > 0 && data.marketCap > 0) {
        passedChecks++;
      }
    });
    
    // Check technical data validity
    technicalData.forEach(data => {
      totalChecks++;
      if (data.rsi >= 0 && data.rsi <= 100) {
        passedChecks++;
      }
    });
    
    // Check fundamental data validity
    fundamentalData.forEach(data => {
      totalChecks++;
      if (data.pe > 0 && data.pb > 0) {
        passedChecks++;
      }
    });
    
    return totalChecks > 0 ? passedChecks / totalChecks : 0;
  }

  getQualityHistory(): DataQualityMetrics[] {
    return this.qualityHistory;
  }

  getQualityThresholds() {
    return this.thresholds;
  }

  isQualityAcceptable(metrics: DataQualityMetrics): boolean {
    return (
      metrics.completeness >= this.thresholds.completeness &&
      metrics.accuracy >= this.thresholds.accuracy &&
      metrics.timeliness >= this.thresholds.timeliness &&
      metrics.consistency >= this.thresholds.consistency &&
      metrics.validity >= this.thresholds.validity
    );
  }

  generateQualityReport(metrics: DataQualityMetrics): string {
    const isAcceptable = this.isQualityAcceptable(metrics);
    
    return `
Data Quality Report for Nepal Stock Exchange (NEPSE)
================================================

Overall Quality Score: ${(metrics.overall * 100).toFixed(1)}%
Status: ${isAcceptable ? 'ACCEPTABLE' : 'NEEDS ATTENTION'}

Detailed Metrics:
- Completeness: ${(metrics.completeness * 100).toFixed(1)}% (Threshold: ${(this.thresholds.completeness * 100).toFixed(1)}%)
- Accuracy: ${(metrics.accuracy * 100).toFixed(1)}% (Threshold: ${(this.thresholds.accuracy * 100).toFixed(1)}%)
- Timeliness: ${(metrics.timeliness * 100).toFixed(1)}% (Threshold: ${(this.thresholds.timeliness * 100).toFixed(1)}%)
- Consistency: ${(metrics.consistency * 100).toFixed(1)}% (Threshold: ${(this.thresholds.consistency * 100).toFixed(1)}%)
- Validity: ${(metrics.validity * 100).toFixed(1)}% (Threshold: ${(this.thresholds.validity * 100).toFixed(1)}%)

Recommendations:
${this.generateRecommendations(metrics)}
`;
  }

  private generateRecommendations(metrics: DataQualityMetrics): string {
    const recommendations: string[] = [];
    
    if (metrics.completeness < this.thresholds.completeness) {
      recommendations.push('- Improve data completeness by ensuring all required fields are populated');
    }
    
    if (metrics.accuracy < this.thresholds.accuracy) {
      recommendations.push('- Enhance data accuracy through better validation and error correction');
    }
    
    if (metrics.timeliness < this.thresholds.timeliness) {
      recommendations.push('- Reduce data latency by optimizing data collection processes');
    }
    
    if (metrics.consistency < this.thresholds.consistency) {
      recommendations.push('- Improve data consistency across different sources and time periods');
    }
    
    if (metrics.validity < this.thresholds.validity) {
      recommendations.push('- Strengthen data validation rules and range checking');
    }
    
    return recommendations.join('\\n') || '- Data quality meets all thresholds';
  }
}
