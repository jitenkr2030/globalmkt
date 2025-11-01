export interface Pattern {
  name: string;
  nameZh?: string;
  nameKo?: string;
  type: string;
  description: string;
  descriptionZh?: string;
  descriptionKo?: string;
  reliability: number;
  timeframe: string;
  confidence?: number;
  detectedAt?: Date;
}

export interface TrendAnalysis {
  shortTerm: 'bullish' | 'bearish' | 'neutral';
  mediumTerm: 'bullish' | 'bearish' | 'neutral';
  longTerm: 'bullish' | 'bearish' | 'neutral';
  support: number;
  resistance: number;
  momentum: number;
  volatility: number;
  recommendation: string;
}

export interface PatternRecognition {
  analyzeStock(symbol: string): Promise<Pattern[]>;
  getTrendAnalysis(symbol: string): Promise<TrendAnalysis>;
}
