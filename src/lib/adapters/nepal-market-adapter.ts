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

export interface NepalHoliday {
  date: string;
  name: string;
  nepaliName: string;
  type: 'national' | 'religious' | 'market';
}

export class NepalMarketAdapter {
  private config: MarketConfig;
  private holidays: NepalHoliday[];

  constructor(config: MarketConfig) {
    this.config = config;
    this.holidays = this.initializeNepalHolidays();
  }

  private initializeNepalHolidays(): NepalHoliday[] {
    return [
      { date: '2024-01-01', name: 'New Year', nepaliName: 'नयाँ वर्ष', type: 'national' },
      { date: '2024-01-15', name: 'Maghe Sankranti', nepaliName: 'माघे संक्रान्ति', type: 'religious' },
      { date: '2024-02-12', name: 'Democracy Day', nepaliName: 'प्रजातन्त्र दिवस', type: 'national' },
      { date: '2024-03-08', name: 'Maha Shivaratri', nepaliName: 'महाशिवरात्रि', type: 'religious' },
      { date: '2024-03-25', name: 'Holi', nepaliName: 'होली', type: 'religious' },
      { date: '2024-04-13', name: 'Nepali New Year', nepaliName: 'नेपाली नयाँ वर्ष', type: 'national' },
      { date: '2024-05-23', name: 'Buddha Jayanti', nepaliName: 'बुद्ध जयन्ती', type: 'religious' },
      { date: '2024-07-17', name: 'Eid al-Fitr', nepaliName: 'ईद अल-फितर', type: 'religious' },
      { date: '2024-08-19', name: 'Janai Purnima', nepaliName: 'जनै पूर्णिमा', type: 'religious' },
      { date: '2024-08-26', name: 'Gai Jatra', nepaliName: 'गाई जात्रा', type: 'religious' },
      { date: '2024-09-16', name: 'Indra Jatra', nepaliName: 'इन्द्र जात्रा', type: 'religious' },
      { date: '2024-10-03', name: 'Dashain', nepaliName: 'दशैं', type: 'religious' },
      { date: '2024-10-12', name: 'Tihar', nepaliName: 'तिहार', type: 'religious' },
      { date: '2024-11-01', name: 'Chhath', nepaliName: 'छठ', type: 'religious' },
      { date: '2024-11-28', name: 'Constitution Day', nepaliName: 'संविधान दिवस', type: 'national' }
    ];
  }

  async fetchStockData(symbol: string): Promise<StockData> {
    // Simulate API call delay for Nepal's network conditions
    await this.simulateNetworkDelay();
    
    // Generate realistic NEPSE stock data
    const basePrice = Math.random() * 10000 + 100; // NPR 100-10,100
    const change = (Math.random() - 0.5) * basePrice * 0.035; // ±3.5% volatility
    const changePercent = (change / basePrice) * 100;
    const volume = Math.floor(Math.random() * 100000) + 1000; // Lower volume for emerging market
    
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
    const sma20 = price * (0.95 + Math.random() * 0.1);
    const sma50 = price * (0.9 + Math.random() * 0.2);
    const ema12 = price * (0.97 + Math.random() * 0.06);
    const ema26 = price * (0.94 + Math.random() * 0.12);
    const macd = ema12 - ema26;
    const signal = macd * (0.8 + Math.random() * 0.4);
    const histogram = macd - signal;
    const stdDev = price * 0.02;
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
    
    // Generate realistic fundamental data for Nepali companies
    const pe = Math.random() * 25 + 5; // 5-30 P/E ratio
    const pb = Math.random() * 3 + 0.5; // 0.5-3.5 P/B ratio
    const eps = Math.random() * 100 + 10; // NPR 10-110 EPS
    const dividendYield = Math.random() * 8 + 2; // 2-10% dividend yield
    const roe = Math.random() * 20 + 5; // 5-25% ROE
    const debtToEquity = Math.random() * 2 + 0.1; // 0.1-2.1 debt-to-equity
    const currentRatio = Math.random() * 2 + 0.5; // 0.5-2.5 current ratio
    const bookValue = Math.random() * 500 + 50; // NPR 50-550 book value
    
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
    
    const baseIndex = 2000 + Math.random() * 500; // NEPSE index around 2000-2500
    const change = (Math.random() - 0.5) * baseIndex * 0.035;
    const changePercent = (change / baseIndex) * 100;
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
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

  private async simulateNetworkDelay(): Promise<void> {
    // Simulate Nepal's network latency (1500ms average)
    const delay = this.config.networkLatency + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private getStockName(symbol: string): string {
    const stockNames: Record<string, string> = {
      'NABIL': 'Nabil Bank Limited',
      'NICA': 'Nepal Investment Bank Limited',
      'EBL': 'Everest Bank Limited',
      'NMB': 'NMB Bank Limited',
      'Prabhu': 'Prabhu Bank Limited'
    };
    return stockNames[symbol] || `${symbol} Company`;
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
    return time >= 1100 && time <= 1500; // 11:00-15:00 Nepal time
  }

  getHolidays(): NepalHoliday[] {
    return this.holidays;
  }

  getLocalizedLabels(): Record<string, string> {
    return {
      'symbol': 'प्रतीक',
      'name': 'नाम',
      'price': 'मूल्य',
      'change': 'परिवर्तन',
      'changePercent': 'परिवर्तन प्रतिशत',
      'volume': 'खुल्ला मूल्य',
      'marketCap': 'बजार पूँजीकरण',
      'lastUpdated': 'अन्तिम अपडेट',
      'index': 'सूचकांक',
      'topGainers': 'शीर्ष लाभार्थी',
      'topLosers': 'शीर्ष हानिकर्ता',
      'marketOverview': 'बजार अवलोकन',
      'technicalAnalysis': 'प्राविधिक विश्लेषण',
      'fundamentalAnalysis': 'मौलिक विश्लेषण'
    };
  }
}
