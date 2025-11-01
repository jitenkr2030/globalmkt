import { MarketAdapter, MarketData, StockData, MarketIndex } from './market-adapter';
import { HongKongMarketSentiment } from '../sentiment/hongkong-market-sentiment';
import { HongKongPatternRecognition } from '../patterns/hongkong-pattern-recognition';

export class HongKongMarketAdapter implements MarketAdapter {
  private sentiment: HongKongMarketSentiment;
  private patternRecognition: HongKongPatternRecognition;

  constructor() {
    this.sentiment = new HongKongMarketSentiment();
    this.patternRecognition = new HongKongPatternRecognition();
  }

  async getMarketData(): Promise<MarketData> {
    const now = new Date();
    const isTradingHours = this.isHongKongTradingHours(now);
    const isHoliday = this.isHongKongHoliday(now);

    return {
      market: 'HKEX',
      isOpen: isTradingHours && !isHoliday,
      lastUpdate: now,
      timezone: 'Asia/Hong_Kong',
      currency: 'HKD',
      indices: await this.getIndices(),
      sentiment: await this.sentiment.getOverallSentiment(),
      volume: this.generateRandomVolume(),
      volatility: this.generateVolatility()
    };
  }

  async getStockData(symbol: string): Promise<StockData> {
    const hongKongStocks = this.getHongKongStocks();
    const stock = hongKongStocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      throw new Error(`Stock ${symbol} not found in Hong Kong market`);
    }

    const basePrice = stock.price;
    const change = (Math.random() - 0.5) * 0.08; // ±4% change
    const currentPrice = basePrice * (1 + change);

    return {
      symbol: stock.symbol,
      name: stock.name,
      nameZh: stock.nameZh,
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
        symbol: '^HSI',
        name: 'Hang Seng Index',
        nameZh: '恒生指數',
        value: 17000 + Math.random() * 2000,
        change: (Math.random() - 0.5) * 3,
        volume: this.generateRandomVolume() * 15,
        description: 'Hong Kong\'s main stock market index'
      },
      {
        symbol: '^HSCE',
        name: 'Hang Seng China Enterprises Index',
        nameZh: '恒生中國企業指數',
        value: 6000 + Math.random() * 800,
        change: (Math.random() - 0.5) * 3.5,
        volume: this.generateRandomVolume() * 10,
        description: 'Index of H-shares and red-chip companies'
      },
      {
        symbol: '^HSTECH',
        name: 'Hang Seng TECH Index',
        nameZh: '恒生科技指數',
        value: 3500 + Math.random() * 600,
        change: (Math.random() - 0.5) * 4,
        volume: this.generateRandomVolume() * 8,
        description: 'Index of Hong Kong-listed technology companies'
      }
    ];
  }

  async getTopGainers(): Promise<StockData[]> {
    const stocks = this.getHongKongStocks();
    const gainers = stocks
      .map(stock => ({
        ...stock,
        change: Math.random() * 8, // 0-8% gain
        price: stock.price * (1 + Math.random() * 0.08)
      }))
      .sort((a, b) => b.change - a.change)
      .slice(0, 10);

    return Promise.all(gainers.map(async stock => ({
      symbol: stock.symbol,
      name: stock.name,
      nameZh: stock.nameZh,
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
    const stocks = this.getHongKongStocks();
    const losers = stocks
      .map(stock => ({
        ...stock,
        change: -Math.random() * 8, // -8% to 0% change
        price: stock.price * (1 - Math.random() * 0.08)
      }))
      .sort((a, b) => a.change - b.change)
      .slice(0, 10);

    return Promise.all(losers.map(async stock => ({
      symbol: stock.symbol,
      name: stock.name,
      nameZh: stock.nameZh,
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

  private isHongKongTradingHours(date: Date): boolean {
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Monday to Friday
    if (day === 0 || day === 6) return false;
    
    // Trading hours: 9:30-12:00, 13:00-16:00 (Hong Kong Time)
    const morningSession = (hours === 9 && minutes >= 30) || (hours === 10 || hours === 11);
    const afternoonSession = hours >= 13 && hours < 16;
    
    return morningSession || afternoonSession;
  }

  private isHongKongHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Lunar New Year (varies, approximate)
    if ((month === 1 && day >= 25) || (month === 2 && day <= 10)) return true;
    
    // Good Friday to Easter Monday
    if (month === 4 && day >= 2 && day <= 5) return true;
    
    // Buddha's Birthday
    if (month === 5 && day >= 10 && day <= 15) return true;
    
    // Dragon Boat Festival
    if (month === 6 && day >= 15 && day <= 25) return true;
    
    // HK Establishment Day
    if (month === 7 && day === 1) return true;
    
    // Mid-Autumn Festival
    if (month === 9 && day >= 15 && day <= 25) return true;
    
    // National Day
    if (month === 10 && day === 1) return true;
    
    // Christmas and Boxing Day
    if (month === 12 && (day === 25 || day === 26)) return true;
    
    return false;
  }

  private generateRandomVolume(): number {
    return Math.floor(Math.random() * 50000000) + 5000000;
  }

  private generateVolatility(): number {
    return Math.random() * 0.25 + 0.15; // 15% to 40% volatility
  }

  private getHongKongStocks() {
    return [
      {
        symbol: '0700.HK',
        name: 'Tencent Holdings',
        nameZh: '騰訊控股',
        price: 320,
        marketCap: 3.1e12,
        sector: 'Technology'
      },
      {
        symbol: '0941.HK',
        name: 'China Mobile',
        nameZh: '中國移動',
        price: 55,
        marketCap: 1.1e12,
        sector: 'Telecommunications'
      },
      {
        symbol: '1299.HK',
        name: 'AIA Group',
        nameZh: '友邦保險',
        price: 85,
        marketCap: 950e9,
        sector: 'Financial'
      },
      {
        symbol: '0883.HK',
        name: 'CNOOC',
        nameZh: '中國海洋石油',
        price: 95,
        marketCap: 420e9,
        sector: 'Energy'
      },
      {
        symbol: '1398.HK',
        name: 'ICBC',
        nameZh: '工商銀行',
        price: 4.2,
        marketCap: 1.4e12,
        sector: 'Financial'
      },
      {
        symbol: '0939.HK',
        name: 'China Construction Bank',
        nameZh: '建設銀行',
        price: 5.8,
        marketCap: 1.5e12,
        sector: 'Financial'
      },
      {
        symbol: '2318.HK',
        name: 'Ping An Insurance',
        nameZh: '中國平安',
        price: 45,
        marketCap: 820e9,
        sector: 'Financial'
      },
      {
        symbol: '0005.HK',
        name: 'HSBC Holdings',
        nameZh: '滙豐控股',
        price: 65,
        marketCap: 1.3e12,
        sector: 'Financial'
      },
      {
        symbol: '0002.HK',
        name: 'CLP Holdings',
        nameZh: '中電控股',
        price: 75,
        marketCap: 180e9,
        sector: 'Utilities'
      },
      {
        symbol: '0011.HK',
        name: 'Hang Seng Bank',
        nameZh: '恒生銀行',
        price: 120,
        marketCap: 230e9,
        sector: 'Financial'
      }
    ];
  }
}
