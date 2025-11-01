import { JapaneseStockData, JapaneseTechnicalIndicators } from '../adapters/japanese-market-adapter';

export interface PatternMatch {
  pattern: string;
  confidence: number;
  strength: number;
  timeframe: string;
  description: string;
  japaneseName: string;
  signal: 'buy' | 'sell' | 'neutral';
}

export interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class JapanesePatternRecognition {
  private patterns: Map<string, (data: CandlestickData[]) => PatternMatch> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Morning Star (朝明星) - Bullish reversal pattern
    this.patterns.set('morning-star', (data: CandlestickData[]) => {
      if (data.length < 3) return this.createNoMatch();
      
      const [first, second, third] = data.slice(-3);
      
      // First candle: long red (bearish)
      const firstBody = Math.abs(first.close - first.open);
      const firstIsRed = first.close < first.open;
      
      // Second candle: small body (doji-like), gaps down
      const secondBody = Math.abs(second.close - second.open);
      const secondGapsDown = second.high < first.close;
      
      // Third candle: long green (bullish), closes above first candle midpoint
      const thirdBody = Math.abs(third.close - third.open);
      const thirdIsGreen = third.close > third.open;
      const firstMidpoint = first.open + (first.close - first.open) / 2;
      const thirdClosesAboveMid = third.close > firstMidpoint;
      
      const confidence = this.calculateConfidence([
        firstIsRed && firstBody > this.getAverageBodySize(data) * 1.5,
        secondGapsDown && secondBody < this.getAverageBodySize(data) * 0.3,
        thirdIsGreen && thirdBody > this.getAverageBodySize(data) * 1.2,
        thirdClosesAboveMid
      ]);
      
      return {
        pattern: 'morning-star',
        confidence,
        strength: thirdBody / firstBody,
        timeframe: '1d',
        description: 'Bullish reversal pattern indicating potential upward trend',
        japaneseName: '朝明星',
        signal: 'buy'
      };
    });

    // Evening Star (宵の明星) - Bearish reversal pattern
    this.patterns.set('evening-star', (data: CandlestickData[]) => {
      if (data.length < 3) return this.createNoMatch();
      
      const [first, second, third] = data.slice(-3);
      
      // First candle: long green (bullish)
      const firstBody = Math.abs(first.close - first.open);
      const firstIsGreen = first.close > first.open;
      
      // Second candle: small body (doji-like), gaps up
      const secondBody = Math.abs(second.close - second.open);
      const secondGapsUp = second.low > first.close;
      
      // Third candle: long red (bearish), closes below first candle midpoint
      const thirdBody = Math.abs(third.close - third.open);
      const thirdIsRed = third.close < third.open;
      const firstMidpoint = first.open + (first.close - first.open) / 2;
      const thirdClosesBelowMid = third.close < firstMidpoint;
      
      const confidence = this.calculateConfidence([
        firstIsGreen && firstBody > this.getAverageBodySize(data) * 1.5,
        secondGapsUp && secondBody < this.getAverageBodySize(data) * 0.3,
        thirdIsRed && thirdBody > this.getAverageBodySize(data) * 1.2,
        thirdClosesBelowMid
      ]);
      
      return {
        pattern: 'evening-star',
        confidence,
        strength: thirdBody / firstBody,
        timeframe: '1d',
        description: 'Bearish reversal pattern indicating potential downward trend',
        japaneseName: '宵の明星',
        signal: 'sell'
      };
    });

    // Doji (道場) - Indecision pattern
    this.patterns.set('doji', (data: CandlestickData[]) => {
      if (data.length < 1) return this.createNoMatch();
      
      const current = data[data.length - 1];
      const body = Math.abs(current.close - current.open);
      const range = current.high - current.low;
      const bodyToRangeRatio = body / range;
      
      // Doji has very small body relative to the range
      const isDoji = bodyToRangeRatio < 0.1;
      
      // Check for long shadows (typical of doji)
      const upperShadow = current.high - Math.max(current.open, current.close);
      const lowerShadow = Math.min(current.open, current.close) - current.low;
      const hasLongShadows = upperShadow > body * 2 || lowerShadow > body * 2;
      
      const confidence = this.calculateConfidence([
        isDoji,
        hasLongShadows,
        range > this.getAverageRange(data) * 0.8
      ]);
      
      return {
        pattern: 'doji',
        confidence,
        strength: 1 - bodyToRangeRatio,
        timeframe: '1d',
        description: 'Indecision pattern suggesting market uncertainty',
        japaneseName: '道場',
        signal: 'neutral'
      };
    });

    // Hammer (カミナリ) - Bullish reversal pattern
    this.patterns.set('hammer', (data: CandlestickData[]) => {
      if (data.length < 1) return this.createNoMatch();
      
      const current = data[data.length - 1];
      const body = Math.abs(current.close - current.open);
      const range = current.high - current.low;
      const upperShadow = current.high - Math.max(current.open, current.close);
      const lowerShadow = Math.min(current.open, current.close) - current.low;
      
      // Hammer has small body at upper end, long lower shadow
      const smallBody = body < this.getAverageBodySize(data) * 0.3;
      const longLowerShadow = lowerShadow > body * 2;
      const shortUpperShadow = upperShadow < body * 0.5;
      
      // Typically appears in downtrend
      const isInDowntrend = this.isInDowntrend(data);
      
      const confidence = this.calculateConfidence([
        smallBody,
        longLowerShadow,
        shortUpperShadow,
        isInDowntrend
      ]);
      
      return {
        pattern: 'hammer',
        confidence,
        strength: lowerShadow / body,
        timeframe: '1d',
        description: 'Bullish reversal pattern with long lower shadow and small body',
        japaneseName: 'カミナリ',
        signal: 'buy'
      };
    });

    // Hanging Man (首吊り線) - Bearish reversal pattern
    this.patterns.set('hanging-man', (data: CandlestickData[]) => {
      if (data.length < 1) return this.createNoMatch();
      
      const current = data[data.length - 1];
      const body = Math.abs(current.close - current.open);
      const range = current.high - current.low;
      const upperShadow = current.high - Math.max(current.open, current.close);
      const lowerShadow = Math.min(current.open, current.close) - current.low;
      
      // Hanging man has small body at upper end, long lower shadow
      const smallBody = body < this.getAverageBodySize(data) * 0.3;
      const longLowerShadow = lowerShadow > body * 2;
      const shortUpperShadow = upperShadow < body * 0.5;
      
      // Typically appears in uptrend
      const isInUptrend = this.isInUptrend(data);
      
      const confidence = this.calculateConfidence([
        smallBody,
        longLowerShadow,
        shortUpperShadow,
        isInUptrend
      ]);
      
      return {
        pattern: 'hanging-man',
        confidence,
        strength: lowerShadow / body,
        timeframe: '1d',
        description: 'Bearish reversal pattern with long lower shadow and small body',
        japaneseName: '首吊り線',
        signal: 'sell'
      };
    });

    // Engulfing Pattern (包み込み線) - Strong reversal pattern
    this.patterns.set('engulfing', (data: CandlestickData[]) => {
      if (data.length < 2) return this.createNoMatch();
      
      const [previous, current] = data.slice(-2);
      
      const previousBody = Math.abs(previous.close - previous.open);
      const currentBody = Math.abs(current.close - current.open);
      
      // Current candle engulfs previous candle
      const engulfs = current.high > previous.high && current.low < previous.low;
      const bodyEngulfs = currentBody > previousBody * 1.5;
      
      // Determine if bullish or bearish engulfing
      const previousIsGreen = previous.close > previous.open;
      const currentIsGreen = current.close > current.open;
      const isReversal = previousIsGreen !== currentIsGreen;
      
      const confidence = this.calculateConfidence([
        engulfs,
        bodyEngulfs,
        isReversal,
        currentBody > this.getAverageBodySize(data)
      ]);
      
      return {
        pattern: 'engulfing',
        confidence,
        strength: currentBody / previousBody,
        timeframe: '1d',
        description: isReversal ? 
          `Strong \${currentIsGreen ? 'bullish' : 'bearish'} reversal pattern` :
          'Continuation pattern with strong momentum',
        japaneseName: '包み込み線',
        signal: currentIsGreen ? 'buy' : 'sell'
      };
    });

    // Harami (はらみ) - Reversal pattern
    this.patterns.set('harami', (data: CandlestickData[]) => {
      if (data.length < 2) return this.createNoMatch();
      
      const [previous, current] = data.slice(-2);
      
      const previousBody = Math.abs(previous.close - previous.open);
      const currentBody = Math.abs(current.close - current.open);
      
      // Current candle is completely inside previous candle's body
      const currentInsidePrevious = 
        current.high < Math.max(previous.open, previous.close) &&
        current.low > Math.min(previous.open, previous.close);
      
      const smallCurrentBody = currentBody < previousBody * 0.5;
      
      // Determine if bullish or bearish harami
      const previousIsGreen = previous.close > previous.open;
      const currentIsGreen = current.close > current.open;
      const isReversal = previousIsGreen !== currentIsGreen;
      
      const confidence = this.calculateConfidence([
        currentInsidePrevious,
        smallCurrentBody,
        isReversal,
        previousBody > this.getAverageBodySize(data) * 1.2
      ]);
      
      return {
        pattern: 'harami',
        confidence,
        strength: previousBody / currentBody,
        timeframe: '1d',
        description: isReversal ?
          `\${currentIsGreen ? 'Bullish' : 'Bearish'} harami reversal pattern` :
          'Harami continuation pattern',
        japaneseName: 'はらみ',
        signal: isReversal ? (currentIsGreen ? 'buy' : 'sell') : 'neutral'
      };
    });
  }

  async detectPatterns(symbol: string, historicalData: JapaneseStockData[]): Promise<PatternMatch[]> {
    // Convert stock data to candlestick format
    const candlestickData: CandlestickData[] = historicalData.map(data => ({
      date: data.lastUpdated,
      open: data.price - data.change, // Approximate open price
      high: data.price * (1 + Math.random() * 0.02), // Approximate high
      low: data.price * (1 - Math.random() * 0.02), // Approximate low
      close: data.price,
      volume: data.volume
    }));

    const detectedPatterns: PatternMatch[] = [];

    // Check each pattern
    for (const [patternName, patternDetector] of this.patterns) {
      try {
        const match = patternDetector(candlestickData);
        if (match.confidence > 0.6) { // Only return high-confidence matches
          detectedPatterns.push(match);
        }
      } catch (error) {
        console.error(`Error detecting pattern \${patternName}:`, error);
      }
    }

    // Sort by confidence and return top patterns
    return detectedPatterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Return top 5 patterns
  }

  async analyzeTrend(candlestickData: CandlestickData[]): Promise<{
    trend: 'uptrend' | 'downtrend' | 'sideways';
    strength: number;
    duration: number;
    support: number[];
    resistance: number[];
  }> {
    if (candlestickData.length < 10) {
      return {
        trend: 'sideways',
        strength: 0,
        duration: 0,
        support: [],
        resistance: []
      };
    }

    const prices = candlestickData.map(d => d.close);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);

    // Determine trend based on moving averages
    const currentPrice = prices[prices.length - 1];
    const recentSma20 = sma20[sma20.length - 1];
    const recentSma50 = sma50[sma50.length - 1];

    let trend: 'uptrend' | 'downtrend' | 'sideways';
    let strength = 0;

    if (currentPrice > recentSma20 && recentSma20 > recentSma50) {
      trend = 'uptrend';
      strength = Math.min(1, (currentPrice - recentSma50) / recentSma50);
    } else if (currentPrice < recentSma20 && recentSma20 < recentSma50) {
      trend = 'downtrend';
      strength = Math.min(1, (recentSma50 - currentPrice) / recentSma50);
    } else {
      trend = 'sideways';
      strength = 1 - Math.abs(currentPrice - recentSma20) / recentSma20;
    }

    // Calculate support and resistance levels
    const support = this.findSupportLevels(candlestickData);
    const resistance = this.findResistanceLevels(candlestickData);

    // Calculate trend duration
    const duration = this.calculateTrendDuration(candlestickData, trend);

    return {
      trend,
      strength,
      duration,
      support,
      resistance
    };
  }

  private createNoMatch(): PatternMatch {
    return {
      pattern: 'none',
      confidence: 0,
      strength: 0,
      timeframe: '1d',
      description: 'No pattern detected',
      japaneseName: 'なし',
      signal: 'neutral'
    };
  }

  private calculateConfidence(conditions: boolean[]): number {
    const trueConditions = conditions.filter(c => c).length;
    return trueConditions / conditions.length;
  }

  private getAverageBodySize(data: CandlestickData[]): number {
    if (data.length === 0) return 0;
    const bodies = data.map(d => Math.abs(d.close - d.open));
    return bodies.reduce((sum, body) => sum + body, 0) / bodies.length;
  }

  private getAverageRange(data: CandlestickData[]): number {
    if (data.length === 0) return 0;
    const ranges = data.map(d => d.high - d.low);
    return ranges.reduce((sum, range) => sum + range, 0) / ranges.length;
  }

  private isInDowntrend(data: CandlestickData[]): boolean {
    if (data.length < 5) return false;
    const prices = data.slice(-5).map(d => d.close);
    return prices[0] > prices[prices.length - 1];
  }

  private isInUptrend(data: CandlestickData[]): boolean {
    if (data.length < 5) return false;
    const prices = data.slice(-5).map(d => d.close);
    return prices[0] < prices[prices.length - 1];
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  private findSupportLevels(data: CandlestickData[]): number[] {
    const lows = data.map(d => d.low);
    const supportLevels: number[] = [];
    
    // Find local minima
    for (let i = 2; i < lows.length - 2; i++) {
      if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && 
          lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
        supportLevels.push(lows[i]);
      }
    }
    
    // Cluster nearby levels
    return this.clusterLevels(supportLevels);
  }

  private findResistanceLevels(data: CandlestickData[]): number[] {
    const highs = data.map(d => d.high);
    const resistanceLevels: number[] = [];
    
    // Find local maxima
    for (let i = 2; i < highs.length - 2; i++) {
      if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && 
          highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
        resistanceLevels.push(highs[i]);
      }
    }
    
    // Cluster nearby levels
    return this.clusterLevels(resistanceLevels);
  }

  private clusterLevels(levels: number[]): number[] {
    if (levels.length === 0) return [];
    
    const clustered: number[] = [];
    const threshold = levels[0] * 0.02; // 2% threshold
    
    for (const level of levels) {
      const existingCluster = clustered.find(c => Math.abs(c - level) < threshold);
      if (!existingCluster) {
        clustered.push(level);
      }
    }
    
    return clustered.sort((a, b) => a - b);
  }

  private calculateTrendDuration(data: CandlestickData[], trend: 'uptrend' | 'downtrend' | 'sideways'): number {
    let duration = 0;
    const prices = data.map(d => d.close);
    
    for (let i = prices.length - 2; i >= 0; i--) {
      const currentTrend = prices[i + 1] > prices[i] ? 'uptrend' : 
                         prices[i + 1] < prices[i] ? 'downtrend' : 'sideways';
      
      if (currentTrend === trend) {
        duration++;
      } else {
        break;
      }
    }
    
    return duration;
  }

  getAvailablePatterns(): string[] {
    return Array.from(this.patterns.keys());
  }

  getPatternDescription(patternName: string): string {
    const descriptions: Record<string, string> = {
      'morning-star': 'A bullish reversal pattern that consists of three candlesticks: a long red candle, a small-bodied candle that gaps down, and a long green candle that closes above the midpoint of the first candle.',
      'evening-star': 'A bearish reversal pattern that consists of three candlesticks: a long green candle, a small-bodied candle that gaps up, and a long red candle that closes below the midpoint of the first candle.',
      'doji': 'A candlestick pattern with a very small body, indicating indecision in the market. The open and close prices are nearly equal.',
      'hammer': 'A bullish reversal pattern with a small body at the upper end of the trading range and a long lower shadow, appearing after a downtrend.',
      'hanging-man': 'A bearish reversal pattern with a small body at the upper end of the trading range and a long lower shadow, appearing after an uptrend.',
      'engulfing': 'A strong reversal pattern where a large candle completely engulfs the previous candle\'s body, indicating a potential trend reversal.',
      'harami': 'A reversal pattern where a small candle is completely contained within the previous candle\'s body, suggesting a weakening of the current trend.'
    };
    
    return descriptions[patternName] || 'Pattern description not available.';
  }
}
