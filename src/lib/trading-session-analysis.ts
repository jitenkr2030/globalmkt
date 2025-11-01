export interface TradingSession {
  id: string;
  name: string;
  market: string;
  timezone: string;
  openTime: string;
  closeTime: string;
  breakStart?: string;
  breakEnd?: string;
  isActive: boolean;
  duration: number; // in minutes
  overlapMarkets: string[];
  volumeProfile: 'low' | 'medium' | 'high';
  volatilityProfile: 'low' | 'medium' | 'high';
}

export interface SessionOverlap {
  session1: string;
  session2: string;
  overlapStart: string;
  overlapEnd: string;
  overlapDuration: number; // in minutes
  significance: 'low' | 'medium' | 'high';
  typicalVolume: number;
}

export interface TradingDayAnalysis {
  date: string;
  market: string;
  sessions: TradingSession[];
  totalTradingMinutes: number;
  peakVolumeTimes: string[];
  overlapAnalysis: SessionOverlap[];
  liquidityScore: number;
  recommendation: string;
}

export interface MarketSessionStats {
  market: string;
  averageDailyVolume: number;
  peakSessionVolume: number;
  mostActiveSession: string;
  sessionEfficiency: number;
  bestTradingTimes: string[];
  riskFactors: string[];
}

class TradingSessionAnalyzer {
  private readonly europeanSessions: TradingSession[] = [
    {
      id: 'london-morning',
      name: 'London Morning Session',
      market: 'london',
      timezone: 'GMT',
      openTime: '08:00',
      closeTime: '12:00',
      isActive: true,
      duration: 240,
      overlapMarkets: ['euronext', 'xetra'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'london-afternoon',
      name: 'London Afternoon Session',
      market: 'london',
      timezone: 'GMT',
      openTime: '12:00',
      closeTime: '16:30',
      isActive: true,
      duration: 270,
      overlapMarkets: ['euronext', 'xetra', 'new-york'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'euronext-continuous',
      name: 'Euronext Continuous Trading',
      market: 'euronext',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:30',
      isActive: true,
      duration: 510,
      overlapMarkets: ['london', 'xetra'],
      volumeProfile: 'high',
      volatilityProfile: 'medium'
    },
    {
      id: 'xetra-continuous',
      name: 'Xetra Continuous Trading',
      market: 'xetra',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:30',
      isActive: true,
      duration: 510,
      overlapMarkets: ['euronext', 'london'],
      volumeProfile: 'high',
      volatilityProfile: 'medium'
    },
    {
      id: 'six-continuous',
      name: 'SIX Swiss Continuous Trading',
      market: 'six',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:30',
      isActive: true,
      duration: 510,
      overlapMarkets: ['xetra'],
      volumeProfile: 'medium',
      volatilityProfile: 'low'
    },
    {
      id: 'bme-continuous',
      name: 'BME Spanish Continuous Trading',
      market: 'bme',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:30',
      isActive: true,
      duration: 510,
      overlapMarkets: ['euronext'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'nasdaq-nordic-continuous',
      name: 'Nasdaq Nordic Continuous Trading',
      market: 'nasdaq-nordic',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '17:25',
      isActive: true,
      duration: 505,
      overlapMarkets: [],
      volumeProfile: 'low',
      volatilityProfile: 'low'
    },
    {
      id: 'oslo-continuous',
      name: 'Oslo Børs Continuous Trading',
      market: 'oslo',
      timezone: 'CET',
      openTime: '09:00',
      closeTime: '16:20',
      isActive: true,
      duration: 440,
      overlapMarkets: [],
      volumeProfile: 'low',
      volatilityProfile: 'low'
    }
  ];

  private readonly asianSessions: TradingSession[] = [
    {
      id: 'tokyo-morning',
      name: 'Tokyo Morning Session',
      market: 'japan',
      timezone: 'JST',
      openTime: '09:00',
      closeTime: '11:30',
      breakStart: '11:30',
      breakEnd: '12:30',
      isActive: true,
      duration: 150,
      overlapMarkets: ['korea', 'hongkong'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'tokyo-afternoon',
      name: 'Tokyo Afternoon Session',
      market: 'japan',
      timezone: 'JST',
      openTime: '12:30',
      closeTime: '15:00',
      isActive: true,
      duration: 150,
      overlapMarkets: ['korea', 'hongkong'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'shanghai-continuous',
      name: 'Shanghai Continuous Trading',
      market: 'china',
      timezone: 'CST',
      openTime: '09:30',
      closeTime: '15:00',
      isActive: true,
      duration: 330,
      overlapMarkets: ['hongkong'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'hongkong-continuous',
      name: 'Hong Kong Continuous Trading',
      market: 'hongkong',
      timezone: 'HKT',
      openTime: '09:30',
      closeTime: '16:00',
      isActive: true,
      duration: 390,
      overlapMarkets: ['china', 'singapore'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'singapore-continuous',
      name: 'Singapore Continuous Trading',
      market: 'singapore',
      timezone: 'SGT',
      openTime: '09:00',
      closeTime: '17:00',
      isActive: true,
      duration: 480,
      overlapMarkets: ['hongkong'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'korea-continuous',
      name: 'Korea Continuous Trading',
      market: 'korea',
      timezone: 'KST',
      openTime: '09:00',
      closeTime: '15:30',
      isActive: true,
      duration: 390,
      overlapMarkets: ['japan'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'nse-continuous',
      name: 'NSE Continuous Trading',
      market: 'india',
      timezone: 'IST',
      openTime: '09:15',
      closeTime: '15:30',
      isActive: true,
      duration: 375,
      overlapMarkets: [],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'nepse-continuous',
      name: 'NEPSE Continuous Trading',
      market: 'nepal',
      timezone: 'NPT',
      openTime: '11:00',
      closeTime: '15:00',
      isActive: true,
      duration: 240,
      overlapMarkets: [],
      volumeProfile: 'low',
      volatilityProfile: 'medium'
    }
  ];

  private readonly americanSessions: TradingSession[] = [
    {
      id: 'nyse-pre-market',
      name: 'NYSE Pre-Market',
      market: 'nyse',
      timezone: 'America/New_York',
      openTime: '04:00',
      closeTime: '09:30',
      isActive: true,
      duration: 330,
      overlapMarkets: ['nasdaq'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'nyse-core',
      name: 'NYSE Core Session',
      market: 'nyse',
      timezone: 'America/New_York',
      openTime: '09:30',
      closeTime: '16:00',
      isActive: true,
      duration: 390,
      overlapMarkets: ['nasdaq', 'tsx'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'nyse-after-hours',
      name: 'NYSE After Hours',
      market: 'nyse',
      timezone: 'America/New_York',
      openTime: '16:00',
      closeTime: '20:00',
      isActive: true,
      duration: 240,
      overlapMarkets: ['nasdaq'],
      volumeProfile: 'low',
      volatilityProfile: 'medium'
    },
    {
      id: 'nasdaq-pre-market',
      name: 'NASDAQ Pre-Market',
      market: 'nasdaq',
      timezone: 'America/New_York',
      openTime: '04:00',
      closeTime: '09:30',
      isActive: true,
      duration: 330,
      overlapMarkets: ['nyse'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'nasdaq-core',
      name: 'NASDAQ Core Session',
      market: 'nasdaq',
      timezone: 'America/New_York',
      openTime: '09:30',
      closeTime: '16:00',
      isActive: true,
      duration: 390,
      overlapMarkets: ['nyse', 'tsx'],
      volumeProfile: 'high',
      volatilityProfile: 'high'
    },
    {
      id: 'nasdaq-after-hours',
      name: 'NASDAQ After Hours',
      market: 'nasdaq',
      timezone: 'America/New_York',
      openTime: '16:00',
      closeTime: '20:00',
      isActive: true,
      duration: 240,
      overlapMarkets: ['nyse'],
      volumeProfile: 'low',
      volatilityProfile: 'medium'
    },
    {
      id: 'cme-globex',
      name: 'CME Globex Electronic Trading',
      market: 'cme',
      timezone: 'America/Chicago',
      openTime: '18:00',
      closeTime: '17:00',
      breakStart: '17:00',
      breakEnd: '18:00',
      isActive: true,
      duration: 1380,
      overlapMarkets: ['nyse', 'nasdaq'],
      volumeProfile: 'high',
      volatilityProfile: 'medium'
    },
    {
      id: 'tsx-core',
      name: 'TSX Core Session',
      market: 'tsx',
      timezone: 'America/Toronto',
      openTime: '09:30',
      closeTime: '16:00',
      isActive: true,
      duration: 390,
      overlapMarkets: ['nyse', 'nasdaq'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'bmv-core',
      name: 'BMV Core Session',
      market: 'bmv',
      timezone: 'America/Mexico_City',
      openTime: '08:30',
      closeTime: '15:00',
      isActive: true,
      duration: 390,
      overlapMarkets: ['nyse'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'b3-core',
      name: 'B3 Core Session',
      market: 'b3',
      timezone: 'America/Sao_Paulo',
      openTime: '10:00',
      closeTime: '17:00',
      isActive: true,
      duration: 420,
      overlapMarkets: ['nyse'],
      volumeProfile: 'medium',
      volatilityProfile: 'medium'
    },
    {
      id: 'bca-core',
      name: 'BCBA Core Session',
      market: 'bca',
      timezone: 'America/Argentina/Buenos_Aires',
      openTime: '11:00',
      closeTime: '17:00',
      isActive: true,
      duration: 360,
      overlapMarkets: ['nyse'],
      volumeProfile: 'low',
      volatilityProfile: 'medium'
    }
  ];

  getAllSessions(): TradingSession[] {
    return [...this.europeanSessions, ...this.asianSessions, ...this.americanSessions];
  }

  getSessionsByMarket(market: string): TradingSession[] {
    return this.getAllSessions().filter(session => session.market === market);
  }

  getSessionsByRegion(region: 'asia' | 'europe' | 'americas'): TradingSession[] {
    switch (region) {
      case 'europe':
        return this.europeanSessions;
      case 'asia':
        return this.asianSessions;
      case 'americas':
        return this.americanSessions;
      default:
        return this.getAllSessions();
    }
  }

  calculateSessionOverlaps(market1: string, market2: string): SessionOverlap[] {
    const sessions1 = this.getSessionsByMarket(market1);
    const sessions2 = this.getSessionsByMarket(market2);
    const overlaps: SessionOverlap[] = [];

    sessions1.forEach(session1 => {
      sessions2.forEach(session2 => {
        const overlap = this.calculateOverlap(session1, session2);
        if (overlap.overlapDuration > 0) {
          overlaps.push(overlap);
        }
      });
    });

    return overlaps.sort((a, b) => b.overlapDuration - a.overlapDuration);
  }

  private calculateOverlap(session1: TradingSession, session2: TradingSession): SessionOverlap {
    // Simplified overlap calculation - in real implementation, would handle timezone conversions
    const start1 = this.timeToMinutes(session1.openTime);
    const end1 = this.timeToMinutes(session1.closeTime);
    const start2 = this.timeToMinutes(session2.openTime);
    const end2 = this.timeToMinutes(session2.closeTime);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    const overlapDuration = Math.max(0, overlapEnd - overlapStart);

    const significance = overlapDuration > 120 ? 'high' : overlapDuration > 60 ? 'medium' : 'low';
    const typicalVolume = this.calculateTypicalVolume(session1, session2, overlapDuration);

    return {
      session1: session1.id,
      session2: session2.id,
      overlapStart: this.minutesToTime(overlapStart),
      overlapEnd: this.minutesToTime(overlapEnd),
      overlapDuration,
      significance,
      typicalVolume
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

  private calculateTypicalVolume(session1: TradingSession, session2: TradingSession, overlapDuration: number): number {
    const volumeMultiplier = session1.volumeProfile === 'high' && session2.volumeProfile === 'high' ? 1.5 :
                            session1.volumeProfile === 'high' || session2.volumeProfile === 'high' ? 1.2 : 1.0;
    
    const baseVolume = 1000000; // Base volume in shares
    return Math.round(baseVolume * volumeMultiplier * (overlapDuration / 60));
  }

  analyzeTradingDay(date: string, market: string): TradingDayAnalysis {
    const sessions = this.getSessionsByMarket(market);
    const totalTradingMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    
    const peakVolumeTimes = this.calculatePeakVolumeTimes(sessions);
    const overlapAnalysis = this.calculateMarketOverlaps(market);
    const liquidityScore = this.calculateLiquidityScore(sessions, overlapAnalysis);
    const recommendation = this.generateRecommendation(sessions, overlapAnalysis, liquidityScore);

    return {
      date,
      market,
      sessions,
      totalTradingMinutes,
      peakVolumeTimes,
      overlapAnalysis,
      liquidityScore,
      recommendation
    };
  }

  private calculatePeakVolumeTimes(sessions: TradingSession[]): string[] {
    return sessions
      .filter(session => session.volumeProfile === 'high')
      .map(session => `${session.openTime}-${session.closeTime}`);
  }

  private calculateMarketOverlaps(market: string): SessionOverlap[] {
    const allMarkets = ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo', 
                       'japan', 'china', 'hongkong', 'singapore', 'korea', 'india', 'nepal',
                       'nyse', 'nasdaq', 'cme', 'tsx', 'bmv', 'b3', 'bca'];
    const overlaps: SessionOverlap[] = [];

    allMarkets.forEach(otherMarket => {
      if (otherMarket !== market) {
        const marketOverlaps = this.calculateSessionOverlaps(market, otherMarket);
        overlaps.push(...marketOverlaps);
      }
    });

    return overlaps.filter(overlap => overlap.significance === 'high').slice(0, 5);
  }

  private calculateLiquidityScore(sessions: TradingSession[], overlaps: SessionOverlap[]): number {
    let score = 50; // Base score

    // Add points for high volume sessions
    sessions.forEach(session => {
      if (session.volumeProfile === 'high') score += 15;
      if (session.volumeProfile === 'medium') score += 8;
    });

    // Add points for significant overlaps
    overlaps.forEach(overlap => {
      if (overlap.significance === 'high') score += 10;
      if (overlap.significance === 'medium') score += 5;
    });

    return Math.min(100, Math.max(0, score));
  }

  private generateRecommendation(sessions: TradingSession[], overlaps: SessionOverlap[], liquidityScore: number): string {
    if (liquidityScore >= 80) {
      return "Excellent trading conditions with high liquidity and multiple session overlaps. Ideal for large orders and active trading.";
    } else if (liquidityScore >= 60) {
      return "Good trading conditions with moderate liquidity. Suitable for most trading strategies.";
    } else if (liquidityScore >= 40) {
      return "Moderate trading conditions. Consider timing trades during peak volume sessions.";
    } else {
      return "Limited trading conditions. Exercise caution and consider trading during major market overlaps.";
    }
  }

  getMarketSessionStats(market: string): MarketSessionStats {
    const sessions = this.getSessionsByMarket(market);
    const overlaps = this.calculateMarketOverlaps(market);
    
    const averageDailyVolume = this.calculateAverageDailyVolume(sessions);
    const peakSessionVolume = this.calculatePeakSessionVolume(sessions);
    const mostActiveSession = this.findMostActiveSession(sessions);
    const sessionEfficiency = this.calculateSessionEfficiency(sessions, overlaps);
    const bestTradingTimes = this.findBestTradingTimes(sessions, overlaps);
    const riskFactors = this.identifyRiskFactors(sessions, overlaps);

    return {
      market,
      averageDailyVolume,
      peakSessionVolume,
      mostActiveSession,
      sessionEfficiency,
      bestTradingTimes,
      riskFactors
    };
  }

  private calculateAverageDailyVolume(sessions: TradingSession[]): number {
    const baseVolume = 50000000; // Base daily volume
    const volumeMultiplier = sessions.reduce((sum, session) => {
      const multiplier = session.volumeProfile === 'high' ? 1.5 : 
                        session.volumeProfile === 'medium' ? 1.2 : 1.0;
      return sum + multiplier;
    }, 0);
    
    return Math.round(baseVolume * volumeMultiplier / sessions.length);
  }

  private calculatePeakSessionVolume(sessions: TradingSession[]): number {
    const highVolumeSessions = sessions.filter(s => s.volumeProfile === 'high');
    if (highVolumeSessions.length === 0) return 0;
    
    const baseVolume = 30000000;
    return Math.round(baseVolume * 1.5);
  }

  private findMostActiveSession(sessions: TradingSession[]): string {
    const highVolumeSessions = sessions.filter(s => s.volumeProfile === 'high');
    if (highVolumeSessions.length === 0) return sessions[0]?.name || '';
    
    return highVolumeSessions[0].name;
  }

  private calculateSessionEfficiency(sessions: TradingSession[], overlaps: SessionOverlap[]): number {
    let efficiency = 70; // Base efficiency
    
    // Add efficiency for high volume sessions
    sessions.forEach(session => {
      if (session.volumeProfile === 'high') efficiency += 10;
    });
    
    // Add efficiency for significant overlaps
    const highSignificanceOverlaps = overlaps.filter(o => o.significance === 'high');
    efficiency += highSignificanceOverlaps.length * 5;
    
    return Math.min(100, efficiency);
  }

  private findBestTradingTimes(sessions: TradingSession[], overlaps: SessionOverlap[]): string[] {
    const bestTimes: string[] = [];
    
    // High volume sessions
    sessions.filter(s => s.volumeProfile === 'high').forEach(session => {
      bestTimes.push(`${session.openTime}-${session.closeTime} (${session.name})`);
    });
    
    // High significance overlaps
    overlaps.filter(o => o.significance === 'high').forEach(overlap => {
      bestTimes.push(`${overlap.overlapStart}-${overlap.overlapEnd} (Overlap)`);
    });
    
    return bestTimes.slice(0, 3);
  }

  private identifyRiskFactors(sessions: TradingSession[], overlaps: SessionOverlap[]): string[] {
    const risks: string[] = [];
    
    // Low volume sessions
    const lowVolumeSessions = sessions.filter(s => s.volumeProfile === 'low');
    if (lowVolumeSessions.length > 0) {
      risks.push('Low volume periods may result in poor liquidity');
    }
    
    // Limited overlaps
    if (overlaps.filter(o => o.significance === 'high').length === 0) {
      risks.push('Limited market overlap may reduce trading opportunities');
    }
    
    // High volatility sessions
    const highVolatilitySessions = sessions.filter(s => s.volatilityProfile === 'high');
    if (highVolatilitySessions.length > 0) {
      risks.push('High volatility sessions require careful risk management');
    }
    
    return risks;
  }

  getCrossRegionalSessionAnalysis(): {
    europeanAsianOverlaps: SessionOverlap[];
    peakGlobalTradingHours: string[];
    totalOverlapMinutes: number;
  } {
    const europeanSessions = this.europeanSessions;
    const asianSessions = this.asianSessions;
    const overlaps: SessionOverlap[] = [];

    // Calculate overlaps between European and Asian sessions
    europeanSessions.forEach(euSession => {
      asianSessions.forEach(asSession => {
        const overlap = this.calculateOverlap(euSession, asSession);
        if (overlap.overlapDuration > 0) {
          overlaps.push(overlap);
        }
      });
    });

    // Find peak global trading hours
    const peakHours = this.findPeakGlobalTradingHours(overlaps);
    const totalOverlapMinutes = overlaps.reduce((sum, overlap) => sum + overlap.overlapDuration, 0);

    return {
      europeanAsianOverlaps: overlaps,
      peakGlobalTradingHours: peakHours,
      totalOverlapMinutes
    };
  }

  private findPeakGlobalTradingHours(overlaps: SessionOverlap[]): string[] {
    const overlapCounts: { [time: string]: number } = {};
    
    overlaps.forEach(overlap => {
      const start = this.timeToMinutes(overlap.overlapStart);
      const end = this.timeToMinutes(overlap.overlapEnd);
      
      for (let time = start; time < end; time += 30) { // 30-minute intervals
        const timeStr = this.minutesToTime(time);
        overlapCounts[timeStr] = (overlapCounts[timeStr] || 0) + 1;
      }
    });

    return Object.entries(overlapCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);
  }
}

export const tradingSessionAnalyzer = new TradingSessionAnalyzer();
export default TradingSessionAnalyzer;