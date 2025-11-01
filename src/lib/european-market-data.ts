export interface EuropeanMarketDataSource {
  id: string;
  name: string;
  baseUrl: string;
  endpoints: {
    prices: string;
    indices: string;
    stats: string;
  };
  symbols: string[];
  currency: string;
  timezone: string;
  apiKey?: string;
  rateLimit: number;
  reliability: number;
}

export const EUROPEAN_MARKET_DATA_SOURCES: EuropeanMarketDataSource[] = [
  {
    id: 'london',
    name: 'London Stock Exchange (LSE)',
    baseUrl: 'https://api.londonstockexchange.com',
    endpoints: {
      prices: '/api/v1/prices',
      indices: '/api/v1/indices',
      stats: '/api/v1/statistics'
    },
    symbols: ['HSBA.L', 'SHEL.L', 'RIO.L', 'GSK.L', 'BP.L'],
    currency: 'GBP',
    timezone: 'Europe/London',
    rateLimit: 50,
    reliability: 0.98
  },
  {
    id: 'euronext',
    name: 'Euronext',
    baseUrl: 'https://api.euronext.com',
    endpoints: {
      prices: '/api/v1/prices',
      indices: '/api/v1/indices',
      stats: '/api/v1/statistics'
    },
    symbols: ['AIR.PA', 'SAN.PA', 'MC.PA', 'OR.PA', 'BNP.PA'],
    currency: 'EUR',
    timezone: 'Europe/Paris',
    rateLimit: 45,
    reliability: 0.97
  },
  {
    id: 'xetra',
    name: 'Deutsche Börse (Xetra)',
    baseUrl: 'https://api.deutsche-boerse.com',
    endpoints: {
      prices: '/api/v1/xetra/prices',
      indices: '/api/v1/dax',
      stats: '/api/v1/statistics'
    },
    symbols: ['DAI.DE', 'SAP.DE', 'VOW3.DE', 'BMW.DE', 'BAS.DE'],
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    rateLimit: 55,
    reliability: 0.99
  },
  {
    id: 'six',
    name: 'SIX Swiss Exchange',
    baseUrl: 'https://api.six-group.com',
    endpoints: {
      prices: '/api/v1/prices',
      indices: '/api/v1/indices',
      stats: '/api/v1/statistics'
    },
    symbols: ['NESN.SW', 'ROG.SW', 'UBSG.SW', 'NOVN.SW', 'ZURN.SW'],
    currency: 'CHF',
    timezone: 'Europe/Zurich',
    rateLimit: 58,
    reliability: 0.99
  },
  {
    id: 'bme',
    name: 'BME Spanish Exchanges',
    baseUrl: 'https://api.bolsasymercados.es',
    endpoints: {
      prices: '/api/v1/prices',
      indices: '/api/v1/indices',
      stats: '/api/v1/statistics'
    },
    symbols: ['SAN.MC', 'IBE.MC', 'REP.MC', 'ITX.MC', 'AMS.MC'],
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    rateLimit: 42,
    reliability: 0.96
  },
  {
    id: 'nasdaq-nordic',
    name: 'Nasdaq Nordic',
    baseUrl: 'https://api.nasdaqomxnordic.com',
    endpoints: {
      prices: '/api/v1/prices',
      indices: '/api/v1/indices',
      stats: '/api/v1/statistics'
    },
    symbols: ['ERIC-B.ST', 'VOLV-B.ST', 'HM-B.ST', 'SEB-A.ST', 'SHB-A.ST'],
    currency: 'SEK',
    timezone: 'Europe/Stockholm',
    rateLimit: 48,
    reliability: 0.97
  },
  {
    id: 'oslo',
    name: 'Oslo Børs',
    baseUrl: 'https://api.oslobors.no',
    endpoints: {
      prices: '/api/v1/prices',
      indices: '/api/v1/indices',
      stats: '/api/v1/statistics'
    },
    symbols: ['EQNR.OL', 'DNB.OL', 'MOWI.OL', 'TEL.OL', 'AKERBP.OL'],
    currency: 'NOK',
    timezone: 'Europe/Oslo',
    rateLimit: 40,
    reliability: 0.95
  }
];

export interface EuropeanMarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  currency: string;
  lastUpdate: string;
  market: string;
}

export interface EuropeanMarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  currency: string;
  lastUpdate: string;
  market: string;
}

export class EuropeanMarketDataService {
  private dataSources: EuropeanMarketDataSource[];

  constructor() {
    this.dataSources = EUROPEAN_MARKET_DATA_SOURCES;
  }

  async getMarketData(marketId: string): Promise<EuropeanMarketData[]> {
    const source = this.dataSources.find(s => s.id === marketId);
    if (!source) {
      throw new Error(`Market data source not found: ${marketId}`);
    }

    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockData: EuropeanMarketData[] = source.symbols.map(symbol => ({
      symbol,
      name: this.getStockName(symbol),
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.random() * 100000000000,
      currency: source.currency,
      lastUpdate: new Date().toISOString(),
      market: marketId
    }));

    return mockData;
  }

  async getMarketIndex(marketId: string): Promise<EuropeanMarketIndex> {
    const source = this.dataSources.find(s => s.id === marketId);
    if (!source) {
      throw new Error(`Market data source not found: ${marketId}`);
    }

    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockIndex: EuropeanMarketIndex = {
      name: source.name,
      value: Math.random() * 20000 + 5000,
      change: (Math.random() - 0.5) * 200,
      changePercent: (Math.random() - 0.5) * 3,
      volume: Math.floor(Math.random() * 1000000000),
      marketCap: Math.random() * 1000000000000,
      currency: source.currency,
      lastUpdate: new Date().toISOString(),
      market: marketId
    };

    return mockIndex;
  }

  async getAllMarketsData(): Promise<{[key: string]: EuropeanMarketIndex}> {
    const results: {[key: string]: EuropeanMarketIndex} = {};
    
    for (const source of this.dataSources) {
      try {
        const index = await this.getMarketIndex(source.id);
        results[source.id] = index;
      } catch (error) {
        console.error(`Error fetching data for ${source.id}:`, error);
      }
    }

    return results;
  }

  private getStockName(symbol: string): string {
    const stockNames: {[key: string]: string} = {
      'HSBA.L': 'HSBC Holdings',
      'SHEL.L': 'Shell',
      'RIO.L': 'Rio Tinto',
      'GSK.L': 'GlaxoSmithKline',
      'BP.L': 'BP',
      'AIR.PA': 'Airbus',
      'SAN.PA': 'Sanofi',
      'MC.PA': 'LVMH',
      'OR.PA': 'L\'Oréal',
      'BNP.PA': 'BNP Paribas',
      'DAI.DE': 'Mercedes-Benz',
      'SAP.DE': 'SAP',
      'VOW3.DE': 'Volkswagen',
      'BMW.DE': 'BMW',
      'BAS.DE': 'BASF',
      'NESN.SW': 'Nestlé',
      'ROG.SW': 'Roche',
      'UBSG.SW': 'UBS',
      'NOVN.SW': 'Novartis',
      'ZURN.SW': 'Zurich Insurance',
      'SAN.MC': 'Santander',
      'IBE.MC': 'Iberdrola',
      'REP.MC': 'Repsol',
      'ITX.MC': 'Inditex',
      'AMS.MC': 'Amadeus',
      'ERIC-B.ST': 'Ericsson',
      'VOLV-B.ST': 'Volvo',
      'HM-B.ST': 'H&M',
      'SEB-A.ST': 'SEB',
      'SHB-A.ST': 'Handelsbanken',
      'EQNR.OL': 'Equinor',
      'DNB.OL': 'DNB',
      'MOWI.OL': 'Mowi',
      'TEL.OL': 'Telenor',
      'AKERBP.OL': 'Aker BP'
    };

    return stockNames[symbol] || symbol;
  }

  getMarketDataSource(marketId: string): EuropeanMarketDataSource | undefined {
    return this.dataSources.find(s => s.id === marketId);
  }

  getAllDataSources(): EuropeanMarketDataSource[] {
    return this.dataSources;
  }

  getMarketsByCurrency(currency: string): EuropeanMarketDataSource[] {
    return this.dataSources.filter(s => s.currency === currency);
  }

  getMarketsByTimezone(timezone: string): EuropeanMarketDataSource[] {
    return this.dataSources.filter(s => s.timezone === timezone);
  }
}

// Singleton instance
export const europeanMarketDataService = new EuropeanMarketDataService();