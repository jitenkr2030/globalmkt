import { MarketConfig, ASIAN_MARKETS, EUROPEAN_MARKETS, AMERICAN_MARKETS, AFRICAN_MARKETS, MIDDLE_EASTERN_MARKETS, OCEANIC_MARKETS } from './market-config';

export interface TradingHours {
  market: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  lunchBreak?: {
    start: string;
    end: string;
  };
  preMarket?: {
    start: string;
    end: string;
  };
  afterHours?: {
    start: string;
    end: string;
  };
  tradingDays: string[];
  holidays: string[];
}

export interface OptimizedTradingWindow {
  market: string;
  region: string;
  bestTradingTime: {
    start: string;
    end: string;
    reason: string;
  };
  peakVolumeTime: {
    start: string;
    end: string;
    volumeMultiplier: number;
  };
  lowVolatilityTime: {
    start: string;
    end: string;
    volatilityReduction: number;
  };
  crossMarketOpportunities: {
    market: string;
    overlapStart: string;
    overlapEnd: string;
    synergyScore: number;
  }[];
}

export interface GlobalTradingSchedule {
  currentTime: string;
  utcOffset: string;
  activeMarkets: string[];
  upcomingOpenings: {
    market: string;
    timeUntilOpen: string;
    openTime: string;
  }[];
  upcomingClosings: {
    market: string;
    timeUntilClose: string;
    closeTime: string;
  }[];
  optimalTradingWindows: OptimizedTradingWindow[];
  globalLiquidityScore: number;
  marketOverlapAnalysis: {
    region1: string;
    region2: string;
    overlapDuration: number;
    synergyScore: number;
  }[];
}

export class TradingHoursOptimizer {
  private tradingHours: Map<string, TradingHours> = new Map();
  private marketConfigs: Map<string, MarketConfig> = new Map();

  constructor() {
    this.initializeTradingHours();
    this.initializeMarketConfigs();
  }

  private initializeTradingHours() {
    // Asian Markets
    this.tradingHours.set('india', {
      market: 'NSE',
      timezone: 'IST',
      openTime: '09:15',
      closeTime: '15:30',
      lunchBreak: { start: '11:30', end: '12:30' },
      preMarket: { start: '09:00', end: '09:15' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('japan', {
      market: 'TSE',
      timezone: 'JST',
      openTime: '09:00',
      closeTime: '15:00',
      lunchBreak: { start: '11:30', end: '12:30' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('china', {
      market: 'SSE',
      timezone: 'CST',
      openTime: '09:30',
      closeTime: '15:00',
      lunchBreak: { start: '11:30', end: '13:00' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('hongkong', {
      market: 'HKEX',
      timezone: 'HKT',
      openTime: '09:30',
      closeTime: '16:00',
      lunchBreak: { start: '12:00', end: '13:00' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('singapore', {
      market: 'SGX',
      timezone: 'SGT',
      openTime: '09:00',
      closeTime: '17:00',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('korea', {
      market: 'KRX',
      timezone: 'KST',
      openTime: '09:00',
      closeTime: '15:30',
      lunchBreak: { start: '11:40', end: '13:00' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    // European Markets
    this.tradingHours.set('london', {
      market: 'LSE',
      timezone: 'GMT',
      openTime: '08:00',
      closeTime: '16:30',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('euronext', {
      market: 'Euronext',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:30',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('xetra', {
      market: 'Xetra',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:30',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    // American Markets
    this.tradingHours.set('nyse', {
      market: 'NYSE',
      timezone: 'ET',
      openTime: '09:30',
      closeTime: '16:00',
      preMarket: { start: '04:00', end: '09:30' },
      afterHours: { start: '16:00', end: '20:00' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('nasdaq', {
      market: 'NASDAQ',
      timezone: 'ET',
      openTime: '09:30',
      closeTime: '16:00',
      preMarket: { start: '04:00', end: '09:30' },
      afterHours: { start: '16:00', end: '20:00' },
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('tsx', {
      market: 'TSX',
      timezone: 'ET',
      openTime: '09:30',
      closeTime: '16:00',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    // African Markets
    this.tradingHours.set('jse', {
      market: 'JSE',
      timezone: 'SAST',
      openTime: '09:00',
      closeTime: '17:00',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('egx', {
      market: 'EGX',
      timezone: 'EET',
      openTime: '10:00',
      closeTime: '14:30',
      tradingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      holidays: []
    });

    // Middle Eastern Markets
    this.tradingHours.set('tadawul', {
      market: 'Tadawul',
      timezone: 'AST',
      openTime: '10:00',
      closeTime: '15:00',
      tradingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      holidays: []
    });

    this.tradingHours.set('dfm', {
      market: 'DFM',
      timezone: 'GST',
      openTime: '10:00',
      closeTime: '14:00',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
      holidays: []
    });

    // Oceanic Markets
    this.tradingHours.set('asx', {
      market: 'ASX',
      timezone: 'AEST',
      openTime: '10:00',
      closeTime: '16:00',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });

    this.tradingHours.set('nzx', {
      market: 'NZX',
      timezone: 'NZST',
      openTime: '10:00',
      closeTime: '16:45',
      tradingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      holidays: []
    });
  }

  private initializeMarketConfigs() {
    // Initialize market configurations for regions
    const marketsByRegion = {
      asia: ASIAN_MARKETS,
      europe: EUROPEAN_MARKETS,
      americas: AMERICAN_MARKETS,
      africa: AFRICAN_MARKETS,
      'middle-east': MIDDLE_EASTERN_MARKETS,
      oceania: OCEANIC_MARKETS
    };
    Object.values(marketsByRegion).flat().forEach(market => {
      this.marketConfigs.set(market.id, market);
    });
  }

  public getOptimalTradingWindows(marketId: string): OptimizedTradingWindow {
    const hours = this.tradingHours.get(marketId);
    const config = this.marketConfigs.get(marketId);
    
    if (!hours || !config) {
      throw new Error(`Market configuration not found for ${marketId}`);
    }

    const crossMarketOpportunities = this.findCrossMarketOpportunities(marketId);
    
    return {
      market: hours.market,
      region: config.region,
      bestTradingTime: {
        start: this.calculateBestTradingStart(hours),
        end: this.calculateBestTradingEnd(hours),
        reason: this.getBestTradingReason(marketId)
      },
      peakVolumeTime: {
        start: this.calculatePeakVolumeStart(hours),
        end: this.calculatePeakVolumeEnd(hours),
        volumeMultiplier: this.getVolumeMultiplier(marketId)
      },
      lowVolatilityTime: {
        start: this.calculateLowVolatilityStart(hours),
        end: this.calculateLowVolatilityEnd(hours),
        volatilityReduction: this.getVolatilityReduction(marketId)
      },
      crossMarketOpportunities
    };
  }

  public getGlobalTradingSchedule(): GlobalTradingSchedule {
    const now = new Date();
    const currentTime = now.toISOString();
    const utcOffset = now.getTimezoneOffset();
    
    const activeMarkets = this.getActiveMarkets(now);
    const upcomingOpenings = this.getUpcomingOpenings(now);
    const upcomingClosings = this.getUpcomingClosings(now);
    const optimalTradingWindows = this.getAllOptimalTradingWindows();
    const globalLiquidityScore = this.calculateGlobalLiquidityScore(activeMarkets);
    const marketOverlapAnalysis = this.analyzeMarketOverlaps();

    return {
      currentTime,
      utcOffset: `UTC${utcOffset >= 0 ? '-' : '+'}${Math.abs(utcOffset / 60)}`,
      activeMarkets,
      upcomingOpenings,
      upcomingClosings,
      optimalTradingWindows,
      globalLiquidityScore,
      marketOverlapAnalysis
    };
  }

  private findCrossMarketOpportunities(marketId: string): OptimizedTradingWindow['crossMarketOpportunities'] {
    const opportunities: OptimizedTradingWindow['crossMarketOpportunities'] = [];
    const currentHours = this.tradingHours.get(marketId);
    
    if (!currentHours) return opportunities;

    // Find overlapping trading hours with other markets
    this.tradingHours.forEach((otherHours, otherId) => {
      if (otherId === marketId) return;

      const overlap = this.calculateTradingHoursOverlap(currentHours, otherHours);
      if (overlap.duration > 0) {
        opportunities.push({
          market: otherHours.market,
          overlapStart: overlap.start,
          overlapEnd: overlap.end,
          synergyScore: this.calculateSynergyScore(marketId, otherId)
        });
      }
    });

    return opportunities.sort((a, b) => b.synergyScore - a.synergyScore).slice(0, 5);
  }

  private calculateTradingHoursOverlap(hours1: TradingHours, hours2: TradingHours): { start: string; end: string; duration: number } {
    // Convert to UTC for comparison (simplified for demo)
    const h1Start = this.timeToMinutes(hours1.openTime);
    const h1End = this.timeToMinutes(hours1.closeTime);
    const h2Start = this.timeToMinutes(hours2.openTime);
    const h2End = this.timeToMinutes(hours2.closeTime);

    const overlapStart = Math.max(h1Start, h2Start);
    const overlapEnd = Math.min(h1End, h2End);
    const duration = Math.max(0, overlapEnd - overlapStart);

    return {
      start: this.minutesToTime(overlapStart),
      end: this.minutesToTime(overlapEnd),
      duration
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private calculateSynergyScore(market1: string, market2: string): number {
    // Simplified synergy calculation based on market correlations
    const synergyMap: Record<string, number> = {
      'nyse-nasdaq': 0.95,
      'london-nyse': 0.85,
      'tokyo-hongkong': 0.80,
      'jse-london': 0.75,
      'tadawul-dfm': 0.90,
      'asx-nzx': 0.85
    };

    const key1 = `${market1}-${market2}`;
    const key2 = `${market2}-${market1}`;
    
    return synergyMap[key1] || synergyMap[key2] || 0.5;
  }

  private calculateBestTradingStart(hours: TradingHours): string {
    // Best trading typically starts 30 minutes after open
    const openMinutes = this.timeToMinutes(hours.openTime);
    return this.minutesToTime(openMinutes + 30);
  }

  private calculateBestTradingEnd(hours: TradingHours): string {
    // Best trading ends 30 minutes before close
    const closeMinutes = this.timeToMinutes(hours.closeTime);
    return this.minutesToTime(closeMinutes - 30);
  }

  private getBestTradingReason(marketId: string): string {
    const reasons: Record<string, string> = {
      'nyse': 'High liquidity during core trading hours',
      'london': 'Optimal volatility during European session',
      'tokyo': 'Strong institutional participation',
      'jse': 'Peak trading activity during morning session',
      'tadawul': 'High volume during oil market hours'
    };
    return reasons[marketId] || 'Balanced liquidity and volatility';
  }

  private calculatePeakVolumeStart(hours: TradingHours): string {
    // Peak volume typically 1-2 hours after open
    const openMinutes = this.timeToMinutes(hours.openTime);
    return this.minutesToTime(openMinutes + 60);
  }

  private calculatePeakVolumeEnd(hours: TradingHours): string {
    const openMinutes = this.timeToMinutes(hours.openTime);
    return this.minutesToTime(openMinutes + 120);
  }

  private getVolumeMultiplier(marketId: string): number {
    const multipliers: Record<string, number> = {
      'nyse': 2.5,
      'nasdaq': 2.3,
      'london': 2.1,
      'tokyo': 1.8,
      'jse': 1.6,
      'tadawul': 1.7
    };
    return multipliers[marketId] || 1.5;
  }

  private calculateLowVolatilityStart(hours: TradingHours): string {
    // Low volatility typically during lunch break or late afternoon
    if (hours.lunchBreak) {
      return hours.lunchBreak.start;
    }
    const closeMinutes = this.timeToMinutes(hours.closeTime);
    return this.minutesToTime(closeMinutes - 90);
  }

  private calculateLowVolatilityEnd(hours: TradingHours): string {
    if (hours.lunchBreak) {
      return hours.lunchBreak.end;
    }
    const closeMinutes = this.timeToMinutes(hours.closeTime);
    return this.minutesToTime(closeMinutes - 30);
  }

  private getVolatilityReduction(marketId: string): number {
    const reductions: Record<string, number> = {
      'nyse': 0.65,
      'london': 0.60,
      'tokyo': 0.70,
      'jse': 0.55,
      'tadawul': 0.58
    };
    return reductions[marketId] || 0.60;
  }

  private getActiveMarkets(now: Date): string[] {
    const activeMarkets: string[] = [];
    
    this.tradingHours.forEach((hours, marketId) => {
      if (this.isMarketActive(hours, now)) {
        activeMarkets.push(hours.market);
      }
    });

    return activeMarkets;
  }

  private isMarketActive(hours: TradingHours, now: Date): boolean {
    // Simplified active check - in real implementation, would consider timezone conversion
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = this.timeToMinutes(hours.openTime);
    const closeMinutes = this.timeToMinutes(hours.closeTime);
    
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  private getUpcomingOpenings(now: Date): GlobalTradingSchedule['upcomingOpenings'] {
    const openings: GlobalTradingSchedule['upcomingOpenings'] = [];
    
    this.tradingHours.forEach((hours, marketId) => {
      if (!this.isMarketActive(hours, now)) {
        const openMinutes = this.timeToMinutes(hours.openTime);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const timeUntilOpen = openMinutes - currentMinutes;
        
        if (timeUntilOpen > 0 && timeUntilOpen < 480) { // Within 8 hours
          openings.push({
            market: hours.market,
            timeUntilOpen: `${Math.floor(timeUntilOpen / 60)}h ${timeUntilOpen % 60}m`,
            openTime: hours.openTime
          });
        }
      }
    });

    return openings.sort((a, b) => {
      const timeA = parseInt(a.timeUntilOpen);
      const timeB = parseInt(b.timeUntilOpen);
      return timeA - timeB;
    }).slice(0, 5);
  }

  private getUpcomingClosings(now: Date): GlobalTradingSchedule['upcomingClosings'] {
    const closings: GlobalTradingSchedule['upcomingClosings'] = [];
    
    this.tradingHours.forEach((hours, marketId) => {
      if (this.isMarketActive(hours, now)) {
        const closeMinutes = this.timeToMinutes(hours.closeTime);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const timeUntilClose = closeMinutes - currentMinutes;
        
        if (timeUntilClose > 0 && timeUntilClose < 240) { // Within 4 hours
          closings.push({
            market: hours.market,
            timeUntilClose: `${Math.floor(timeUntilClose / 60)}h ${timeUntilClose % 60}m`,
            closeTime: hours.closeTime
          });
        }
      }
    });

    return closings.sort((a, b) => {
      const timeA = parseInt(a.timeUntilClose);
      const timeB = parseInt(b.timeUntilClose);
      return timeA - timeB;
    }).slice(0, 5);
  }

  private getAllOptimalTradingWindows(): OptimizedTradingWindow[] {
    const windows: OptimizedTradingWindow[] = [];
    
    this.tradingHours.forEach((hours, marketId) => {
      try {
        const window = this.getOptimalTradingWindows(marketId);
        windows.push(window);
      } catch (error) {
        console.warn(`Could not get optimal trading window for ${marketId}:`, error);
      }
    });

    return windows.sort((a, b) => {
      const scoreA = this.calculateWindowScore(a);
      const scoreB = this.calculateWindowScore(b);
      return scoreB - scoreA;
    }).slice(0, 10);
  }

  private calculateWindowScore(window: OptimizedTradingWindow): number {
    // Calculate a composite score based on various factors
    const volumeScore = window.peakVolumeTime.volumeMultiplier;
    const volatilityScore = 1 - window.lowVolatilityTime.volatilityReduction;
    const opportunityScore = window.crossMarketOpportunities.length * 0.1;
    
    return volumeScore + volatilityScore + opportunityScore;
  }

  private calculateGlobalLiquidityScore(activeMarkets: string[]): number {
    // Calculate global liquidity based on active markets
    const marketWeights: Record<string, number> = {
      'NYSE': 0.25,
      'NASDAQ': 0.20,
      'LSE': 0.15,
      'TSE': 0.12,
      'SSE': 0.10,
      'HKEX': 0.08,
      'JSE': 0.05,
      'Tadawul': 0.05
    };

    let totalWeight = 0;
    activeMarkets.forEach(market => {
      totalWeight += marketWeights[market] || 0.02;
    });

    return Math.min(totalWeight, 1.0);
  }

  private analyzeMarketOverlaps(): GlobalTradingSchedule['marketOverlapAnalysis'] {
    const overlaps: GlobalTradingSchedule['marketOverlapAnalysis'] = [];
    const regionPairs = [
      { region1: 'asia', region2: 'europe' },
      { region1: 'europe', region2: 'americas' },
      { region1: 'asia', region2: 'americas' },
      { region1: 'africa', region2: 'europe' },
      { region1: 'middle-east', region2: 'europe' },
      { region1: 'oceania', region2: 'asia' }
    ];

    regionPairs.forEach(pair => {
      const overlap = this.calculateRegionOverlap(pair.region1, pair.region2);
      if (overlap.duration > 0) {
        overlaps.push({
          region1: pair.region1,
          region2: pair.region2,
          overlapDuration: overlap.duration,
          synergyScore: overlap.synergyScore
        });
      }
    });

    return overlaps.sort((a, b) => b.synergyScore - a.synergyScore);
  }

  private calculateRegionOverlap(region1: string, region2: string): { duration: number; synergyScore: number } {
    // Simplified region overlap calculation
    const overlapMap: Record<string, { duration: number; synergyScore: number }> = {
      'asia-europe': { duration: 120, synergyScore: 0.75 },
      'europe-americas': { duration: 180, synergyScore: 0.85 },
      'asia-americas': { duration: 60, synergyScore: 0.45 },
      'africa-europe': { duration: 240, synergyScore: 0.80 },
      'middle-east-europe': { duration: 180, synergyScore: 0.70 },
      'oceania-asia': { duration: 300, synergyScore: 0.65 }
    };

    const key = `${region1}-${region2}`;
    const reverseKey = `${region2}-${region1}`;
    
    return overlapMap[key] || overlapMap[reverseKey] || { duration: 0, synergyScore: 0 };
  }
}

// Singleton instance
export const tradingHoursOptimizer = new TradingHoursOptimizer();