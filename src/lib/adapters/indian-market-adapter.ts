import { MarketConfig } from '../market-config';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface TechnicalIndicators {
  rsi: number;
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  macd: number;
  signal: number;
  histogram: number;
  upperBand: number;
  middleBand: number;
  lowerBand: number;
}

export interface FundamentalData {
  pe: number;
  pb: number;
  eps: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  currentRatio: number;
  bookValue: number;
}

export interface IndianHoliday {
  date: string;
  name: string;
  type: 'national' | 'religious' | 'market';
}

export class IndianMarketAdapter {
  private config: MarketConfig;
  private holidays: IndianHoliday[];

  constructor(config: MarketConfig) {
    this.config = config;
    this.holidays = this.initializeIndianHolidays();
  }

  private initializeIndianHolidays(): IndianHoliday[] {
    return [
      { date: '2024-01-01', name: 'New Year', type: 'national' },
      { date: '2024-01-26', name: 'Republic Day', type: 'national' },
      { date: '2024-03-08', name: 'Maha Shivaratri', type: 'religious' },
      { date: '2024-03-25', name: 'Holi', type: 'religious' },
      { date: '2024-04-11', name: 'Eid al-Fitr', type: 'religious' },
      { date: '2024-04-14', name: 'Ambedkar Jayanti', type: 'national' },
      { date: '2024-04-17', name: 'Ram Navami', type: 'religious' },
      { date: '2024-05-01', name: 'Labour Day', type: 'national' },
      { date: '2024-05-23', name: 'Buddha Purnima', type: 'religious' },
      { date: '2024-06-17', name: 'Bakrid', type: 'religious' },
      { date: '2024-08-15', name: 'Independence Day', type: 'national' },
      { date: '2024-08-19', name: 'Janmashtami', type: 'religious' },
      { date: '2024-10-02', name: 'Gandhi Jayanti', type: 'national' },
      { date: '2024-10-12', name: 'Dussehra', type: 'religious' },
      { date: '2024-10-31', name: 'Diwali', type: 'religious' },
      { date: '2024-11-01', name: 'Diwali (Laxmi Pujan)', type: 'religious' },
      { date: '2024-11-15', name: 'Guru Nanak Jayanti', type: 'religious' },
      { date: '2024-12-25', name: 'Christmas', type: 'national' }
    ];
  }

  async fetchStockData(symbol: string): Promise<StockData> {
    // Simulate API call delay for India's network conditions
    await this.simulateNetworkDelay();
    
    // Generate realistic NSE stock data
    const basePrice = Math.random() * 5000 + 100; // INR 100-5100
    const change = (Math.random() - 0.5) * basePrice * 0.018; // ±1.8% volatility
    const changePercent = (change / basePrice) * 100;
    const volume = Math.floor(Math.random() * 10000000) + 100000; // High volume for large market
    
    return {
      symbol,
      name: this.getStockName(symbol),
      price: basePrice,
      change,
      changePercent,
      volume,
      marketCap: basePrice * volume * 1000, // Approximate market cap
      lastUpdated: new Date()
    };
  }

  async fetchTechnicalIndicators(symbol: string): Promise<TechnicalIndicators> {
    await this.simulateNetworkDelay();
    
    const stockData = await this.fetchStockData(symbol);
    const price = stockData.price;
    
    // Generate realistic technical indicators
    const rsi = Math.random() * 100;
    const sma20 = price * (0.97 + Math.random() * 0.06);
    const sma50 = price * (0.94 + Math.random() * 0.12);
    const ema12 = price * (0.98 + Math.random() * 0.04);
    const ema26 = price * (0.96 + Math.random() * 0.08);
    const macd = ema12 - ema26;
    const signal = macd * (0.85 + Math.random() * 0.3);
    const histogram = macd - signal;
    const stdDev = price * 0.015;
    const upperBand = sma20 + (stdDev * 2);
    const middleBand = sma20;
    const lowerBand = sma20 - (stdDev * 2);
    
    return {
      rsi,
      sma20,
      sma50,
      ema12,
      ema26,
      macd,
      signal,
      histogram,
      upperBand,
      middleBand,
      lowerBand
    };
  }

  async fetchFundamentalData(symbol: string): Promise<FundamentalData> {
    await this.simulateNetworkDelay();
    
    // Generate realistic fundamental data for Indian companies
    const pe = Math.random() * 35 + 8; // 8-43 P/E ratio
    const pb = Math.random() * 6 + 0.8; // 0.8-6.8 P/B ratio
    const eps = Math.random() * 200 + 20; // INR 20-220 EPS
    const dividendYield = Math.random() * 6 + 1; // 1-7% dividend yield
    const roe = Math.random() * 25 + 8; // 8-33% ROE
    const debtToEquity = Math.random() * 1.5 + 0.2; // 0.2-1.7 debt-to-equity
    const currentRatio = Math.random() * 3 + 0.8; // 0.8-3.8 current ratio
    const bookValue = Math.random() * 800 + 100; // INR 100-900 book value
    
    return {
      pe,
      pb,
      eps,
      dividendYield,
      roe,
      debtToEquity,
      currentRatio,
      bookValue
    };
  }

  async fetchMarketOverview(): Promise<{
    index: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
    topGainers: StockData[];
    topLosers: StockData[];
  }> {
    await this.simulateNetworkDelay();
    
    const baseIndex = 19000 + Math.random() * 2000; // Nifty index around 19000-21000
    const change = (Math.random() - 0.5) * baseIndex * 0.018;
    const changePercent = (change / baseIndex) * 100;
    const volume = Math.floor(Math.random() * 500000000) + 100000000; // High volume
    const marketCap = this.config.marketCap;
    
    // Generate top gainers and losers
    const topGainers = await Promise.all(
      this.config.majorStocks.slice(0, 3).map(symbol => this.fetchStockData(symbol))
    );
    const topLosers = await Promise.all(
      this.config.majorStocks.slice(3, 6).map(symbol => this.fetchStockData(symbol))
    );
    
    return {
      index: baseIndex,
      change,
      changePercent,
      volume,
      marketCap,
      topGainers,
      topLosers
    };
  }

  async getMarketSentiment(): Promise<{
    overall: number;
    foreignInvestment: number;
    institutional: number;
    retail: number;
    newsSentiment: number;
    socialMedia: number;
    policyImpact: number;
  }> {
    await this.simulateNetworkDelay();
    
    // Generate realistic sentiment data for Indian market
    const overall = Math.random() * 100;
    const foreignInvestment = Math.random() * 100;
    const institutional = Math.random() * 100;
    const retail = Math.random() * 100;
    const newsSentiment = Math.random() * 100;
    const socialMedia = Math.random() * 100;
    const policyImpact = Math.random() * 100;
    
    return {
      overall,
      foreignInvestment,
      institutional,
      retail,
      newsSentiment,
      socialMedia,
      policyImpact
    };
  }

  private async simulateNetworkDelay(): Promise<void> {
    // Simulate India's network latency (80ms average)
    const delay = this.config.networkLatency + Math.random() * 50;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private getStockName(symbol: string): string {
    const stockNames: Record<string, string> = {
      'RELIANCE': 'Reliance Industries Limited',
      'TCS': 'Tata Consultancy Services Limited',
      'HDFCBANK': 'HDFC Bank Limited',
      'INFY': 'Infosys Limited',
      'ICICIBANK': 'ICICI Bank Limited',
      'HINDUNILVR': 'Hindustan Unilever Limited',
      'ITC': 'ITC Limited',
      'SBIN': 'State Bank of India',
      'BHARTIARTL': 'Bharti Airtel Limited',
      'KOTAKBANK': 'Kotak Mahindra Bank Limited'
    };
    return stockNames[symbol] || `${symbol} Limited`;
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
    return time >= 915 && time <= 1530; // 09:15-15:30 IST
  }

  getHolidays(): IndianHoliday[] {
    return this.holidays;
  }

  getLocalizedLabels(): Record<string, string> {
    return {
      'symbol': 'प्रतीक',
      'name': 'नाम',
      'price': 'कीमत',
      'change': 'बदलाव',
      'changePercent': 'बदलाव प्रतिशत',
      'volume': 'वॉल्यूम',
      'marketCap': 'मार्केट कैप',
      'lastUpdated': 'अंतिम अपडेट',
      'index': 'इंडेक्स',
      'topGainers': 'टॉप गेनर्स',
      'topLosers': 'टॉप लूजर्स',
      'marketOverview': 'मार्केट ओवरव्यू',
      'technicalAnalysis': 'तकनीकी विश्लेषण',
      'fundamentalAnalysis': 'मौलिक विश्लेषण',
      'nifty': 'निफ्टी',
      'sensex': 'सेंसेक्स',
      'marketCap': 'बाजार पूंजीकरण',
      'tradingVolume': 'ट्रेडिंग वॉल्यूम'
    };
  }

  getMarketIndices(): {
    nifty: number;
    sensex: number;
    niftyChange: number;
    sensexChange: number;
    niftyChangePercent: number;
    sensexChangePercent: number;
  } {
    const nifty = 19000 + Math.random() * 2000;
    const sensex = 63000 + Math.random() * 7000;
    const niftyChange = (Math.random() - 0.5) * nifty * 0.018;
    const sensexChange = (Math.random() - 0.5) * sensex * 0.018;
    const niftyChangePercent = (niftyChange / nifty) * 100;
    const sensexChangePercent = (sensexChange / sensex) * 100;
    
    return {
      nifty,
      sensex,
      niftyChange,
      sensexChange,
      niftyChangePercent,
      sensexChangePercent
    };
  }
}