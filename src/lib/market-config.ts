export interface MarketConfig {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  tradingHours: {
    open: string;
    close: string;
    timezone: string;
  };
  marketCap: number;
  majorStocks: string[];
  majorIndustries: string[];
  emergingMarket: boolean;
  volatility: number;
  networkLatency: number;
  rateLimit: number;
  reliability: number;
  delay: number;
}

export const ASIAN_MARKETS: MarketConfig[] = [
  {
    id: 'india',
    name: 'National Stock Exchange (NSE)',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    tradingHours: {
      open: '09:15',
      close: '15:30',
      timezone: 'Asia/Kolkata'
    },
    marketCap: 3500000000000, // $3.5 trillion
    majorStocks: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'],
    majorIndustries: ['Technology', 'Banking', 'Energy', 'Consumer Goods', 'Pharmaceuticals'],
    emergingMarket: true,
    volatility: 0.018,
    networkLatency: 80,
    rateLimit: 40,
    reliability: 0.96,
    delay: 8
  },
  {
    id: 'japan',
    name: 'Tokyo Stock Exchange',
    currency: 'JPY',
    timezone: 'Asia/Tokyo',
    tradingHours: {
      open: '09:00',
      close: '15:00',
      timezone: 'Asia/Tokyo'
    },
    marketCap: 6000000000000, // $6 trillion
    majorStocks: ['7203', '6758', '4502', '9984', '8306'],
    majorIndustries: ['Technology', 'Automotive', 'Finance', 'Consumer Goods'],
    emergingMarket: false,
    volatility: 0.015,
    networkLatency: 50,
    rateLimit: 60,
    reliability: 0.99,
    delay: 5
  },
  {
    id: 'china',
    name: 'Shanghai Stock Exchange',
    currency: 'CNY',
    timezone: 'Asia/Shanghai',
    tradingHours: {
      open: '09:30',
      close: '15:00',
      timezone: 'Asia/Shanghai'
    },
    marketCap: 7000000000000, // $7 trillion
    majorStocks: ['600036', '601318', '600519', '601166', '600028'],
    majorIndustries: ['Banking', 'Technology', 'Energy', 'Consumer'],
    emergingMarket: true,
    volatility: 0.025,
    networkLatency: 100,
    rateLimit: 30,
    reliability: 0.95,
    delay: 10
  },
  {
    id: 'hongkong',
    name: 'Hong Kong Stock Exchange',
    currency: 'HKD',
    timezone: 'Asia/Hong_Kong',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'Asia/Hong_Kong'
    },
    marketCap: 5000000000000, // $5 trillion
    majorStocks: ['00700', '00941', '03900', '00388', '01299'],
    majorIndustries: ['Technology', 'Finance', 'Real Estate', 'Utilities'],
    emergingMarket: false,
    volatility: 0.02,
    networkLatency: 30,
    rateLimit: 50,
    reliability: 0.98,
    delay: 8
  },
  {
    id: 'korea',
    name: 'Korea Exchange',
    currency: 'KRW',
    timezone: 'Asia/Seoul',
    tradingHours: {
      open: '09:00',
      close: '15:30',
      timezone: 'Asia/Seoul'
    },
    marketCap: 2000000000000, // $2 trillion
    majorStocks: ['005930', '000660', '207940', '005490', '068270'],
    majorIndustries: ['Technology', 'Automotive', 'Chemicals', 'Finance'],
    emergingMarket: false,
    volatility: 0.022,
    networkLatency: 40,
    rateLimit: 45,
    reliability: 0.97,
    delay: 7
  },
  {
    id: 'singapore',
    name: 'Singapore Exchange',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    tradingHours: {
      open: '09:00',
      close: '17:00',
      timezone: 'Asia/Singapore'
    },
    marketCap: 600000000000, // $600 billion
    majorStocks: ['D05', 'O39', 'U11', 'Z74', 'C6L'],
    majorIndustries: ['Banking', 'Real Estate', 'Telecommunications', 'Transportation'],
    emergingMarket: false,
    volatility: 0.018,
    networkLatency: 25,
    rateLimit: 55,
    reliability: 0.99,
    delay: 6
  },
  {
    id: 'nepal',
    name: 'Nepal Stock Exchange (NEPSE)',
    currency: 'NPR',
    timezone: 'Asia/Kathmandu',
    tradingHours: {
      open: '11:00',
      close: '15:00',
      timezone: 'Asia/Kathmandu'
    },
    marketCap: 25000000000, // $25 billion
    majorStocks: ['NABIL', 'NICA', 'EBL', 'NMB', 'Prabhu'],
    majorIndustries: ['Commercial Banks', 'Hydro Power', 'Insurance', 'Manufacturing'],
    emergingMarket: true,
    volatility: 0.035,
    networkLatency: 1500,
    rateLimit: 20,
    reliability: 0.90,
    delay: 15
  },
  {
    id: 'bse',
    name: 'Bombay Stock Exchange (BSE)',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    tradingHours: {
      open: '09:15',
      close: '15:30',
      timezone: 'Asia/Kolkata'
    },
    marketCap: 4200000000000, // $4.2 trillion
    majorStocks: ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR'],
    majorIndustries: ['Technology', 'Banking', 'Energy', 'Consumer Goods', 'Pharmaceuticals'],
    emergingMarket: true,
    volatility: 0.018,
    networkLatency: 75,
    rateLimit: 42,
    reliability: 0.97,
    delay: 7
  },
  {
    id: 'taiwan',
    name: 'Taiwan Stock Exchange (TWSE)',
    currency: 'TWD',
    timezone: 'Asia/Taipei',
    tradingHours: {
      open: '09:00',
      close: '13:30',
      timezone: 'Asia/Taipei'
    },
    marketCap: 2500000000000, // $2.5 trillion
    majorStocks: ['2330', '2454', '2317', '1303', '2881'],
    majorIndustries: ['Technology', 'Semiconductors', 'Banking', 'Manufacturing'],
    emergingMarket: false,
    volatility: 0.020,
    networkLatency: 45,
    rateLimit: 48,
    reliability: 0.98,
    delay: 6
  },
  {
    id: 'thailand',
    name: 'Stock Exchange of Thailand (SET)',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    tradingHours: {
      open: '10:00',
      close: '16:30',
      timezone: 'Asia/Bangkok'
    },
    marketCap: 640000000000, // $640 billion
    majorStocks: ['PTT', 'SCB', 'AOT', 'CPALL', 'KBANK'],
    majorIndustries: ['Energy', 'Banking', 'Transportation', 'Retail', 'Telecommunications'],
    emergingMarket: true,
    volatility: 0.022,
    networkLatency: 90,
    rateLimit: 35,
    reliability: 0.95,
    delay: 9
  },
  {
    id: 'malaysia',
    name: 'Bursa Malaysia',
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
    tradingHours: {
      open: '09:00',
      close: '17:00',
      timezone: 'Asia/Kuala_Lumpur'
    },
    marketCap: 550000000000, // $550 billion
    majorStocks: ['MAYBANK', 'CIMB', 'PETRONAS', 'TENAGA', 'MAXIS'],
    majorIndustries: ['Banking', 'Energy', 'Telecommunications', 'Utilities', 'Plantations'],
    emergingMarket: true,
    volatility: 0.019,
    networkLatency: 70,
    rateLimit: 40,
    reliability: 0.96,
    delay: 8
  },
  {
    id: 'indonesia',
    name: 'Indonesia Stock Exchange (IDX)',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    tradingHours: {
      open: '09:00',
      close: '15:50',
      timezone: 'Asia/Jakarta'
    },
    marketCap: 720000000000, // $720 billion
    majorStocks: ['BBCA', 'BMRI', 'BBNI', 'TLKM', 'UNVR'],
    majorIndustries: ['Banking', 'Telecommunications', 'Consumer Goods', 'Mining', 'Infrastructure'],
    emergingMarket: true,
    volatility: 0.025,
    networkLatency: 110,
    rateLimit: 30,
    reliability: 0.93,
    delay: 11
  },
  {
    id: 'vietnam',
    name: 'Ho Chi Minh Stock Exchange (HOSE)',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    tradingHours: {
      open: '09:00',
      close: '15:00',
      timezone: 'Asia/Ho_Chi_Minh'
    },
    marketCap: 380000000000, // $380 billion
    majorStocks: ['VIC', 'VNM', 'MSN', 'HPG', 'ACB'],
    majorIndustries: ['Real Estate', 'Banking', 'Consumer Goods', 'Steel', 'Financial Services'],
    emergingMarket: true,
    volatility: 0.030,
    networkLatency: 130,
    rateLimit: 25,
    reliability: 0.91,
    delay: 13
  },
  {
    id: 'philippines',
    name: 'Philippine Stock Exchange (PSE)',
    currency: 'PHP',
    timezone: 'Asia/Manila',
    tradingHours: {
      open: '09:30',
      close: '15:30',
      timezone: 'Asia/Manila'
    },
    marketCap: 280000000000, // $280 billion
    majorStocks: ['SM', 'BDO', 'TEL', 'JFC', 'AC'],
    majorIndustries: ['Conglomerates', 'Banking', 'Telecommunications', 'Food & Beverage', 'Real Estate'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 120,
    rateLimit: 28,
    reliability: 0.92,
    delay: 12
  }
];

export const EUROPEAN_MARKETS: MarketConfig[] = [
  {
    id: 'london',
    name: 'London Stock Exchange (LSE)',
    currency: 'GBP',
    timezone: 'Europe/London',
    tradingHours: {
      open: '08:00',
      close: '16:30',
      timezone: 'Europe/London'
    },
    marketCap: 3900000000000, // $3.9 trillion
    majorStocks: ['HSBA', 'SHEL', 'RIO', 'GSK', 'BP'],
    majorIndustries: ['Finance', 'Energy', 'Mining', 'Pharmaceuticals', 'Consumer Goods'],
    emergingMarket: false,
    volatility: 0.015,
    networkLatency: 35,
    rateLimit: 50,
    reliability: 0.98,
    delay: 5
  },
  {
    id: 'euronext',
    name: 'Euronext',
    currency: 'EUR',
    timezone: 'Europe/Paris',
    tradingHours: {
      open: '09:00',
      close: '17:30',
      timezone: 'Europe/Paris'
    },
    marketCap: 6200000000000, // $6.2 trillion
    majorStocks: ['AIR', 'SAN', 'MC', 'OR', 'BNP'],
    majorIndustries: ['Aerospace', 'Banking', 'Luxury', 'Energy', 'Insurance'],
    emergingMarket: false,
    volatility: 0.016,
    networkLatency: 40,
    rateLimit: 45,
    reliability: 0.97,
    delay: 6
  },
  {
    id: 'xetra',
    name: 'Deutsche Börse (Xetra)',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
    tradingHours: {
      open: '09:00',
      close: '17:30',
      timezone: 'Europe/Berlin'
    },
    marketCap: 2400000000000, // $2.4 trillion
    majorStocks: ['DAI', 'SAP', 'VOW3', 'BMW', 'BAS'],
    majorIndustries: ['Automotive', 'Technology', 'Chemicals', 'Pharmaceuticals', 'Industrial'],
    emergingMarket: false,
    volatility: 0.014,
    networkLatency: 30,
    rateLimit: 55,
    reliability: 0.99,
    delay: 4
  },
  {
    id: 'six',
    name: 'SIX Swiss Exchange',
    currency: 'CHF',
    timezone: 'Europe/Zurich',
    tradingHours: {
      open: '09:00',
      close: '17:30',
      timezone: 'Europe/Zurich'
    },
    marketCap: 2100000000000, // $2.1 trillion
    majorStocks: ['NESN', 'ROG', 'UBSG', 'NOVN', 'ZURN'],
    majorIndustries: ['Pharmaceuticals', 'Food & Beverage', 'Banking', 'Insurance', 'Industrial'],
    emergingMarket: false,
    volatility: 0.013,
    networkLatency: 32,
    rateLimit: 58,
    reliability: 0.99,
    delay: 4
  },
  {
    id: 'bme',
    name: 'BME Spanish Exchanges',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
    tradingHours: {
      open: '09:00',
      close: '17:30',
      timezone: 'Europe/Madrid'
    },
    marketCap: 1200000000000, // $1.2 trillion
    majorStocks: ['SAN', 'IBE', 'REP', 'ITX', 'AMS'],
    majorIndustries: ['Banking', 'Utilities', 'Energy', 'Retail', 'Telecommunications'],
    emergingMarket: false,
    volatility: 0.018,
    networkLatency: 45,
    rateLimit: 42,
    reliability: 0.96,
    delay: 7
  },
  {
    id: 'nasdaq-nordic',
    name: 'Nasdaq Nordic',
    currency: 'SEK',
    timezone: 'Europe/Stockholm',
    tradingHours: {
      open: '09:00',
      close: '17:30',
      timezone: 'Europe/Stockholm'
    },
    marketCap: 1500000000000, // $1.5 trillion
    majorStocks: ['ERIC', 'VOLV', 'HM', 'SEB', 'SHB'],
    majorIndustries: ['Technology', 'Automotive', 'Retail', 'Banking', 'Industrial'],
    emergingMarket: false,
    volatility: 0.017,
    networkLatency: 38,
    rateLimit: 48,
    reliability: 0.97,
    delay: 6
  },
  {
    id: 'oslo',
    name: 'Oslo Børs',
    currency: 'NOK',
    timezone: 'Europe/Oslo',
    tradingHours: {
      open: '09:00',
      close: '16:20',
      timezone: 'Europe/Oslo'
    },
    marketCap: 350000000000, // $350 billion
    majorStocks: ['EQNR', 'DNB', 'MOWI', 'TEL', 'AKERBP'],
    majorIndustries: ['Energy', 'Banking', 'Seafood', 'Telecommunications', 'Shipping'],
    emergingMarket: false,
    volatility: 0.019,
    networkLatency: 42,
    rateLimit: 40,
    reliability: 0.95,
    delay: 8
  },
  {
    id: 'warsaw',
    name: 'Warsaw Stock Exchange (GPW)',
    currency: 'PLN',
    timezone: 'Europe/Warsaw',
    tradingHours: {
      open: '09:00',
      close: '17:20',
      timezone: 'Europe/Warsaw'
    },
    marketCap: 280000000000, // $280 billion
    majorStocks: ['PKN', 'PZU', 'CDR', 'KGH', 'OPL'],
    majorIndustries: ['Energy', 'Insurance', 'Banking', 'Mining', 'Telecommunications'],
    emergingMarket: true,
    volatility: 0.025,
    networkLatency: 60,
    rateLimit: 35,
    reliability: 0.94,
    delay: 10
  },
  {
    id: 'budapest',
    name: 'Budapest Stock Exchange (BSE)',
    currency: 'HUF',
    timezone: 'Europe/Budapest',
    tradingHours: {
      open: '09:00',
      close: '17:00',
      timezone: 'Europe/Budapest'
    },
    marketCap: 45000000000, // $45 billion
    majorStocks: ['MOL', 'OTP', 'RICHTER', 'MTELEKOM', 'GSP'],
    majorIndustries: ['Energy', 'Banking', 'Pharmaceuticals', 'Telecommunications', 'Industrial'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 65,
    rateLimit: 30,
    reliability: 0.92,
    delay: 11
  },
  {
    id: 'prague',
    name: 'Prague Stock Exchange (PSE)',
    currency: 'CZK',
    timezone: 'Europe/Prague',
    tradingHours: {
      open: '09:00',
      close: '16:00',
      timezone: 'Europe/Prague'
    },
    marketCap: 85000000000, // $85 billion
    majorStocks: ['CEZ', 'KB', 'VIG', 'O2CZR', 'ERET'],
    majorIndustries: ['Energy', 'Banking', 'Insurance', 'Telecommunications', 'Real Estate'],
    emergingMarket: true,
    volatility: 0.022,
    networkLatency: 55,
    rateLimit: 38,
    reliability: 0.95,
    delay: 9
  },
  {
    id: 'athens',
    name: 'Athens Stock Exchange (ATHEX)',
    currency: 'EUR',
    timezone: 'Europe/Athens',
    tradingHours: {
      open: '10:00',
      close: '17:20',
      timezone: 'Europe/Athens'
    },
    marketCap: 75000000000, // $75 billion
    majorStocks: ['OPAP', 'ELPE', 'ETE', 'EYDAP', 'PPC'],
    majorIndustries: ['Gaming', 'Energy', 'Banking', 'Utilities', 'Telecommunications'],
    emergingMarket: true,
    volatility: 0.030,
    networkLatency: 70,
    rateLimit: 32,
    reliability: 0.91,
    delay: 12
  },
  {
    id: 'luxembourg',
    name: 'Luxembourg Stock Exchange (LuxSE)',
    currency: 'EUR',
    timezone: 'Europe/Luxembourg',
    tradingHours: {
      open: '09:00',
      close: '17:40',
      timezone: 'Europe/Luxembourg'
    },
    marketCap: 65000000000, // $65 billion
    majorStocks: ['ENGI', 'OR', 'AI', 'RILB', 'MFE'],
    majorIndustries: ['Finance', 'Industrial', 'Luxury', 'Real Estate', 'Technology'],
    emergingMarket: false,
    volatility: 0.015,
    networkLatency: 40,
    rateLimit: 45,
    reliability: 0.98,
    delay: 6
  },
  {
    id: 'ireland',
    name: 'Euronext Dublin',
    currency: 'EUR',
    timezone: 'Europe/Dublin',
    tradingHours: {
      open: '08:00',
      close: '16:30',
      timezone: 'Europe/Dublin'
    },
    marketCap: 180000000000, // $180 billion
    majorStocks: ['CRH', 'SMCP', 'AIB', 'BOI', 'RYA'],
    majorIndustries: ['Construction', 'Luxury', 'Banking', 'Airlines', 'Pharmaceuticals'],
    emergingMarket: false,
    volatility: 0.018,
    networkLatency: 35,
    rateLimit: 42,
    reliability: 0.97,
    delay: 7
  }
];

export const AFRICAN_MARKETS: MarketConfig[] = [
  {
    id: 'jse',
    name: 'Johannesburg Stock Exchange (JSE)',
    currency: 'ZAR',
    timezone: 'Africa/Johannesburg',
    tradingHours: {
      open: '09:00',
      close: '17:00',
      timezone: 'Africa/Johannesburg'
    },
    marketCap: 1200000000000, // $1.2 trillion
    majorStocks: ['AGL', 'BHP', 'VOD', 'NPN', 'SBK'],
    majorIndustries: ['Mining', 'Banking', 'Telecommunications', 'Retail', 'Insurance'],
    emergingMarket: true,
    volatility: 0.025,
    networkLatency: 180,
    rateLimit: 25,
    reliability: 0.93,
    delay: 18
  },
  {
    id: 'egx',
    name: 'Egyptian Exchange (EGX)',
    currency: 'EGP',
    timezone: 'Africa/Cairo',
    tradingHours: {
      open: '10:00',
      close: '14:30',
      timezone: 'Africa/Cairo'
    },
    marketCap: 85000000000, // $85 billion
    majorStocks: ['COMI', 'ORAS', 'EBTN', 'HRHO', 'SWDY'],
    majorIndustries: ['Construction', 'Banking', 'Telecommunications', 'Real Estate', 'Chemicals'],
    emergingMarket: true,
    volatility: 0.035,
    networkLatency: 200,
    rateLimit: 20,
    reliability: 0.90,
    delay: 20
  },
  {
    id: 'nse',
    name: 'Nigerian Stock Exchange (NSE)',
    currency: 'NGN',
    timezone: 'Africa/Lagos',
    tradingHours: {
      open: '09:30',
      close: '15:30',
      timezone: 'Africa/Lagos'
    },
    marketCap: 45000000000, // $45 billion
    majorStocks: ['DANGCEM', 'MTNN', 'ZENITHBANK', 'GUARANTY', 'ACCESS'],
    majorIndustries: ['Banking', 'Telecommunications', 'Consumer Goods', 'Energy', 'Industrial'],
    emergingMarket: true,
    volatility: 0.045,
    networkLatency: 250,
    rateLimit: 15,
    reliability: 0.85,
    delay: 25
  },
  {
    id: 'casablanca',
    name: 'Casablanca Stock Exchange',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
    tradingHours: {
      open: '09:00',
      close: '15:30',
      timezone: 'Africa/Casablanca'
    },
    marketCap: 65000000000, // $65 billion
    majorStocks: ['ATTIJARIWAFA', 'BMCE', 'ADDOHA', 'BCP', 'IAM'],
    majorIndustries: ['Banking', 'Real Estate', 'Construction', 'Telecommunications', 'Mining'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 160,
    rateLimit: 22,
    reliability: 0.92,
    delay: 16
  },
  {
    id: 'bvm',
    name: 'Bourse Régionale des Valeurs Mobilières (BRVM)',
    currency: 'XOF',
    timezone: 'Africa/Abidjan',
    tradingHours: {
      open: '10:00',
      close: '16:00',
      timezone: 'Africa/Abidjan'
    },
    marketCap: 35000000000, // $35 billion
    majorStocks: ['BOA', 'NSIA', 'ETI', 'SGB', 'CIE'],
    majorIndustries: ['Banking', 'Insurance', 'Telecommunications', 'Agriculture', 'Energy'],
    emergingMarket: true,
    volatility: 0.032,
    networkLatency: 220,
    rateLimit: 18,
    reliability: 0.88,
    delay: 22
  },
  {
    id: 'nse-kenya',
    name: 'Nairobi Securities Exchange (NSE)',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    tradingHours: {
      open: '09:00',
      close: '15:00',
      timezone: 'Africa/Nairobi'
    },
    marketCap: 25000000000, // $25 billion
    majorStocks: ['SCOM', 'KCB', 'EQTY', 'EABL', 'BAT'],
    majorIndustries: ['Telecommunications', 'Banking', 'Investment', 'Beverages', 'Manufacturing'],
    emergingMarket: true,
    volatility: 0.038,
    networkLatency: 240,
    rateLimit: 16,
    reliability: 0.87,
    delay: 24
  },
  {
    id: 'algiers',
    name: 'Algiers Stock Exchange',
    currency: 'DZD',
    timezone: 'Africa/Algiers',
    tradingHours: {
      open: '10:00',
      close: '14:00',
      timezone: 'Africa/Algiers'
    },
    marketCap: 8000000000, // $8 billion
    majorStocks: ['SAIDAL', 'NAL', 'BNA', 'CEE', 'ALL'],
    majorIndustries: ['Pharmaceuticals', 'Banking', 'Agriculture', 'Construction', 'Energy'],
    emergingMarket: true,
    volatility: 0.042,
    networkLatency: 280,
    rateLimit: 12,
    reliability: 0.82,
    delay: 28
  }
];

export const MIDDLE_EASTERN_MARKETS: MarketConfig[] = [
  {
    id: 'tadawul',
    name: 'Tadawul (Saudi Stock Exchange)',
    currency: 'SAR',
    timezone: 'Asia/Riyadh',
    tradingHours: {
      open: '10:00',
      close: '15:00',
      timezone: 'Asia/Riyadh'
    },
    marketCap: 2800000000000, // $2.8 trillion
    majorStocks: ['2222', '1120', '2380', '2010', '1095'],
    majorIndustries: ['Banking', 'Petrochemicals', 'Telecommunications', 'Real Estate', 'Energy'],
    emergingMarket: true,
    volatility: 0.022,
    networkLatency: 120,
    rateLimit: 30,
    reliability: 0.94,
    delay: 12
  },
  {
    id: 'dfm',
    name: 'Dubai Financial Market (DFM)',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    tradingHours: {
      open: '10:00',
      close: '14:00',
      timezone: 'Asia/Dubai'
    },
    marketCap: 120000000000, // $120 billion
    majorStocks: ['DIB', 'EMIRATES', 'EMAAR', 'DUBAI', 'SHUAA'],
    majorIndustries: ['Banking', 'Real Estate', 'Telecommunications', 'Insurance', 'Investment'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 100,
    rateLimit: 35,
    reliability: 0.95,
    delay: 10
  },
  {
    id: 'adx',
    name: 'Abu Dhabi Securities Exchange (ADX)',
    currency: 'AED',
    timezone: 'Asia/Dubai',
    tradingHours: {
      open: '10:00',
      close: '14:00',
      timezone: 'Asia/Dubai'
    },
    marketCap: 180000000000, // $180 billion
    majorStocks: ['ADNOC', 'FAB', 'TAQA', 'ETISALAT', 'ALDAR'],
    majorIndustries: ['Energy', 'Banking', 'Telecommunications', 'Real Estate', 'Utilities'],
    emergingMarket: true,
    volatility: 0.025,
    networkLatency: 95,
    rateLimit: 38,
    reliability: 0.96,
    delay: 9
  },
  {
    id: 'tase',
    name: 'Tel Aviv Stock Exchange (TASE)',
    currency: 'ILS',
    timezone: 'Asia/Jerusalem',
    tradingHours: {
      open: '09:45',
      close: '16:45',
      timezone: 'Asia/Jerusalem'
    },
    marketCap: 250000000000, // $250 billion
    majorStocks: ['TEVA', 'BANK', 'LEUMI', 'ICL', 'ELBIT'],
    majorIndustries: ['Technology', 'Banking', 'Pharmaceuticals', 'Defense', 'Chemicals'],
    emergingMarket: false,
    volatility: 0.020,
    networkLatency: 85,
    rateLimit: 40,
    reliability: 0.97,
    delay: 8
  },
  {
    id: 'bahrain',
    name: 'Bahrain Bourse',
    currency: 'BHD',
    timezone: 'Asia/Bahrain',
    tradingHours: {
      open: '09:30',
      close: '13:30',
      timezone: 'Asia/Bahrain'
    },
    marketCap: 25000000000, // $25 billion
    majorStocks: ['ALBA', 'BBK', 'GULFBANK', 'INVESTBANK', 'BATICO'],
    majorIndustries: ['Banking', 'Investment', 'Aluminum', 'Insurance', 'Real Estate'],
    emergingMarket: true,
    volatility: 0.030,
    networkLatency: 110,
    rateLimit: 28,
    reliability: 0.92,
    delay: 11
  },
  {
    id: 'qse',
    name: 'Qatar Stock Exchange (QSE)',
    currency: 'QAR',
    timezone: 'Asia/Qatar',
    tradingHours: {
      open: '09:30',
      close: '13:30',
      timezone: 'Asia/Qatar'
    },
    marketCap: 180000000000, // $180 billion
    majorStocks: ['QNBK', 'INDQ', 'QGBC', 'AKHB', 'DOMAN'],
    majorIndustries: ['Banking', 'Real Estate', 'Telecommunications', 'Energy', 'Transportation'],
    emergingMarket: true,
    volatility: 0.026,
    networkLatency: 105,
    rateLimit: 32,
    reliability: 0.93,
    delay: 10
  },
  {
    id: 'mse',
    name: 'Muscat Securities Market (MSM)',
    currency: 'OMR',
    timezone: 'Asia/Muscat',
    tradingHours: {
      open: '10:00',
      close: '13:30',
      timezone: 'Asia/Muscat'
    },
    marketCap: 65000000000, // $65 billion
    majorStocks: ['BK', 'GHB', 'OMANTEL', 'BANKMUSCAT', 'DHOFAR'],
    majorIndustries: ['Banking', 'Real Estate', 'Telecommunications', 'Energy', 'Consumer Goods'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 115,
    rateLimit: 26,
    reliability: 0.91,
    delay: 11
  }
];

export const OCEANIC_MARKETS: MarketConfig[] = [
  {
    id: 'asx',
    name: 'Australian Securities Exchange (ASX)',
    currency: 'AUD',
    timezone: 'Australia/Sydney',
    tradingHours: {
      open: '10:00',
      close: '16:00',
      timezone: 'Australia/Sydney'
    },
    marketCap: 1800000000000, // $1.8 trillion
    majorStocks: ['BHP', 'CBA', 'CSL', 'WBC', 'MQG'],
    majorIndustries: ['Mining', 'Banking', 'Healthcare', 'Financial Services', 'Real Estate'],
    emergingMarket: false,
    volatility: 0.018,
    networkLatency: 150,
    rateLimit: 35,
    reliability: 0.96,
    delay: 15
  },
  {
    id: 'nzx',
    name: 'New Zealand Exchange (NZX)',
    currency: 'NZD',
    timezone: 'Pacific/Auckland',
    tradingHours: {
      open: '10:00',
      close: '17:00',
      timezone: 'Pacific/Auckland'
    },
    marketCap: 85000000000, // $85 billion
    majorStocks: ['FPH', 'CEN', 'AIA', 'MFT', 'AIR'],
    majorIndustries: ['Telecommunications', 'Energy', 'Banking', 'Real Estate', 'Infrastructure'],
    emergingMarket: false,
    volatility: 0.020,
    networkLatency: 180,
    rateLimit: 30,
    reliability: 0.94,
    delay: 18
  },
  {
    id: 'spse',
    name: 'South Pacific Stock Exchange (SPSE)',
    currency: 'FJD',
    timezone: 'Pacific/Fiji',
    tradingHours: {
      open: '10:30',
      close: '14:30',
      timezone: 'Pacific/Fiji'
    },
    marketCap: 2000000000, // $2 billion
    majorStocks: ['FBC', 'HFL', 'CPL', 'SPX', 'RTD'],
    majorIndustries: ['Banking', 'Investment', 'Telecommunications', 'Retail', 'Manufacturing'],
    emergingMarket: true,
    volatility: 0.035,
    networkLatency: 300,
    rateLimit: 15,
    reliability: 0.80,
    delay: 30
  },
  {
    id: 'pse',
    name: 'Port Moresby Stock Exchange (POMSoX)',
    currency: 'PGK',
    timezone: 'Pacific/Port_Moresby',
    tradingHours: {
      open: '10:00',
      close: '14:00',
      timezone: 'Pacific/Port_Moresby'
    },
    marketCap: 1500000000, // $1.5 billion
    majorStocks: ['CPL', 'KSL', 'NIO', 'SPC', 'BSP'],
    majorIndustries: ['Banking', 'Telecommunications', 'Mining', 'Retail', 'Agriculture'],
    emergingMarket: true,
    volatility: 0.040,
    networkLatency: 320,
    rateLimit: 12,
    reliability: 0.78,
    delay: 32
  }
];

export const AMERICAN_MARKETS: MarketConfig[] = [
  {
    id: 'nyse',
    name: 'New York Stock Exchange (NYSE)',
    currency: 'USD',
    timezone: 'America/New_York',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'America/New_York'
    },
    marketCap: 25000000000000, // $25 trillion
    majorStocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
    majorIndustries: ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'],
    emergingMarket: false,
    volatility: 0.012,
    networkLatency: 25,
    rateLimit: 65,
    reliability: 0.99,
    delay: 3
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ Stock Exchange',
    currency: 'USD',
    timezone: 'America/New_York',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'America/New_York'
    },
    marketCap: 22000000000000, // $22 trillion
    majorStocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'],
    majorIndustries: ['Technology', 'Internet', 'Biotechnology', 'Software', 'Semiconductors'],
    emergingMarket: false,
    volatility: 0.015,
    networkLatency: 22,
    rateLimit: 70,
    reliability: 0.99,
    delay: 2
  },
  {
    id: 'cme',
    name: 'Chicago Mercantile Exchange (CME)',
    currency: 'USD',
    timezone: 'America/Chicago',
    tradingHours: {
      open: '00:00',
      close: '23:59',
      timezone: 'America/Chicago'
    },
    marketCap: 65000000000, // $65 billion
    majorStocks: ['CME', 'CBOT', 'NYMEX', 'COMEX'],
    majorIndustries: ['Derivatives', 'Futures', 'Options', 'Commodities'],
    emergingMarket: false,
    volatility: 0.008,
    networkLatency: 15,
    rateLimit: 80,
    reliability: 0.995,
    delay: 1
  },
  {
    id: 'tsx',
    name: 'Toronto Stock Exchange (TSX)',
    currency: 'CAD',
    timezone: 'America/Toronto',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'America/Toronto'
    },
    marketCap: 3200000000000, // $3.2 trillion
    majorStocks: ['RY', 'TD', 'BNS', 'BMO', 'CNQ'],
    majorIndustries: ['Banking', 'Energy', 'Mining', 'Telecommunications', 'Real Estate'],
    emergingMarket: false,
    volatility: 0.014,
    networkLatency: 35,
    rateLimit: 50,
    reliability: 0.98,
    delay: 5
  },
  {
    id: 'bmv',
    name: 'Mexican Stock Exchange (BMV)',
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    tradingHours: {
      open: '08:30',
      close: '15:00',
      timezone: 'America/Mexico_City'
    },
    marketCap: 620000000000, // $620 billion
    majorStocks: ['AMX', 'CEMEXCPO', 'GFNORTEO', 'WALMEX', 'KOFUBL'],
    majorIndustries: ['Telecommunications', 'Construction', 'Banking', 'Retail', 'Beverages'],
    emergingMarket: true,
    volatility: 0.022,
    networkLatency: 80,
    rateLimit: 35,
    reliability: 0.95,
    delay: 10
  },
  {
    id: 'b3',
    name: 'Brazil Stock Exchange (B3)',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    tradingHours: {
      open: '10:00',
      close: '17:00',
      timezone: 'America/Sao_Paulo'
    },
    marketCap: 1200000000000, // $1.2 trillion
    majorStocks: ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3'],
    majorIndustries: ['Energy', 'Mining', 'Banking', 'Consumer Goods', 'Telecommunications'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 120,
    rateLimit: 30,
    reliability: 0.92,
    delay: 12
  },
  {
    id: 'bca',
    name: 'Buenos Aires Stock Exchange (BCBA)',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
    tradingHours: {
      open: '11:00',
      close: '17:00',
      timezone: 'America/Argentina/Buenos_Aires'
    },
    marketCap: 45000000000, // $45 billion
    majorStocks: ['YPFD', 'BMA', 'GGAL', 'TECO2', 'PAMP'],
    majorIndustries: ['Energy', 'Banking', 'Telecommunications', 'Mining', 'Agriculture'],
    emergingMarket: true,
    volatility: 0.035,
    networkLatency: 150,
    rateLimit: 25,
    reliability: 0.90,
    delay: 15
  },
  {
    id: 'bmv',
    name: 'Mexican Stock Exchange (BMV)',
    currency: 'MXN',
    timezone: 'America/Mexico_City',
    tradingHours: {
      open: '08:30',
      close: '15:00',
      timezone: 'America/Mexico_City'
    },
    marketCap: 620000000000, // $620 billion
    majorStocks: ['AMX', 'WALMEX', 'CEMEXCPO', 'GFNORTEO', 'KIMBERA'],
    majorIndustries: ['Telecommunications', 'Retail', 'Construction', 'Banking', 'Mining'],
    emergingMarket: true,
    volatility: 0.022,
    networkLatency: 80,
    rateLimit: 35,
    reliability: 0.94,
    delay: 10
  },
  {
    id: 'b3',
    name: 'Brazilian Stock Exchange (B3)',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    tradingHours: {
      open: '10:00',
      close: '17:00',
      timezone: 'America/Sao_Paulo'
    },
    marketCap: 1200000000000, // $1.2 trillion
    majorStocks: ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'ABEV3'],
    majorIndustries: ['Mining', 'Energy', 'Banking', 'Banking', 'Beverages'],
    emergingMarket: true,
    volatility: 0.028,
    networkLatency: 120,
    rateLimit: 30,
    reliability: 0.92,
    delay: 12
  },
  {
    id: 'bvc',
    name: 'Colombian Stock Exchange (BVC)',
    currency: 'COP',
    timezone: 'America/Bogota',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'America/Bogota'
    },
    marketCap: 180000000000, // $180 billion
    majorStocks: ['ECOPETROL', 'BOGOTA', 'GRUPOARGOS', 'ISA', 'BANCOLOMBIA'],
    majorIndustries: ['Energy', 'Financial Services', 'Construction', 'Utilities', 'Banking'],
    emergingMarket: true,
    volatility: 0.025,
    networkLatency: 100,
    rateLimit: 28,
    reliability: 0.93,
    delay: 11
  },
  {
    id: 'bvl',
    name: 'Lima Stock Exchange (BVL)',
    currency: 'PEN',
    timezone: 'America/Lima',
    tradingHours: {
      open: '09:00',
      close: '16:00',
      timezone: 'America/Lima'
    },
    marketCap: 150000000000, // $150 billion
    majorStocks: ['CREDICORP', 'BUENAVEN', 'SOUTHERN', 'AAL', 'LAMCORP'],
    majorIndustries: ['Banking', 'Real Estate', 'Mining', 'Mining', 'Financial Services'],
    emergingMarket: true,
    volatility: 0.024,
    networkLatency: 110,
    rateLimit: 26,
    reliability: 0.92,
    delay: 12
  },
  {
    id: 'bcs',
    name: 'Santiago Stock Exchange (BCS)',
    currency: 'CLP',
    timezone: 'America/Santiago',
    tradingHours: {
      open: '09:30',
      close: '16:00',
      timezone: 'America/Santiago'
    },
    marketCap: 280000000000, // $280 billion
    majorStocks: ['COPEC', 'ENELAM', 'SQM', 'CENCOSUD', 'LAN'],
    majorIndustries: ['Energy', 'Utilities', 'Mining', 'Retail', 'Airlines'],
    emergingMarket: true,
    volatility: 0.020,
    networkLatency: 95,
    rateLimit: 32,
    reliability: 0.95,
    delay: 10
  }
];

export const GLOBAL_MARKETS = [
  ...ASIAN_MARKETS,
  ...EUROPEAN_MARKETS,
  ...AMERICAN_MARKETS,
  ...AFRICAN_MARKETS,
  ...MIDDLE_EASTERN_MARKETS,
  ...OCEANIC_MARKETS
];

export function getMarketConfig(marketId: string): MarketConfig | undefined {
  return GLOBAL_MARKETS.find(market => market.id === marketId);
}

export function getAllMarketConfigs(): MarketConfig[] {
  return GLOBAL_MARKETS;
}

export function getEmergingMarkets(): MarketConfig[] {
  return GLOBAL_MARKETS.filter(market => market.emergingMarket);
}

export function getMarketByTimezone(timezone: string): MarketConfig[] {
  return GLOBAL_MARKETS.filter(market => market.timezone === timezone);
}

export function getMarketsByRegion(region: 'asia' | 'europe' | 'americas' | 'africa' | 'middle-east' | 'oceania' | 'all'): MarketConfig[] {
  switch (region) {
    case 'asia':
      return ASIAN_MARKETS;
    case 'europe':
      return EUROPEAN_MARKETS;
    case 'americas':
      return AMERICAN_MARKETS;
    case 'africa':
      return AFRICAN_MARKETS;
    case 'middle-east':
      return MIDDLE_EASTERN_MARKETS;
    case 'oceania':
      return OCEANIC_MARKETS;
    case 'all':
      return GLOBAL_MARKETS;
    default:
      return GLOBAL_MARKETS;
  }
}

export function getAsianMarkets(): MarketConfig[] {
  return ASIAN_MARKETS;
}

export function getEuropeanMarkets(): MarketConfig[] {
  return EUROPEAN_MARKETS;
}

export function getAmericanMarkets(): MarketConfig[] {
  return AMERICAN_MARKETS;
}

export function getAfricanMarkets(): MarketConfig[] {
  return AFRICAN_MARKETS;
}

export function getMiddleEasternMarkets(): MarketConfig[] {
  return MIDDLE_EASTERN_MARKETS;
}

export function getOceanicMarkets(): MarketConfig[] {
  return OCEANIC_MARKETS;
}
