import { MarketSentiment, SentimentAnalysis } from './market-sentiment';

export class SingaporeMarketSentiment implements MarketSentiment {
  async getOverallSentiment(): Promise<SentimentAnalysis> {
    const now = new Date();
    const marketHash = this.hashDate(now);
    
    return {
      overall: this.generateSentimentScore(marketHash),
      foreignInvestment: this.generateSentimentScore(marketHash + 1),
      institutional: this.generateSentimentScore(marketHash + 2),
      retail: this.generateSentimentScore(marketHash + 3),
      newsSentiment: this.generateSentimentScore(marketHash + 4),
      socialMedia: this.generateSentimentScore(marketHash + 5),
      policyImpact: this.generateSentimentScore(marketHash + 6),
      lastUpdate: now,
      factors: this.getSingaporeSentimentFactors(marketHash),
      recommendations: this.getSingaporeRecommendations(marketHash),
      riskFactors: this.getSingaporeRiskFactors(marketHash)
    };
  }

  async getStockSentiment(symbol: string): Promise<SentimentAnalysis> {
    const now = new Date();
    const stockHash = this.hashSymbol(symbol);
    
    return {
      overall: this.generateSentimentScore(stockHash),
      foreignInvestment: this.generateSentimentScore(stockHash + 1),
      institutional: this.generateSentimentScore(stockHash + 2),
      retail: this.generateSentimentScore(stockHash + 3),
      newsSentiment: this.generateSentimentScore(stockHash + 4),
      socialMedia: this.generateSentimentScore(stockHash + 5),
      policyImpact: this.generateSentimentScore(stockHash + 6),
      lastUpdate: now,
      factors: this.getStockSentimentFactors(symbol, stockHash),
      recommendations: this.getStockRecommendations(symbol, stockHash),
      riskFactors: this.getStockRiskFactors(symbol, stockHash)
    };
  }

  async getSectorSentiment(sector: string): Promise<SentimentAnalysis> {
    const now = new Date();
    const sectorHash = this.hashString(sector);
    
    return {
      overall: this.generateSentimentScore(sectorHash),
      foreignInvestment: this.generateSentimentScore(sectorHash + 1),
      institutional: this.generateSentimentScore(sectorHash + 2),
      retail: this.generateSentimentScore(sectorHash + 3),
      newsSentiment: this.generateSentimentScore(sectorHash + 4),
      socialMedia: this.generateSentimentScore(sectorHash + 5),
      policyImpact: this.generateSentimentScore(sectorHash + 6),
      lastUpdate: now,
      factors: this.getSectorSentimentFactors(sector, sectorHash),
      recommendations: this.getSectorRecommendations(sector, sectorHash),
      riskFactors: this.getSectorRiskFactors(sector, sectorHash)
    };
  }

  async getSoutheastAsianGatewaySentiment(): Promise<any> {
    const now = new Date();
    const gatewayHash = this.hashDate(now);
    
    return {
      regionalFinancialHub: this.generateSentimentScore(gatewayHash),
      tradeConnectivity: this.generateSentimentScore(gatewayHash + 1),
      foreignCapitalInflow: this.generateSentimentScore(gatewayHash + 2),
      currencyStability: this.generateSentimentScore(gatewayHash + 3),
      aseanIntegration: this.generateSentimentScore(gatewayHash + 4),
      multinationalPresence: this.generateSentimentScore(gatewayHash + 5),
      regionalGrowth: this.generateSentimentScore(gatewayHash + 6),
      lastUpdate: now,
      keyFactors: this.getGatewayFactors(gatewayHash),
      outlook: this.getGatewayOutlook(gatewayHash)
    };
  }

  async getREITMarketSentiment(): Promise<any> {
    const now = new Date();
    const reitHash = this.hashDate(now);
    
    return {
      sREITPerformance: this.generateSentimentScore(reitHash),
      dividendYield: this.generateSentimentScore(reitHash + 1),
      occupancyRates: this.generateSentimentScore(reitHash + 2),
      interestRateSensitivity: this.generateSentimentScore(reitHash + 3),
      foreignOwnership: this.generateSentimentScore(reitHash + 4),
      regionalExpansion: this.generateSentimentScore(reitHash + 5),
      propertyCycle: this.generateSentimentScore(reitHash + 6),
      lastUpdate: now,
      keyFactors: this.getREITFactors(reitHash),
      outlook: this.getREITOutlook(reitHash)
    };
  }

  async getMultinationalSentiment(): Promise<any> {
    const now = new Date();
    const mncHash = this.hashDate(now);
    
    return {
      regionalHeadquarters: this.generateSentimentScore(mncHash),
      foreignDirectInvestment: this.generateSentimentScore(mncHash + 1),
      businessEnvironment: this.generateSentimentScore(mncHash + 2),
      regulatoryFramework: this.generateSentimentScore(mncHash + 3),
      talentAttraction: this.generateSentimentScore(mncHash + 4),
      infrastructureQuality: this.generateSentimentScore(mncHash + 5),
      globalConnectivity: this.generateSentimentScore(mncHash + 6),
      lastUpdate: now,
      keyFactors: this.getMultinationalFactors(mncHash),
      outlook: this.getMultinationalOutlook(mncHash)
    };
  }

  private generateSentimentScore(seed: number): number {
    return (Math.sin(seed) + 1) / 2; // Normalize to 0-1 range
  }

  private getSingaporeSentimentFactors(hash: number): string[] {
    const factors = [
      'Global Economic Conditions',
      'Regional Trade Dynamics',
      'Monetary Policy',
      'Property Market',
      'Tourism Recovery',
      'Manufacturing Sector',
      'Financial Services',
      'Government Fiscal Policy',
      'Labor Market Conditions',
      'Inflation Trends'
    ];

    return factors.slice(0, 3 + (hash % 4));
  }

  private getSingaporeRecommendations(hash: number): string[] {
    const recommendations = [
      'Focus on Financial Sector',
      'Consider REIT Dividends',
      'Monitor Regional Trade',
      'Track Tourism Recovery',
      'Assess Property Market',
      'Evaluate Manufacturing',
      'Consider Export-Oriented Stocks',
      'Monitor Interest Rate Impact'
    ];

    return recommendations.slice(0, 2 + (hash % 3));
  }

  private getSingaporeRiskFactors(hash: number): string[] {
    const risks = [
      'Global Economic Slowdown',
      'Regional Trade Tensions',
      'Interest Rate Changes',
      'Property Market Correction',
      'Labor Shortages',
      'Inflation Pressures',
      'Geopolitical Risks',
      'Supply Chain Disruptions'
    ];

    return risks.slice(0, 2 + (hash % 3));
  }

  private getStockSentimentFactors(symbol: string, hash: number): string[] {
    const stockFactors = [
      'Regional Exposure',
      'Foreign Ownership',
      'Dividend Policy',
      'Business Model Resilience',
      'Management Quality',
      'Regulatory Compliance',
      'Competitive Position',
      'Growth Prospects'
    ];

    return stockFactors.slice(0, 2 + (hash % 3));
  }

  private getStockRecommendations(symbol: string, hash: number): string[] {
    const stockRecommendations = [
      'Accumulate on Weakness',
      'Hold for Dividends',
      'Take Profits',
      'Wait for Better Entry',
      'Add to Portfolio',
      'Reduce Exposure',
      'Monitor Closely',
      'Long-term Hold'
    ];

    return stockRecommendations.slice(0, 1 + (hash % 2));
  }

  private getStockRiskFactors(symbol: string, hash: number): string[] {
    const stockRisks = [
      'Regional Economic Risks',
      'Currency Fluctuations',
      'Regulatory Changes',
      'Competitive Pressures',
      'Interest Rate Sensitivity',
      'Liquidity Concerns',
      'Management Changes',
      'Market Sentiment Shifts'
    ];

    return stockRisks.slice(0, 1 + (hash % 2));
  }

  private getSectorSentimentFactors(sector: string, hash: number): string[] {
    const sectorFactors = [
      'Regional Growth Prospects',
      'Global Competitiveness',
      'Regulatory Environment',
      'Technological Advancement',
      'Capital Availability',
      'Talent Supply',
      'Market Demand',
      'Cost Structure'
    ];

    return sectorFactors.slice(0, 2 + (hash % 3));
  }

  private getSectorRecommendations(sector: string, hash: number): string[] {
    const sectorRecommendations = [
      'Overweight Sector',
      'Market Weight',
      'Underweight Sector',
      'Focus on Leaders',
      'Value Opportunities',
      'Growth Stories',
      'Defensive Play',
      'Cyclical Exposure'
    ];

    return sectorRecommendations.slice(0, 1 + (hash % 2));
  }

  private getSectorRiskFactors(sector: string, hash: number): string[] {
    const sectorRisks = [
      'Economic Cycle Sensitivity',
      'Regulatory Changes',
      'Technological Disruption',
      'Competitive Threats',
      'Cost Inflation',
      'Demand Weakness',
      'Supply Chain Issues',
      'Geopolitical Exposure'
    ];

    return sectorRisks.slice(0, 1 + (hash % 2));
  }

  private getGatewayFactors(hash: number): string[] {
    return [
      'ASEAN Economic Integration',
      'Regional Financial Flows',
      'Trade Agreement Benefits',
      'Currency Stability',
      'Foreign Investment Trends',
      'Multinational Expansion'
    ].slice(0, 3 + (hash % 2));
  }

  private getGatewayOutlook(hash: number): string {
    const outlooks = [
      'Strengthening Regional Hub Position',
      'Increasing Capital Flows',
      'Enhanced Trade Connectivity',
      'Growing Regional Influence',
      'Expanding Financial Services'
    ];
    return outlooks[hash % outlooks.length];
  }

  private getREITFactors(hash: number): string[] {
    return [
      'Interest Rate Environment',
      'Property Market Conditions',
      'Occupancy Levels',
      'Rental Growth',
      'Foreign Investor Demand',
      'Regional Expansion Opportunities'
    ].slice(0, 3 + (hash % 2));
  }

  private getREITOutlook(hash: number): string {
    const outlooks = [
      'Stable Dividend Growth',
      'Favorable Interest Rate Environment',
      'Strong Occupancy Trends',
      'Regional Acquisition Opportunities',
      'Attractive Yield Levels'
    ];
    return outlooks[hash % outlooks.length];
  }

  private getMultinationalFactors(hash: number): string[] {
    return [
      'Business Environment Quality',
      'Regulatory Efficiency',
      'Infrastructure Development',
      'Talent Availability',
      'Regional Market Access',
      'Government Support Programs'
    ].slice(0, 3 + (hash % 2));
  }

  private getMultinationalOutlook(hash: number): string {
    const outlooks = [
      'Expanding Regional Headquarters',
      'Increasing Foreign Direct Investment',
      'Strengthening Global Connectivity',
      'Enhanced Business Ecosystem',
      'Growing Innovation Hub'
    ];
    return outlooks[hash % outlooks.length];
  }

  private hashSymbol(symbol: string): number {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = ((hash << 5) - hash) + symbol.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private hashDate(date: Date): number {
    return this.hashString(date.toISOString().split('T')[0]);
  }
}
