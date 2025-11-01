export interface SentimentAnalysis {
  overall: number;
  foreignInvestment: number;
  institutional: number;
  retail: number;
  newsSentiment: number;
  socialMedia: number;
  policyImpact: number;
  lastUpdate: Date;
  factors: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface MarketSentiment {
  getOverallSentiment(): Promise<SentimentAnalysis>;
  getStockSentiment(symbol: string): Promise<SentimentAnalysis>;
  getSectorSentiment(sector: string): Promise<SentimentAnalysis>;
}
