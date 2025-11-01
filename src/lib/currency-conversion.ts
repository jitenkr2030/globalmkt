export interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
  source: string;
}

export interface ConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  timestamp?: string;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  conversionFee?: number;
  timestamp: string;
}

export interface CurrencyPair {
  base: string;
  quote: string;
  pipSize: number;
  lotSize: number;
  marginRequirement: number;
  typicalSpread: number;
}

export interface MarketCurrencyProfile {
  market: string;
  baseCurrency: string;
  reportingCurrency: string;
  currencyPairs: CurrencyPair[];
  settlementCurrency: string;
  tradingHours: string;
  liquidityTier: 'high' | 'medium' | 'low';
}

class CurrencyConverter {
  private readonly exchangeRates: Map<string, CurrencyRate> = new Map();
  private readonly currencyPairs: Map<string, CurrencyPair> = new Map();
  private readonly marketProfiles: Map<string, MarketCurrencyProfile> = new Map();
  
  // Base currency for all conversions (USD)
  private readonly baseCurrency = 'USD';

  constructor() {
    this.initializeExchangeRates();
    this.initializeCurrencyPairs();
    this.initializeMarketProfiles();
  }

  private initializeExchangeRates(): void {
    // Initialize with realistic exchange rates (relative to USD)
    const rates: CurrencyRate[] = [
      // Major currencies
      { from: 'USD', to: 'EUR', rate: 0.92, timestamp: new Date().toISOString(), source: 'ECB' },
      { from: 'USD', to: 'GBP', rate: 0.79, timestamp: new Date().toISOString(), source: 'BOE' },
      { from: 'USD', to: 'JPY', rate: 149.50, timestamp: new Date().toISOString(), source: 'BOJ' },
      { from: 'USD', to: 'CHF', rate: 0.88, timestamp: new Date().toISOString(), source: 'SNB' },
      { from: 'USD', to: 'CNY', rate: 7.24, timestamp: new Date().toISOString(), source: 'PBOC' },
      { from: 'USD', to: 'HKD', rate: 7.83, timestamp: new Date().toISOString(), source: 'HKMA' },
      { from: 'USD', to: 'SGD', rate: 1.35, timestamp: new Date().toISOString(), source: 'MAS' },
      { from: 'USD', to: 'KRW', rate: 1320.50, timestamp: new Date().toISOString(), source: 'BOK' },
      { from: 'USD', to: 'INR', rate: 83.12, timestamp: new Date().toISOString(), source: 'RBI' },
      { from: 'USD', to: 'NPR', rate: 133.15, timestamp: new Date().toISOString(), source: 'NRB' },
      { from: 'USD', to: 'SEK', rate: 10.85, timestamp: new Date().toISOString(), source: 'Riksbank' },
      { from: 'USD', to: 'NOK', rate: 10.65, timestamp: new Date().toISOString(), source: 'Norges Bank' },
      
      // American currencies
      { from: 'USD', to: 'CAD', rate: 1.35, timestamp: new Date().toISOString(), source: 'BOC' },
      { from: 'USD', to: 'MXN', rate: 18.50, timestamp: new Date().toISOString(), source: 'BANXICO' },
      { from: 'USD', to: 'BRL', rate: 5.20, timestamp: new Date().toISOString(), source: 'BCB' },
      { from: 'USD', to: 'ARS', rate: 350.00, timestamp: new Date().toISOString(), source: 'BCRA' },
      
      // Cross rates (for efficiency)
      { from: 'EUR', to: 'GBP', rate: 0.86, timestamp: new Date().toISOString(), source: 'ECB' },
      { from: 'EUR', to: 'JPY', rate: 162.50, timestamp: new Date().toISOString(), source: 'ECB' },
      { from: 'GBP', to: 'JPY', rate: 189.24, timestamp: new Date().toISOString(), source: 'BOE' },
      { from: 'EUR', to: 'CHF', rate: 0.96, timestamp: new Date().toISOString(), source: 'SNB' },
      { from: 'GBP', to: 'CHF', rate: 1.12, timestamp: new Date().toISOString(), source: 'SNB' },
    ];

    rates.forEach(rate => {
      const key = `${rate.from}/${rate.to}`;
      this.exchangeRates.set(key, rate);
      
      // Add reverse rate
      const reverseKey = `${rate.to}/${rate.from}`;
      const reverseRate: CurrencyRate = {
        from: rate.to,
        to: rate.from,
        rate: 1 / rate.rate,
        timestamp: rate.timestamp,
        source: rate.source
      };
      this.exchangeRates.set(reverseKey, reverseRate);
    });
  }

  private initializeCurrencyPairs(): void {
    const pairs: CurrencyPair[] = [
      // Major pairs
      { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 },
      { base: 'GBP', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.5, typicalSpread: 1.5 },
      { base: 'USD', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 },
      { base: 'USD', quote: 'CHF', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.5 },
      { base: 'AUD', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 1.8 },
      { base: 'USD', quote: 'CAD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 },
      
      // American currency pairs
      { base: 'USD', quote: 'MXN', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 25.0 },
      { base: 'USD', quote: 'BRL', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 30.0 },
      { base: 'USD', quote: 'ARS', pipSize: 0.001, lotSize: 100000, marginRequirement: 8.0, typicalSpread: 50.0 },
      { base: 'CAD', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 },
      
      // Cross pairs
      { base: 'EUR', quote: 'GBP', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.5 },
      { base: 'EUR', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.8 },
      { base: 'GBP', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 3.2 },
      { base: 'EUR', quote: 'CHF', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.8 },
      
      // Asian pairs
      { base: 'USD', quote: 'CNY', pipSize: 0.0001, lotSize: 100000, marginRequirement: 5.0, typicalSpread: 15.0 },
      { base: 'USD', quote: 'HKD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 5.0, typicalSpread: 8.0 },
      { base: 'USD', quote: 'SGD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 3.5 },
      { base: 'USD', quote: 'KRW', pipSize: 0.01, lotSize: 100000, marginRequirement: 8.0, typicalSpread: 25.0 },
      { base: 'USD', quote: 'INR', pipSize: 0.0025, lotSize: 100000, marginRequirement: 8.0, typicalSpread: 20.0 },
      { base: 'USD', quote: 'NPR', pipSize: 0.0025, lotSize: 100000, marginRequirement: 10.0, typicalSpread: 30.0 },
      
      // Scandinavian pairs
      { base: 'USD', quote: 'SEK', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 8.0 },
      { base: 'USD', quote: 'NOK', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 8.0 },
    ];

    pairs.forEach(pair => {
      const key = `${pair.base}/${pair.quote}`;
      this.currencyPairs.set(key, pair);
    });
  }

  private initializeMarketProfiles(): void {
    const profiles: MarketCurrencyProfile[] = [
      // European markets
      {
        market: 'london',
        baseCurrency: 'GBP',
        reportingCurrency: 'GBP',
        currencyPairs: [
          { base: 'EUR', quote: 'GBP', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.5 },
          { base: 'GBP', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.5, typicalSpread: 1.5 },
          { base: 'GBP', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 3.2 }
        ],
        settlementCurrency: 'GBP',
        tradingHours: '08:00-16:30 GMT',
        liquidityTier: 'high'
      },
      {
        market: 'euronext',
        baseCurrency: 'EUR',
        reportingCurrency: 'EUR',
        currencyPairs: [
          { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 },
          { base: 'EUR', quote: 'GBP', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.5 },
          { base: 'EUR', quote: 'CHF', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.8 }
        ],
        settlementCurrency: 'EUR',
        tradingHours: '09:00-17:30 CET',
        liquidityTier: 'high'
      },
      {
        market: 'xetra',
        baseCurrency: 'EUR',
        reportingCurrency: 'EUR',
        currencyPairs: [
          { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 },
          { base: 'EUR', quote: 'GBP', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.5 }
        ],
        settlementCurrency: 'EUR',
        tradingHours: '09:00-17:30 CET',
        liquidityTier: 'high'
      },
      {
        market: 'six',
        baseCurrency: 'CHF',
        reportingCurrency: 'CHF',
        currencyPairs: [
          { base: 'USD', quote: 'CHF', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.5 },
          { base: 'EUR', quote: 'CHF', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.8 }
        ],
        settlementCurrency: 'CHF',
        tradingHours: '09:00-17:30 CET',
        liquidityTier: 'medium'
      },
      {
        market: 'bme',
        baseCurrency: 'EUR',
        reportingCurrency: 'EUR',
        currencyPairs: [
          { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 }
        ],
        settlementCurrency: 'EUR',
        tradingHours: '09:00-17:30 CET',
        liquidityTier: 'medium'
      },
      {
        market: 'nasdaq-nordic',
        baseCurrency: 'SEK',
        reportingCurrency: 'SEK',
        currencyPairs: [
          { base: 'USD', quote: 'SEK', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 8.0 },
          { base: 'EUR', quote: 'SEK', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 6.0 }
        ],
        settlementCurrency: 'SEK',
        tradingHours: '09:00-17:25 CET',
        liquidityTier: 'low'
      },
      {
        market: 'oslo',
        baseCurrency: 'NOK',
        reportingCurrency: 'NOK',
        currencyPairs: [
          { base: 'USD', quote: 'NOK', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 8.0 },
          { base: 'EUR', quote: 'NOK', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 6.0 }
        ],
        settlementCurrency: 'NOK',
        tradingHours: '09:00-16:20 CET',
        liquidityTier: 'low'
      },
      
      // Asian markets
      {
        market: 'japan',
        baseCurrency: 'JPY',
        reportingCurrency: 'JPY',
        currencyPairs: [
          { base: 'USD', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 },
          { base: 'EUR', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 2.8 },
          { base: 'GBP', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 3.2 }
        ],
        settlementCurrency: 'JPY',
        tradingHours: '09:00-15:00 JST',
        liquidityTier: 'high'
      },
      {
        market: 'china',
        baseCurrency: 'CNY',
        reportingCurrency: 'CNY',
        currencyPairs: [
          { base: 'USD', quote: 'CNY', pipSize: 0.0001, lotSize: 100000, marginRequirement: 5.0, typicalSpread: 15.0 }
        ],
        settlementCurrency: 'CNY',
        tradingHours: '09:30-15:00 CST',
        liquidityTier: 'medium'
      },
      {
        market: 'hongkong',
        baseCurrency: 'HKD',
        reportingCurrency: 'HKD',
        currencyPairs: [
          { base: 'USD', quote: 'HKD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 5.0, typicalSpread: 8.0 }
        ],
        settlementCurrency: 'HKD',
        tradingHours: '09:30-16:00 HKT',
        liquidityTier: 'high'
      },
      {
        market: 'singapore',
        baseCurrency: 'SGD',
        reportingCurrency: 'SGD',
        currencyPairs: [
          { base: 'USD', quote: 'SGD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 3.5 }
        ],
        settlementCurrency: 'SGD',
        tradingHours: '09:00-17:00 SGT',
        liquidityTier: 'medium'
      },
      {
        market: 'korea',
        baseCurrency: 'KRW',
        reportingCurrency: 'KRW',
        currencyPairs: [
          { base: 'USD', quote: 'KRW', pipSize: 0.01, lotSize: 100000, marginRequirement: 8.0, typicalSpread: 25.0 }
        ],
        settlementCurrency: 'KRW',
        tradingHours: '09:00-15:30 KST',
        liquidityTier: 'medium'
      },
      {
        market: 'india',
        baseCurrency: 'INR',
        reportingCurrency: 'INR',
        currencyPairs: [
          { base: 'USD', quote: 'INR', pipSize: 0.0025, lotSize: 100000, marginRequirement: 8.0, typicalSpread: 20.0 }
        ],
        settlementCurrency: 'INR',
        tradingHours: '09:15-15:30 IST',
        liquidityTier: 'medium'
      },
      {
        market: 'nepal',
        baseCurrency: 'NPR',
        reportingCurrency: 'NPR',
        currencyPairs: [
          { base: 'USD', quote: 'NPR', pipSize: 0.0025, lotSize: 100000, marginRequirement: 10.0, typicalSpread: 30.0 }
        ],
        settlementCurrency: 'NPR',
        tradingHours: '11:00-15:00 NPT',
        liquidityTier: 'low'
      },
      
      // American markets
      {
        market: 'nyse',
        baseCurrency: 'USD',
        reportingCurrency: 'USD',
        currencyPairs: [
          { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 },
          { base: 'GBP', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.5, typicalSpread: 1.5 },
          { base: 'USD', quote: 'CAD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 },
          { base: 'USD', quote: 'MXN', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 25.0 }
        ],
        settlementCurrency: 'USD',
        tradingHours: '09:30-16:00 ET',
        liquidityTier: 'high'
      },
      {
        market: 'nasdaq',
        baseCurrency: 'USD',
        reportingCurrency: 'USD',
        currencyPairs: [
          { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 },
          { base: 'GBP', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.5, typicalSpread: 1.5 },
          { base: 'USD', quote: 'JPY', pipSize: 0.01, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 }
        ],
        settlementCurrency: 'USD',
        tradingHours: '09:30-16:00 ET',
        liquidityTier: 'high'
      },
      {
        market: 'cme',
        baseCurrency: 'USD',
        reportingCurrency: 'USD',
        currencyPairs: [
          { base: 'EUR', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.2 },
          { base: 'GBP', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.5, typicalSpread: 1.5 },
          { base: 'USD', quote: 'CAD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 }
        ],
        settlementCurrency: 'USD',
        tradingHours: '00:00-23:59 CT',
        liquidityTier: 'high'
      },
      {
        market: 'tsx',
        baseCurrency: 'CAD',
        reportingCurrency: 'CAD',
        currencyPairs: [
          { base: 'USD', quote: 'CAD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 },
          { base: 'CAD', quote: 'USD', pipSize: 0.0001, lotSize: 100000, marginRequirement: 2.0, typicalSpread: 1.8 }
        ],
        settlementCurrency: 'CAD',
        tradingHours: '09:30-16:00 ET',
        liquidityTier: 'medium'
      },
      {
        market: 'bmv',
        baseCurrency: 'MXN',
        reportingCurrency: 'MXN',
        currencyPairs: [
          { base: 'USD', quote: 'MXN', pipSize: 0.0001, lotSize: 100000, marginRequirement: 3.0, typicalSpread: 25.0 }
        ],
        settlementCurrency: 'MXN',
        tradingHours: '08:30-15:00 CT',
        liquidityTier: 'medium'
      },
      {
        market: 'b3',
        baseCurrency: 'BRL',
        reportingCurrency: 'BRL',
        currencyPairs: [
          { base: 'USD', quote: 'BRL', pipSize: 0.0001, lotSize: 100000, marginRequirement: 4.0, typicalSpread: 30.0 }
        ],
        settlementCurrency: 'BRL',
        tradingHours: '10:00-17:00 BRT',
        liquidityTier: 'medium'
      },
      {
        market: 'bca',
        baseCurrency: 'ARS',
        reportingCurrency: 'ARS',
        currencyPairs: [
          { base: 'USD', quote: 'ARS', pipSize: 0.001, lotSize: 100000, marginRequirement: 8.0, typicalSpread: 50.0 }
        ],
        settlementCurrency: 'ARS',
        tradingHours: '11:00-17:00 ART',
        liquidityTier: 'low'
      }
    ];

    profiles.forEach(profile => {
      this.marketProfiles.set(profile.market, profile);
    });
  }

  convertCurrency(request: ConversionRequest): ConversionResult {
    const { amount, fromCurrency, toCurrency, timestamp = new Date().toISOString() } = request;
    
    let rate: number;
    
    if (fromCurrency === toCurrency) {
      rate = 1.0;
    } else {
      const directKey = `${fromCurrency}/${toCurrency}`;
      const directRate = this.exchangeRates.get(directKey);
      
      if (directRate) {
        rate = directRate.rate;
      } else {
        // Try to convert via USD
        const toUsdKey = `${fromCurrency}/USD`;
        const fromUsdKey = `USD/${toCurrency}`;
        
        const toUsdRate = this.exchangeRates.get(toUsdKey);
        const fromUsdRate = this.exchangeRates.get(fromUsdKey);
        
        if (toUsdRate && fromUsdRate) {
          rate = toUsdRate.rate * fromUsdRate.rate;
        } else {
          throw new Error(`No exchange rate available for ${fromCurrency} to ${toCurrency}`);
        }
      }
    }

    const convertedAmount = amount * rate;
    const conversionFee = this.calculateConversionFee(amount, fromCurrency, toCurrency);

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      targetCurrency: toCurrency,
      exchangeRate: rate,
      conversionFee,
      timestamp
    };
  }

  private calculateConversionFee(amount: number, fromCurrency: string, toCurrency: string): number {
    // Simplified fee calculation based on currency pair and amount
    const isMajorPair = this.isMajorPair(fromCurrency, toCurrency);
    const isCrossPair = this.isCrossPair(fromCurrency, toCurrency);
    
    let feeRate: number;
    if (isMajorPair) {
      feeRate = 0.001; // 0.1%
    } else if (isCrossPair) {
      feeRate = 0.002; // 0.2%
    } else {
      feeRate = 0.005; // 0.5%
    }
    
    return amount * feeRate;
  }

  private isMajorPair(fromCurrency: string, toCurrency: string): boolean {
    const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
    return majorCurrencies.includes(fromCurrency) && majorCurrencies.includes(toCurrency);
  }

  private isCrossPair(fromCurrency: string, toCurrency: string): boolean {
    const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
    return majorCurrencies.includes(fromCurrency) || majorCurrencies.includes(toCurrency);
  }

  getExchangeRate(fromCurrency: string, toCurrency: string): CurrencyRate | null {
    const key = `${fromCurrency}/${toCurrency}`;
    return this.exchangeRates.get(key) || null;
  }

  getCurrencyPair(baseCurrency: string, quoteCurrency: string): CurrencyPair | null {
    const key = `${baseCurrency}/${quoteCurrency}`;
    return this.currencyPairs.get(key) || null;
  }

  getMarketCurrencyProfile(market: string): MarketCurrencyProfile | null {
    return this.marketProfiles.get(market) || null;
  }

  getAvailableCurrencies(): string[] {
    const currencies = new Set<string>();
    
    this.exchangeRates.forEach((rate, key) => {
      const [from, to] = key.split('/');
      currencies.add(from);
      currencies.add(to);
    });
    
    return Array.from(currencies).sort();
  }

  getCurrencyPairsByMarket(market: string): CurrencyPair[] {
    const profile = this.marketProfiles.get(market);
    return profile ? profile.currencyPairs : [];
  }

  convertMarketValue(market: string, value: number, targetCurrency: string): ConversionResult {
    const profile = this.marketProfiles.get(market);
    if (!profile) {
      throw new Error(`Market profile not found for ${market}`);
    }
    
    return this.convertCurrency({
      amount: value,
      fromCurrency: profile.reportingCurrency,
      toCurrency: targetCurrency
    });
  }

  getMarketCurrencySummary(market: string): {
    market: string;
    baseCurrency: string;
    reportingCurrency: string;
    availablePairs: string[];
    liquidityTier: string;
    tradingHours: string;
    settlementCurrency: string;
  } {
    const profile = this.marketProfiles.get(market);
    if (!profile) {
      throw new Error(`Market profile not found for ${market}`);
    }
    
    return {
      market: profile.market,
      baseCurrency: profile.baseCurrency,
      reportingCurrency: profile.reportingCurrency,
      availablePairs: profile.currencyPairs.map(pair => `${pair.base}/${pair.quote}`),
      liquidityTier: profile.liquidityTier,
      tradingHours: profile.tradingHours,
      settlementCurrency: profile.settlementCurrency
    };
  }

  calculateCrossCurrencyValue(amount: number, fromCurrency: string, toCurrency: string): {
    directConversion: ConversionResult;
    viaUsdConversion: ConversionResult;
    difference: number;
    recommendedMethod: 'direct' | 'via-usd';
  } {
    const directConversion = this.convertCurrency({
      amount,
      fromCurrency,
      toCurrency
    });
    
    // Calculate via USD
    const toUsd = this.convertCurrency({
      amount,
      fromCurrency,
      toCurrency: 'USD'
    });
    
    const fromUsd = this.convertCurrency({
      amount: toUsd.convertedAmount,
      fromCurrency: 'USD',
      toCurrency
    });
    
    const difference = Math.abs(directConversion.convertedAmount - fromUsd.convertedAmount);
    const recommendedMethod = difference < (amount * 0.001) ? 'direct' : 'via-usd';
    
    return {
      directConversion,
      viaUsdConversion: fromUsd,
      difference,
      recommendedMethod
    };
  }

  updateExchangeRate(fromCurrency: string, toCurrency: string, newRate: number): void {
    const key = `${fromCurrency}/${toCurrency}`;
    const existingRate = this.exchangeRates.get(key);
    
    if (existingRate) {
      existingRate.rate = newRate;
      existingRate.timestamp = new Date().toISOString();
    } else {
      const newRateObj: CurrencyRate = {
        from: fromCurrency,
        to: toCurrency,
        rate: newRate,
        timestamp: new Date().toISOString(),
        source: 'manual'
      };
      this.exchangeRates.set(key, newRateObj);
    }
    
    // Update reverse rate
    const reverseKey = `${toCurrency}/${fromCurrency}`;
    const reverseRate: CurrencyRate = {
      from: toCurrency,
      to: fromCurrency,
      rate: 1 / newRate,
      timestamp: new Date().toISOString(),
      source: 'manual'
    };
    this.exchangeRates.set(reverseKey, reverseRate);
  }

  getCurrencyVolatility(currency: string): {
    currency: string;
    volatility: number;
    riskLevel: 'low' | 'medium' | 'high';
    averageDailyRange: number;
    lastUpdate: string;
  } {
    // Simplified volatility calculation based on currency type
    const volatilityMap: { [key: string]: number } = {
      'USD': 0.5,
      'EUR': 0.6,
      'GBP': 0.8,
      'JPY': 0.7,
      'CHF': 0.6,
      'CNY': 1.2,
      'HKD': 0.3,
      'SGD': 0.7,
      'KRW': 1.5,
      'INR': 1.0,
      'NPR': 1.2,
      'SEK': 0.9,
      'NOK': 1.0
    };
    
    const volatility = volatilityMap[currency] || 1.0;
    const riskLevel = volatility < 0.7 ? 'low' : volatility < 1.0 ? 'medium' : 'high';
    const averageDailyRange = volatility * 0.01; // Convert to percentage
    
    return {
      currency,
      volatility,
      riskLevel,
      averageDailyRange,
      lastUpdate: new Date().toISOString()
    };
  }
}

export const currencyConverter = new CurrencyConverter();
export default CurrencyConverter;