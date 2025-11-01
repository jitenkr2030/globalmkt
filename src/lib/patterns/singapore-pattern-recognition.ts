import { PatternRecognition, Pattern, TrendAnalysis } from './pattern-recognition';

export class SingaporePatternRecognition implements PatternRecognition {
  async analyzeStock(symbol: string): Promise<Pattern[]> {
    const patterns = this.getSingaporePatterns();
    const detectedPatterns: Pattern[] = [];

    // Simulate pattern detection based on stock symbol
    const stockHash = this.hashSymbol(symbol);
    
    patterns.forEach((pattern, index) => {
      if (stockHash % (index + 3) === 0) {
        detectedPatterns.push({
          ...pattern,
          confidence: 0.75 + (stockHash % 25) / 100,
          detectedAt: new Date(Date.now() - Math.random() * 86400000)
        });
      }
    });

    return detectedPatterns;
  }

  async getTrendAnalysis(symbol: string): Promise<TrendAnalysis> {
    const stockHash = this.hashSymbol(symbol);
    
    return {
      shortTerm: this.generateTrend(stockHash % 3),
      mediumTerm: this.generateTrend((stockHash + 1) % 3),
      longTerm: this.generateTrend((stockHash + 2) % 3),
      support: 100 + stockHash % 40,
      resistance: 140 + stockHash % 80,
      momentum: (stockHash % 100) / 100,
      volatility: 0.12 + (stockHash % 18) / 100,
      recommendation: this.getSingaporeRecommendation(stockHash)
    };
  }

  async detectGatewayPatterns(symbol: string): Promise<Pattern[]> {
    const gatewayPatterns = this.getGatewayPatterns();
    const detectedPatterns: Pattern[] = [];

    const stockHash = this.hashSymbol(symbol);
    
    gatewayPatterns.forEach((pattern, index) => {
      if (stockHash % (index + 4) === 0) {
        detectedPatterns.push({
          ...pattern,
          confidence: 0.82 + (stockHash % 18) / 100,
          detectedAt: new Date(Date.now() - Math.random() * 86400000)
        });
      }
    });

    return detectedPatterns;
  }

  async detectREITPatterns(symbol: string): Promise<Pattern[]> {
    const reitPatterns = this.getREITPatterns();
    const detectedPatterns: Pattern[] = [];

    const stockHash = this.hashSymbol(symbol);
    
    reitPatterns.forEach((pattern, index) => {
      if (stockHash % (index + 5) === 0) {
        detectedPatterns.push({
          ...pattern,
          confidence: 0.78 + (stockHash % 22) / 100,
          detectedAt: new Date(Date.now() - Math.random() * 86400000)
        });
      }
    });

    return detectedPatterns;
  }

  private getSingaporePatterns(): Pattern[] {
    return [
      {
        name: 'Merlion Pattern',
        type: 'stability',
        description: 'Pattern representing Singapore\'s economic stability and resilience',
        reliability: 0.88,
        timeframe: 'long'
      },
      {
        name: 'Marina Bay Pattern',
        type: 'growth',
        description: 'Growth pattern reflecting Singapore\'s modern economic development',
        reliability: 0.85,
        timeframe: 'medium'
      },
      {
        name: 'Orchard Road Pattern',
        type: 'consumer',
        description: 'Consumer spending and retail sector pattern',
        reliability: 0.82,
        timeframe: 'medium'
      },
      {
        name: 'Sentosa Pattern',
        type: 'tourism',
        description: 'Tourism and hospitality sector pattern',
        reliability: 0.79,
        timeframe: 'seasonal'
      },
      {
        name: 'Raffles Place Pattern',
        type: 'financial',
        description: 'Financial hub and banking sector pattern',
        reliability: 0.91,
        timeframe: 'long'
      },
      {
        name: 'Changi Pattern',
        type: 'logistics',
        description: 'Logistics and transportation sector pattern',
        reliability: 0.84,
        timeframe: 'medium'
      }
    ];
  }

  private getGatewayPatterns(): Pattern[] {
    return [
      {
        name: 'ASEAN Gateway Pattern',
        type: 'regional',
        description: 'Pattern reflecting Singapore\'s role as Southeast Asian financial gateway',
        reliability: 0.93,
        timeframe: 'long'
      },
      {
        name: 'Regional Trade Hub Pattern',
        type: 'trade',
        description: 'Pattern indicating Singapore\'s position as regional trade center',
        reliability: 0.89,
        timeframe: 'medium'
      },
      {
        name: 'Foreign Investment Flow Pattern',
        type: 'capital',
        description: 'Pattern showing foreign capital flows through Singapore',
        reliability: 0.87,
        timeframe: 'short'
      },
      {
        name: 'Currency Safe Haven Pattern',
        type: 'currency',
        description: 'Pattern reflecting SGD\'s role as regional safe haven currency',
        reliability: 0.85,
        timeframe: 'medium'
      },
      {
        name: 'Multinational Headquarters Pattern',
        type: 'corporate',
        description: 'Pattern related to MNC regional headquarters presence',
        reliability: 0.83,
        timeframe: 'long'
      }
    ];
  }

  private getREITPatterns(): Pattern[] {
    return [
      {
        name: 'S-REIT Dividend Pattern',
        type: 'income',
        description: 'Pattern showing Singapore REIT dividend consistency and growth',
        reliability: 0.92,
        timeframe: 'long'
      },
      {
        name: 'Property Trust Cycle Pattern',
        type: 'cyclical',
        description: 'Cyclical pattern in Singapore property trust sector',
        reliability: 0.86,
        timeframe: 'medium'
      },
      {
        name: 'Regional Expansion Pattern',
        type: 'growth',
        description: 'Pattern showing S-REIT expansion into regional markets',
        reliability: 0.88,
        timeframe: 'long'
      },
      {
        name: 'Interest Rate Sensitivity Pattern',
        type: 'monetary',
        description: 'Pattern reflecting REIT sensitivity to interest rate changes',
        reliability: 0.84,
        timeframe: 'short'
      },
      {
        name: 'Foreign Ownership Pattern',
        type: 'ownership',
        description: 'Pattern showing high foreign ownership in Singapore REITs',
        reliability: 0.81,
        timeframe: 'medium'
      }
    ];
  }

  private generateTrend(seed: number): 'bullish' | 'bearish' | 'neutral' {
    const trends: ('bullish' | 'bearish' | 'neutral')[] = ['bullish', 'bearish', 'neutral'];
    return trends[seed];
  }

  private getSingaporeRecommendation(hash: number): string {
    const recommendations = [
      'Strong Buy',
      'Buy',
      'Hold',
      'Sell',
      'Strong Sell'
    ];
    return recommendations[hash % recommendations.length];
  }

  private hashSymbol(symbol: string): number {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = ((hash << 5) - hash) + symbol.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
