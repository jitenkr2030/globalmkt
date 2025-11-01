import { MarketAdapter, MarketData, StockData, MarketIndex } from './market-adapter';
import { ChineseMarketSentiment } from '../sentiment/chinese-market-sentiment';
import { ChinesePatternRecognition } from '../patterns/chinese-pattern-recognition';

export class ChineseMarketAdapter implements MarketAdapter {
  private sentiment: ChineseMarketSentiment;
  private patternRecognition: ChinesePatternRecognition;

  constructor() {
    this.sentiment = new ChineseMarketSentiment();
    this.patternRecognition = new ChinesePatternRecognition();
  }

  async getMarketData(): Promise<MarketData> {
    const now = new Date();
    const isTradingHours = this.isChineseTradingHours(now);
    const isHoliday = this.isChineseHoliday(now);

    return {
      market: 'SSE/Shenzhen',
      isOpen: isTradingHours && !isHoliday,
      lastUpdate: now,
      timezone: 'Asia/Shanghai',
      currency: 'CNY',
      indices: await this.getIndices(),
      sentiment: await this.sentiment.getOverallSentiment(),
      volume: this.generateRandomVolume(),
      volatility: this.generateVolatility()
    };
  }

  async getStockData(symbol: string): Promise<StockData> {
    const chineseStocks = this.getChineseStocks();
    const stock = chineseStocks.find(s => s.symbol === symbol);
    
    if (!stock) {
      throw new Error(`Stock ${symbol} not found in Chinese market`);
    }

    const basePrice = stock.price;
    const change = (Math.random() - 0.5) * 0.1; // ±5% change
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
        symbol: '000001.SS',
        name: 'SSE Composite Index',
        nameZh: '上证综合指数',
        value: 3100 + Math.random() * 200,
        change: (Math.random() - 0.5) * 2,
        volume: this.generateRandomVolume() * 10,
        description: 'Shanghai Stock Exchange Composite Index'
      },
      {
        symbol: '399001.SZ',
        name: 'Shenzhen Component Index',
        nameZh: '深圳成份指数',
        value: 9800 + Math.random() * 500,
        change: (Math.random() - 0.5) * 2.5,
        volume: this.generateRandomVolume() * 8,
        description: 'Shenzhen Stock Exchange Component Index'
      },
      {
        symbol: '000300.SS',
        name: 'CSI 300 Index',
        nameZh: '沪深300指数',
        value: 3800 + Math.random() * 300,
        change: (Math.random() - 0.5) * 1.8,
        volume: this.generateRandomVolume() * 12,
        description: 'China Securities Index 300'
      },
      {
        symbol: '399006.SZ',
        name: 'ChiNext Index',
        nameZh: '创业板指数',
        value: 2200 + Math.random() * 200,
        change: (Math.random() - 0.5) * 3,
        volume: this.generateRandomVolume() * 6,
        description: 'ChiNext Board Growth Enterprise Market Index'
      }
    ];
  }

  async getTopGainers(): Promise<StockData[]> {
    const stocks = this.getChineseStocks();
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
    const stocks = this.getChineseStocks();
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

  private isChineseTradingHours(date: Date): boolean {
    const day = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Monday to Friday
    if (day === 0 || day === 6) return false;
    
    // Trading hours: 9:30-11:30, 13:00-15:00 (China Standard Time)
    const morningSession = (hours === 9 && minutes >= 30) || hours === 10 || (hours === 11 && minutes <= 30);
    const afternoonSession = hours >= 13 && hours < 15;
    
    return morningSession || afternoonSession;
  }

  private isChineseHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // Chinese New Year (varies, approximate)
    if ((month === 1 && day >= 20) || (month === 2 && day <= 15)) return true;
    
    // Labor Day
    if (month === 5 && day >= 1 && day <= 5) return true;
    
    // National Day
    if (month === 10 && day >= 1 && day <= 7) return true;
    
    // Mid-Autumn Festival (varies)
    if (month === 9 && day >= 15 && day <= 25) return true;
    
    return false;
  }

  private generateRandomVolume(): number {
    return Math.floor(Math.random() * 100000000) + 10000000;
  }

  private generateVolatility(): number {
    return Math.random() * 0.3 + 0.1; // 10% to 40% volatility
  }

  private getChineseStocks() {
    return [
      {
        symbol: '600519.SS',
        name: 'Kweichow Moutai',
        nameZh: '贵州茅台',
        price: 1800,
        marketCap: 2.2e12,
        sector: 'Consumer Goods'
      },
      {
        symbol: '000858.SZ',
        name: 'Wuliangye Yibin',
        nameZh: '五粮液',
        price: 160,
        marketCap: 620e9,
        sector: 'Consumer Goods'
      },
      {
        symbol: '600036.SS',
        name: 'China Merchants Bank',
        nameZh: '招商银行',
        price: 35,
        marketCap: 900e9,
        sector: 'Financial'
      },
      {
        symbol: '601318.SS',
        name: 'Ping An Insurance',
        nameZh: '中国平安',
        price: 45,
        marketCap: 820e9,
        sector: 'Financial'
      },
      {
        symbol: '000002.SZ',
        name: 'China Vanke',
        nameZh: '万科A',
        price: 18,
        marketCap: 200e9,
        sector: 'Real Estate'
      },
      {
        symbol: '600000.SS',
        name: 'Pudong Development Bank',
        nameZh: '浦发银行',
        price: 8.5,
        marketCap: 250e9,
        sector: 'Financial'
      },
      {
        symbol: '000001.SS',
        name: 'Ping An Bank',
        nameZh: '平安银行',
        price: 12,
        marketCap: 230e9,
        sector: 'Financial'
      },
      {
        symbol: '600276.SS',
        name: 'Hengrui Medicine',
        nameZh: '恒瑞医药',
        price: 45,
        marketCap: 290e9,
        sector: 'Healthcare'
      },
      {
        symbol: '300750.SZ',
        name: 'CATL',
        nameZh: '宁德时代',
        price: 180,
        marketCap: 790e9,
        sector: 'Technology'
      },
      {
        symbol: '002415.SZ',
        name: 'Hikvision',
        nameZh: '海康威视',
        price: 28,
        marketCap: 260e9,
        sector: 'Technology'
      }
    ];
  }
}
