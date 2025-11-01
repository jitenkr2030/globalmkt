import { MarketConfig } from '../market-config';

export interface JapaneseStockData {
  symbol: string;
  name: string;
  nameJa: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  lastUpdated: Date;
}

export interface JapaneseTechnicalIndicators {
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  macd: number;
  signal: number;
  histogram: number;
  ichimoku: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
    chikou: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface JapaneseFundamentalData {
  pe: number;
  pb: number;
  eps: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
  bookValue: number;
  marketCap: number;
  sharesOutstanding: number;
  quarterlyRevenue: number;
  quarterlyProfit: number;
}

export interface JapaneseHoliday {
  date: string;
  name: string;
  nameJa: string;
  type: 'national' | 'golden-week' | 'obon' | 'new-year' | 'market';
}

export interface JapaneseMarketPattern {
  pattern: 'morning-star' | 'evening-star' | 'doji' | 'hammer' | 'hanging-man' | 'engulfing' | 'harami';
  strength: number;
  timeframe: '1d' | '4h' | '1h' | '30m';
  detected: Date;
  confidence: number;
}

export class JapaneseMarketAdapter {
  private config: MarketConfig;
  private holidays: JapaneseHoliday[];

  constructor(config: MarketConfig) {
    this.config = config;
    this.holidays = this.initializeJapaneseHolidays();
  }

  private initializeJapaneseHolidays(): JapaneseHoliday[] {
    return [
      { date: '2024-01-01', name: 'New Year', nameJa: '元日', type: 'new-year' },
      { date: '2024-01-02', name: 'New Year Holiday', nameJa: '新年休暇', type: 'new-year' },
      { date: '2024-01-03', name: 'New Year Holiday', nameJa: '新年休暇', type: 'new-year' },
      { date: '2024-01-08', name: 'Coming of Age Day', nameJa: '成人の日', type: 'national' },
      { date: '2024-02-11', name: 'National Foundation Day', nameJa: '建国記念の日', type: 'national' },
      { date: '2024-02-23', name: 'Emperor Birthday', nameJa: '天皇誕生日', type: 'national' },
      { date: '2024-03-20', name: 'Vernal Equinox Day', nameJa: '春分の日', type: 'national' },
      { date: '2024-04-29', name: 'Showa Day', nameJa: '昭和の日', type: 'golden-week' },
      { date: '2024-05-03', name: 'Constitution Memorial Day', nameJa: '憲法記念日', type: 'golden-week' },
      { date: '2024-05-04', name: 'Greenery Day', nameJa: 'みどりの日', type: 'golden-week' },
      { date: '2024-05-05', name: 'Children Day', nameJa: 'こどもの日', type: 'golden-week' },
      { date: '2024-05-06', name: 'Golden Week Holiday', nameJa: 'ゴールデンウィーク休暇', type: 'golden-week' },
      { date: '2024-07-15', name: 'Marine Day', nameJa: '海の日', type: 'national' },
      { date: '2024-08-11', name: 'Mountain Day', nameJa: '山の日', type: 'national' },
      { date: '2024-08-12', name: 'Mountain Day Holiday', nameJa: '山の日休暇', type: 'national' },
      { date: '2024-09-16', name: 'Respect for the Aged Day', nameJa: '敬老の日', type: 'national' },
      { date: '2024-09-22', name: 'Autumnal Equinox Day', nameJa: '秋分の日', type: 'national' },
      { date: '2024-10-14', name: 'Sports Day', nameJa: 'スポーツの日', type: 'national' },
      { date: '2024-11-04', name: 'Culture Day', nameJa: '文化の日', type: 'national' },
      { date: '2024-11-23', name: 'Labor Thanksgiving Day', nameJa: '勤労感謝の日', type: 'national' },
      { date: '2024-12-31', name: 'New Year Eve', nameJa: '大晦日', type: 'new-year' }
    ];
  }

  async fetchStockData(symbol: string): Promise<JapaneseStockData> {
    // Simulate API call delay for Japan's network conditions
    await this.simulateNetworkDelay();
    
    // Generate realistic TSE stock data
    const basePrice = Math.random() * 50000 + 1000; // JPY 1,000-51,000
    const change = (Math.random() - 0.5) * basePrice * 0.015; // ±1.5% volatility
    const changePercent = (change / basePrice) * 100;
    const volume = Math.floor(Math.random() * 10000000) + 100000; // Higher volume for developed market
    
    return {
      symbol,
      name: this.getStockName(symbol),
      nameJa: this.getStockNameJapanese(symbol),
      price: basePrice,
      change,
      changePercent,
      volume,
      marketCap: basePrice * volume * 1000,
      sector: this.getStockSector(symbol),
      lastUpdated: new Date()
    };
  }

  async fetchMarketIndices(): Promise<{
    nikkei225: {
      value: number;
      change: number;
      changePercent: number;
      volume: number;
    };
    topix: {
      value: number;
      change: number;
      changePercent: number;
      volume: number;
    };
    jpxNikkei400: {
      value: number;
      change: number;
      changePercent: number;
      volume: number;
    };
  }> {
    await this.simulateNetworkDelay();
    
    // Generate realistic index data
    const nikkeiBase = 32000 + Math.random() * 2000;
    const topixBase = 2200 + Math.random() * 200;
    const jpxBase = 18000 + Math.random() * 1000;
    
    return {
      nikkei225: {
        value: nikkeiBase,
        change: (Math.random() - 0.5) * 200,
        changePercent: (Math.random() - 0.5) * 0.6,
        volume: Math.floor(Math.random() * 500000000) + 200000000
      },
      topix: {
        value: topixBase,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 0.8,
        volume: Math.floor(Math.random() * 300000000) + 100000000
      },
      jpxNikkei400: {
        value: jpxBase,
        change: (Math.random() - 0.5) * 100,
        changePercent: (Math.random() - 0.5) * 0.5,
        volume: Math.floor(Math.random() * 200000000) + 80000000
      }
    };
  }

  async fetchTechnicalIndicators(symbol: string): Promise<JapaneseTechnicalIndicators> {
    await this.simulateNetworkDelay();
    
    const stockData = await this.fetchStockData(symbol);
    const price = stockData.price;
    
    // Generate realistic technical indicators with Japanese emphasis
    const rsi = Math.random() * 100;
    const sma20 = price * (0.98 + Math.random() * 0.04);
    const sma50 = price * (0.95 + Math.random() * 0.1);
    const sma200 = price * (0.90 + Math.random() * 0.2);
    const ema12 = price * (0.99 + Math.random() * 0.02);
    const ema26 = price * (0.97 + Math.random() * 0.06);
    const macd = ema12 - ema26;
    const signal = macd * (0.8 + Math.random() * 0.4);
    const histogram = macd - signal;
    
    // Ichimoku Cloud - Japanese specific indicator
    const ichimoku = {
      tenkan: price * (0.99 + Math.random() * 0.02),
      kijun: price * (0.97 + Math.random() * 0.06),
      senkouA: price * (0.95 + Math.random() * 0.1),
      senkouB: price * (0.93 + Math.random() * 0.14),
      chikou: price * (0.98 + Math.random() * 0.04)
    };
    
    // Bollinger Bands
    const stdDev = price * 0.015;
    const bollingerBands = {
      upper: sma20 + (stdDev * 2),
      middle: sma20,
      lower: sma20 - (stdDev * 2)
    };
    
    return {
      rsi,
      sma20,
      sma50,
      sma200,
      ema12,
      ema26,
      macd,
      signal,
      histogram,
      ichimoku,
      bollingerBands
    };
  }

  async fetchFundamentalData(symbol: string): Promise<JapaneseFundamentalData> {
    await this.simulateNetworkDelay();
    
    // Generate realistic fundamental data for Japanese companies
    const pe = Math.random() * 20 + 8; // 8-28 P/E ratio (Japan typically lower)
    const pb = Math.random() * 2 + 0.5; // 0.5-2.5 P/B ratio
    const eps = Math.random() * 500 + 50; // JPY 50-550 EPS
    const dividendYield = Math.random() * 4 + 1; // 1-5% dividend yield (Japan higher dividends)
    const roe = Math.random() * 15 + 5; // 5-20% ROE
    const debtToEquity = Math.random() * 1.5 + 0.1; // 0.1-1.6 debt-to-equity
    const currentRatio = Math.random() * 2 + 1; // 1-3 current ratio
    const bookValue = Math.random() * 10000 + 1000; // JPY 1,000-11,000 book value
    const marketCap = Math.random() * 10000000000000 + 100000000000; // JPY 100B-10T
    const sharesOutstanding = Math.floor(marketCap / (eps * pe));
    const quarterlyRevenue = Math.random() * 5000000000000 + 100000000000; // JPY 100B-5T
    const quarterlyProfit = quarterlyRevenue * (Math.random() * 0.1 + 0.02); // 2-12% profit margin
    
    return {
      pe,
      pb,
      eps,
      dividendYield,
      roe,
      debtToEquity,
      currentRatio,
      bookValue,
      marketCap,
      sharesOutstanding,
      quarterlyRevenue,
      quarterlyProfit
    };
  }

  async detectMarketPatterns(symbol: string): Promise<JapaneseMarketPattern[]> {
    await this.simulateNetworkDelay();
    
    const patterns: JapaneseMarketPattern[] = [];
    const patternTypes: JapaneseMarketPattern['pattern'][] = [
      'morning-star', 'evening-star', 'doji', 'hammer', 'hanging-man', 'engulfing', 'harami'
    ];
    
    // Generate random pattern detections
    const numPatterns = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numPatterns; i++) {
      const pattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
      patterns.push({
        pattern,
        strength: Math.random(),
        timeframe: ['1d', '4h', '1h', '30m'][Math.floor(Math.random() * 4)] as JapaneseMarketPattern['timeframe'],
        detected: new Date(Date.now() - Math.random() * 86400000), // Within last 24 hours
        confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
      });
    }
    
    return patterns;
  }

  async fetchMarketSentiment(): Promise<{
    overall: number; // -1 to 1
    foreignInvestment: number;
    institutional: number;
    retail: number;
    marketMood: 'bullish' | 'bearish' | 'neutral';
    keyFactors: string[];
  }> {
    await this.simulateNetworkDelay();
    
    const overall = (Math.random() - 0.5) * 2; // -1 to 1
    const foreignInvestment = (Math.random() - 0.5) * 2;
    const institutional = (Math.random() - 0.5) * 2;
    const retail = (Math.random() - 0.5) * 2;
    
    const marketMood = overall > 0.2 ? 'bullish' : overall < -0.2 ? 'bearish' : 'neutral';
    
    const keyFactors = [
      'BOJ monetary policy',
      'USD/JPY exchange rate',
      'Corporate earnings season',
      'Global market trends',
      'Economic indicators',
      'Government policies',
      'Geopolitical events'
    ].sort(() => Math.random() - 0.5).slice(0, 3);
    
    return {
      overall,
      foreignInvestment,
      institutional,
      retail,
      marketMood,
      keyFactors
    };
  }

  private async simulateNetworkDelay(): Promise<void> {
    // Simulate Japan's excellent network latency (50ms average)
    const delay = this.config.networkLatency + Math.random() * 20;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private getStockName(symbol: string): string {
    const stockNames: Record<string, string> = {
      '7203': 'Toyota Motor Corporation',
      '6758': 'Sony Group Corporation',
      '8058': 'Mitsubishi UFJ Financial Group',
      '9984': 'SoftBank Group Corp',
      '4502': 'Takeda Pharmaceutical Company',
      '8306': 'Mitsubishi Corporation',
      '4503': 'Honda Motor Co., Ltd.',
      '6981': 'Keyence Corporation',
      '4063': 'Shin-Etsu Chemical Co., Ltd.',
      '8411': 'Mizuho Financial Group'
    };
    return stockNames[symbol] || `${symbol} Company`;
  }

  private getStockNameJapanese(symbol: string): string {
    const stockNamesJa: Record<string, string> = {
      '7203': 'トヨタ自動車株式会社',
      '6758': 'ソニーグループ株式会社',
      '8058': '三菱UFJフィナンシャル・グループ',
      '9984': 'ソフトバンクグループ株式会社',
      '4502': '武田薬品工業株式会社',
      '8306': '三菱商事株式会社',
      '4503': '本田技研工業株式会社',
      '6981': 'キーエンス株式会社',
      '4063': '信越化学工業株式会社',
      '8411': 'みずほフィナンシャルグループ'
    };
    return stockNamesJa[symbol] || `${symbol} 株式会社`;
  }

  private getStockSector(symbol: string): string {
    const sectors: Record<string, string> = {
      '7203': 'Automotive',
      '6758': 'Technology',
      '8058': 'Financial Services',
      '9984': 'Telecommunications',
      '4502': 'Pharmaceuticals',
      '8306': 'Trading Company',
      '4503': 'Automotive',
      '6981': 'Electronic Components',
      '4063': 'Chemicals',
      '8411': 'Financial Services'
    };
    return sectors[symbol] || 'General';
  }

  isMarketHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.some(holiday => holiday.date === dateStr);
  }

  isMarketOpen(date: Date): boolean {
    if (this.isMarketHoliday(date)) return false;
    
    const day = date.getDay();
    if (day === 0 || day === 6) return false; // Weekend
    
    const time = date.getHours() * 100 + date.getMinutes();
    return time >= 900 && time <= 1500; // 09:00-15:00 Japan time
  }

  getHolidays(): JapaneseHoliday[] {
    return this.holidays;
  }

  getLocalizedLabels(): Record<string, string> {
    return {
      'symbol': '銘柄コード',
      'name': '会社名',
      'nameJa': '日本語名',
      'price': '価格',
      'change': '変動',
      'changePercent': '変動率',
      'volume': '出来高',
      'marketCap': '時価総額',
      'sector': 'セクター',
      'lastUpdated': '最終更新',
      'nikkei225': '日経225',
      'topix': 'TOPIX',
      'jpxNikkei400': 'JPX日経400',
      'marketOverview': '市場概要',
      'technicalAnalysis': 'テクニカル分析',
      'fundamentalAnalysis': 'ファンダメンタル分析',
      'marketPatterns': '市場パターン',
      'marketSentiment': '市場センチメント'
    };
  }

  getMajorCompanies(): Array<{
    symbol: string;
    name: string;
    nameJa: string;
    sector: string;
    weight: number;
  }> {
    return [
      { symbol: '7203', name: 'Toyota Motor Corporation', nameJa: 'トヨタ自動車株式会社', sector: 'Automotive', weight: 7.2 },
      { symbol: '6758', name: 'Sony Group Corporation', nameJa: 'ソニーグループ株式会社', sector: 'Technology', weight: 5.8 },
      { symbol: '8058', name: 'Mitsubishi UFJ Financial Group', nameJa: '三菱UFJフィナンシャル・グループ', sector: 'Financial Services', weight: 4.5 },
      { symbol: '9984', name: 'SoftBank Group Corp', nameJa: 'ソフトバンクグループ株式会社', sector: 'Telecommunications', weight: 3.9 },
      { symbol: '4502', name: 'Takeda Pharmaceutical Company', nameJa: '武田薬品工業株式会社', sector: 'Pharmaceuticals', weight: 3.2 },
      { symbol: '8306', name: 'Mitsubishi Corporation', nameJa: '三菱商事株式会社', sector: 'Trading Company', weight: 2.8 },
      { symbol: '4503', name: 'Honda Motor Co., Ltd.', nameJa: '本田技研工業株式会社', sector: 'Automotive', weight: 2.5 },
      { symbol: '6981', name: 'Keyence Corporation', nameJa: 'キーエンス株式会社', sector: 'Electronic Components', weight: 2.1 },
      { symbol: '4063', name: 'Shin-Etsu Chemical Co., Ltd.', nameJa: '信越化学工業株式会社', sector: 'Chemicals', weight: 1.8 },
      { symbol: '8411', name: 'Mizuho Financial Group', nameJa: 'みずほフィナンシャルグループ', sector: 'Financial Services', weight: 1.6 }
    ];
  }

  async getMarketOverview(): Promise<{
    indices: any;
    topGainers: JapaneseStockData[];
    topLosers: JapaneseStockData[];
    marketSentiment: any;
    marketPatterns: JapaneseMarketPattern[];
    tradingStatus: {
      isOpen: boolean;
      nextSession: Date;
      previousClose: Date;
    };
  }> {
    const indices = await this.fetchMarketIndices();
    const sentiment = await this.fetchMarketSentiment();
    
    const majorCompanies = this.getMajorCompanies();
    const topGainers = await Promise.all(
      majorCompanies.slice(0, 5).map(company => this.fetchStockData(company.symbol))
    );
    const topLosers = await Promise.all(
      majorCompanies.slice(5, 10).map(company => this.fetchStockData(company.symbol))
    );
    
    const patterns = await this.detectMarketPatterns('7203'); // Use Toyota as reference
    
    const now = new Date();
    const tradingStatus = {
      isOpen: this.isMarketOpen(now),
      nextSession: this.getNextTradingSession(now),
      previousClose: this.getPreviousTradingSession(now)
    };
    
    return {
      indices,
      topGainers,
      topLosers,
      marketSentiment: sentiment,
      marketPatterns: patterns,
      tradingStatus
    };
  }

  private getNextTradingSession(date: Date): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    
    while (this.isMarketHoliday(next) || next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }
    
    next.setHours(9, 0, 0, 0);
    return next;
  }

  private getPreviousTradingSession(date: Date): Date {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);
    
    while (this.isMarketHoliday(prev) || prev.getDay() === 0 || prev.getDay() === 6) {
      prev.setDate(prev.getDate() - 1);
    }
    
    prev.setHours(15, 0, 0, 0);
    return prev;
  }
}
