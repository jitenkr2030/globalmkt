import { MarketAdapter, MarketData, StockData, MarketIndex } from './market-adapter';
import { SingaporeMarketSentiment } from '../sentiment/singapore-market-sentiment';
import { SingaporePatternRecognition } from '../patterns/singapore-pattern-recognition';

export class SingaporeMarketAdapter implements MarketAdapter {
  private sentiment: SingaporeMarketSentiment;
  private patternRecognition: SingaporePatternRecognition;

  constructor() {
    this.sentiment = new SingaporeMarketSentiment();
    this.patternRecognition = new SingaporePatternRecognition();
  }

  async getMarketData(): Promise<MarketData> {
    const now = new Date();
    const isTradingHours = this.isSingaporeTradingHours(now);
    const isHoliday = this.isSingaporeHoliday(now);

    return {
      market: 'SGX',
      isOpen: isTradingHours && !isHoliday,
      lastUpdate: now,
      timezone: 'Asia/Singapore',
      currency: 'SGD',
      indices: await this.getIndices(),
      sentiment: await this.sentiment.getOverallSentiment(),
      volume: this.generateRandomVolume(),
      volatility: this.generateVolatility()
    };
  }

  async getStockData(symbol: string): Promise<StockData> {
    const singaporeStocks = this.getSingaporeStocks();
    const stock = singaporeStocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      throw new Error(`Stock ${symbol} not found in Singapore market`);
    }

    const basePrice = stock.price;
    const change = (Math.random() - 0.5) * 0.06; // ±3% change
    const currentPrice = basePrice * (1 + change);

    return {
      symbol: stock.symbol,
      name: stock.name,
      price: currentPrice,
      change: change * 100,
      volume: this.generateRandomVolume(),
      marketCap: stock.marketCap,
      sector: stock.sector,
      lastUpdate: new Date(),
      patterns: await this.patternRecognition.analyzeStock(symbol),
      sentiment: await this.sentiment.getStockSentiment(symbol)
    };
  }

  async getIndices(): Promise<MarketIndex[]> {
    return [
      {
        symbol: '^STI',
        name: 'Straits Times Index',
        value: 3200 + Math.random() * 200,
        change: (Math.random() - 0.5) * 1.5,
        volume: this.generateRandomVolume() * 8,
        description: 'Singapore\'s benchmark stock market index'
      },
      {
        symbol: 'MXSG',
        name: 'MSCI Singapore Index',
        value: 800 + Math.random() * 80,
        change: (Math.random() - 0.5) * 1.8,
        volume: this.generateRandomVolume() * 6,
        description: 'MSCI index for Singaporean equities'
      },
      {
        symbol: 'FTST',
        name: 'FTSE Straits Times Index',
        value: 15000 + Math.random() * 1000,
        change: (Math.random() - 0.5) * 1.6,
        volume: this.generateRandomVolume() * 7,
        description: 'FTSE version of the Straits Times Index'
      }
    ];
  }

  async getTopGainers(): Promise<StockData[]> {
    const stocks = this.getSingaporeStocks();
    const gainers = stocks
      .map(stock => ({
        ...stock,
        change: Math.random() * 6, // 0-6% gain
        price: stock.price * (1 + Math.random() * 0.06)
      }))
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    return Promise.all(gainers.map(async stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      volume: this.generateRandomVolume(),
      marketCap: stock.marketCap,
      sector: stock.sector,
      lastUpdate: new Date(),
      patterns: await this.patternRecognition.analyzeStock(stock.symbol),
      sentiment: await this.sentiment.getStockSentiment(stock.symbol)
    })));
  }

  async getTopLosers(): Promise<StockData[]> {
    const stocks = this.getSingaporeStocks();
    const losers = stocks
      .map(stock => ({
        ...stock,
        change: -Math.random() * 6, // -6% to 0% change
        price: stock.price * (1 - Math.random() * 0.06)
      }))
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    return Promise.all(losers.map(async stock => ({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      volume: this.generateRandomVolume(),
      marketCap: stock.marketCap,
      sector: stock.sector,
      lastUpdate: new Date(),
      patterns: await this.patternRecognition.analyzeStock(stock.symbol),
      sentiment: await this.sentiment.getStockSentiment(stock.symbol)
    })));
  }

  async getMarketSentiment(): Promise<any> {
    return this.sentiment.getOverallSentiment();
  }

  async getGatewayAnalysis(): Promise<any> {
    return this.sentiment.getSoutheastAsianGatewaySentiment();
  }

  private isSingaporeTradingHours(date: Date): boolean {
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Monday to Friday
    if (day === 0 || day === 6) return false;
    
    // Trading hours: 9:00-17:00 (Singapore Time)
    // Lunch break: 12:00-13:00
    const morningSession = hours >= 9 && (hours < 12 || (hours === 12 && minutes === 0));
    const afternoonSession = hours >= 13 && hours < 17;
    
    return morningSession || afternoonSession;
  }

  private isSingaporeHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // New Year's Day
    if (month === 1 && day === 1) return true;
    
    // Chinese New Year (varies, approximate)
    if ((month === 2 && day >= 8) || (month === 2 && day <= 15)) return true;
    
    // Good Friday
    if (month === 4 && day >= 2 && day <= 8) return true;
    
    // Labour Day
    if (month === 5 && day === 1) return true;
    
    // Vesak Day
    if (month === 5 && day >= 20 && day <= 25) return true;
    
    // Hari Raya Puasa
    if (month === 4 && day >= 8 && day <= 15) return true;
    
    // Hari Raya Haji
    if (month === 6 && day >= 15 && day <= 22) return true;
    
    // National Day
    if (month === 8 && day === 9) return true;
    
    // Deepavali
    if (month === 11 && day >= 10 && day <= 15) return true;
    
    // Christmas Day
    if (month === 12 && day === 25) return true;
    
    return false;
  }

  private generateRandomVolume(): number {
    return Math.floor(Math.random() * 30000000) + 3000000;
  }

  private generateVolatility(): number {
    return Math.random() * 0.2 + 0.1; // 10% to 30% volatility
  }

  private getSingaporeStocks() {
    return [
      {
        symbol: 'D05.SI',
        name: 'DBS Group Holdings',
        price: 32,
        marketCap: 82e9,
        sector: 'Financial'
      },
      {
        symbol: 'Z74.SI',
        name: 'Singapore Telecommunications',
        price: 2.5,
        marketCap: 42e9,
        sector: 'Telecommunications'
      },
      {
        symbol: 'O39.SI',
        name: 'Oversea-Chinese Banking Corporation',
        price: 12,
        marketCap: 48e9,
        sector: 'Financial'
      },
      {
        symbol: 'U11.SI',
        name: 'United Overseas Bank',
        price: 28,
        marketCap: 45e9,
        sector: 'Financial'
      },
      {
        symbol: 'G13.SI',
        name: 'Keppel Corporation',
        price: 6.5,
        marketCap: 12e9,
        sector: 'Conglomerate'
      },
      {
        symbol: 'F34.SI',
        name: 'Wilmar International',
        price: 4.2,
        marketCap: 26e9,
        sector: 'Agriculture'
      },
      {
        symbol: 'BN4.SI',
        name: 'Keppel DC REIT',
        price: 2.8,
        marketCap: 3.5e9,
        sector: 'REIT'
      },
      {
        symbol: 'C6L.SI',
        name: 'Singapore Airlines',
        price: 5.8,
        marketCap: 14e9,
        sector: 'Transportation'
      },
      {
        symbol: 'S68.SI',
        name: 'Singapore Exchange',
        price: 10.5,
        marketCap: 9.5e9,
        sector: 'Financial'
      },
      {
        symbol: 'A17U.SI',
        name: 'Mapletree Logistics Trust',
        price: 1.8,
        marketCap: 4.2e9,
        sector: 'REIT'
      }
    ];
  }
}
