import { MarketAdapter, MarketData, StockData, MarketIndex } from './market-adapter';
import { KoreanMarketSentiment } from '../sentiment/korean-market-sentiment';
import { KoreanPatternRecognition } from '../patterns/korean-pattern-recognition';

export class KoreanMarketAdapter implements MarketAdapter {
  private sentiment: KoreanMarketSentiment;
  private patternRecognition: KoreanPatternRecognition;

  constructor() {
    this.sentiment = new KoreanMarketSentiment();
    this.patternRecognition = new KoreanPatternRecognition();
  }

  async getMarketData(): Promise<MarketData> {
    const now = new Date();
    const isTradingHours = this.isKoreanTradingHours(now);
    const isHoliday = this.isKoreanHoliday(now);

    return {
      market: 'KRX',
      isOpen: isTradingHours && !isHoliday,
      lastUpdate: now,
      timezone: 'Asia/Seoul',
      currency: 'KRW',
      indices: await this.getIndices(),
      sentiment: await this.sentiment.getOverallSentiment(),
      volume: this.generateRandomVolume(),
      volatility: this.generateVolatility()
    };
  }

  async getStockData(symbol: string): Promise<StockData> {
    const koreanStocks = this.getKoreanStocks();
    const stock = koreanStocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      throw new Error(`Stock ${symbol} not found in Korean market`);
    }

    const basePrice = stock.price;
    const change = (Math.random() - 0.5) * 0.12; // ±6% change
    const currentPrice = basePrice * (1 + change);

    return {
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      price: currentPrice,
      change: change * 100,
      volume: this.generateRandomVolume(),
      marketCap: stock.marketCap,
      sector: stock.sector,
      chaebol: stock.chaebol,
      lastUpdate: new Date(),
      patterns: await this.patternRecognition.analyzeStock(symbol),
      sentiment: await this.sentiment.getStockSentiment(symbol)
    };
  }

  async getIndices(): Promise<MarketIndex[]> {
    return [
      {
        symbol: '^KS11',
        name: 'KOSPI',
        nameKo: '코스피',
        value: 2500 + Math.random() * 300,
        change: (Math.random() - 0.5) * 2.5,
        volume: this.generateRandomVolume() * 20,
        description: 'Korea Composite Stock Price Index'
      },
      {
        symbol: '^KQ11',
        name: 'KOSDAQ',
        nameKo: '코스닥',
        value: 800 + Math.random() * 150,
        change: (Math.random() - 0.5) * 3.5,
        volume: this.generateRandomVolume() * 12,
        description: 'Korean Securities Dealers Automated Quotations'
      },
      {
        symbol: '^KS200',
        name: 'KOSPI 200',
        nameKo: '코스피 200',
        value: 320 + Math.random() * 40,
        change: (Math.random() - 0.5) * 2,
        volume: this.generateRandomVolume() * 15,
        description: 'Korea Stock Price Index 200'
      },
      {
        symbol: '^KRX100',
        name: 'KRX 100',
        nameKo: '코스피 100',
        value: 1500 + Math.random() * 200,
        change: (Math.random() - 0.5) * 2.2,
        volume: this.generateRandomVolume() * 18,
        description: 'Korea Exchange 100 Index'
      }
    ];
  }

  async getTopGainers(): Promise<StockData[]> {
    const stocks = this.getKoreanStocks();
    const gainers = stocks
      .map(stock => ({
        ...stock,
        change: Math.random() * 10, // 0-10% gain
        price: stock.price * (1 + Math.random() * 0.1)
      }))
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    return Promise.all(gainers.map(async stock => ({
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      price: stock.price,
      change: stock.change,
      volume: this.generateRandomVolume(),
      marketCap: stock.marketCap,
      sector: stock.sector,
      chaebol: stock.chaebol,
      lastUpdate: new Date(),
      patterns: await this.patternRecognition.analyzeStock(stock.symbol),
      sentiment: await this.sentiment.getStockSentiment(stock.symbol)
    })));
  }

  async getTopLosers(): Promise<StockData[]> {
    const stocks = this.getKoreanStocks();
    const losers = stocks
      .map(stock => ({
        ...stock,
        change: -Math.random() * 10, // -10% to 0% change
        price: stock.price * (1 - Math.random() * 0.1)
      }))
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    return Promise.all(losers.map(async stock => ({
      symbol: stock.symbol,
      name: stock.name,
      nameKo: stock.nameKo,
      price: stock.price,
      change: stock.change,
      volume: this.generateRandomVolume(),
      marketCap: stock.marketCap,
      sector: stock.sector,
      chaebol: stock.chaebol,
      lastUpdate: new Date(),
      patterns: await this.patternRecognition.analyzeStock(stock.symbol),
      sentiment: await this.sentiment.getStockSentiment(stock.symbol)
    })));
  }

  async getMarketSentiment(): Promise<any> {
    return this.sentiment.getOverallSentiment();
  }

  async getChaebolAnalysis(): Promise<any> {
    return this.sentiment.getChaebolSentiment();
  }

  private isKoreanTradingHours(date: Date): boolean {
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Monday to Friday
    if (day === 0 || day === 6) return false;
    
    // Trading hours: 9:00-15:30 (Korea Standard Time)
    // Lunch break: 12:00-13:00
    const morningSession = hours >= 9 && (hours < 12 || (hours === 12 && minutes === 0));
    const afternoonSession = hours >= 13 && hours < 15 || (hours === 15 && minutes <= 30);
    
    return morningSession || afternoonSession;
  }

  private isKoreanHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Lunar New Year (varies, approximate)
    if ((month === 2 && day >= 8) || (month === 2 && day <= 15)) return true;
    
    // Independence Movement Day
    if (month === 3 && day === 1) return true;
    
    // Buddha's Birthday
    if (month === 5 && day >= 10 && day <= 15) return true;
    
    // Memorial Day
    if (month === 6 && day === 6) return true;
    
    // Liberation Day
    if (month === 8 && day === 15) return true;
    
    // Chuseok (Korean Thanksgiving, varies)
    if ((month === 9 && day >= 25) || (month === 10 && day <= 5)) return true;
    
    // National Foundation Day
    if (month === 10 && day === 3) return true;
    
    // Hangeul Day
    if (month === 10 && day === 9) return true;
    
    // Christmas
    if (month === 12 && day === 25) return true;
    
    return false;
  }

  private generateRandomVolume(): number {
    return Math.floor(Math.random() * 80000000) + 10000000;
  }

  private generateVolatility(): number {
    return Math.random() * 0.35 + 0.15; // 15% to 50% volatility
  }

  private getKoreanStocks() {
    return [
      {
        symbol: '005930.KS',
        name: 'Samsung Electronics',
        nameKo: '삼성전자',
        price: 70000,
        marketCap: 420e12,
        sector: 'Technology',
        chaebol: 'Samsung'
      },
      {
        symbol: '000660.KS',
        name: 'SK Hynix',
        nameKo: 'SK하이닉스',
        price: 160000,
        marketCap: 120e12,
        sector: 'Technology',
        chaebol: 'SK'
      },
      {
        symbol: '005490.KS',
        name: 'POSCO Holdings',
        nameKo: '포스코홀딩스',
        price: 320000,
        marketCap: 58e12,
        sector: 'Materials',
        chaebol: 'POSCO'
      },
      {
        symbol: '207940.KS',
        name: 'Samsung SDI',
        nameKo: '삼성SDI',
        price: 450000,
        marketCap: 80e12,
        sector: 'Technology',
        chaebol: 'Samsung'
      },
      {
        symbol: '005380.KS',
        name: 'Hyundai Motor',
        nameKo: '현대자동차',
        price: 200000,
        marketCap: 110e12,
        sector: 'Automotive',
        chaebol: 'Hyundai'
      },
      {
        symbol: '068270.KS',
        name: 'Celltrion',
        nameKo: '셀트리온',
        price: 180000,
        marketCap: 32e12,
        sector: 'Healthcare',
        chaebol: 'Independent'
      },
      {
        symbol: '373220.KS',
        name: 'LG Energy Solution',
        nameKo: 'LG에너지솔루션',
        price: 380000,
        marketCap: 68e12,
        sector: 'Technology',
        chaebol: 'LG'
      },
      {
        symbol: '000270.KS',
        name: 'Kia Corp',
        nameKo: '기아',
        price: 85000,
        marketCap: 42e12,
        sector: 'Automotive',
        chaebol: 'Hyundai'
      },
      {
        symbol: '035420.KS',
        name: 'NAVER',
        nameKo: '네이버',
        price: 250000,
        marketCap: 55e12,
        sector: 'Technology',
        chaebol: 'Independent'
      },
      {
        symbol: '005935.KS',
        name: 'Samsung Life Insurance',
        nameKo: '삼성생명',
        price: 80000,
        marketCap: 28e12,
        sector: 'Financial',
        chaebol: 'Samsung'
      }
    ];
  }
}
