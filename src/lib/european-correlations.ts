export interface EuropeanMarketCorrelation {
  market1: string;
  market2: string;
  correlation: number;
  strength: 'weak' | 'moderate' | 'strong';
  description: string;
  sector?: string;
}

export interface CrossContinentalCorrelation {
  market1: string;
  market2: string;
  correlation: number;
  strength: 'weak' | 'moderate' | 'strong';
  description: string;
  timeOverlap: number; // hours of trading session overlap
}

export const EUROPEAN_MARKET_CORRELATIONS: EuropeanMarketCorrelation[] = [
  // Strong European correlations
  {
    market1: 'london',
    market2: 'euronext',
    correlation: 0.85,
    strength: 'strong',
    description: 'High correlation between London and Euronext markets',
    sector: 'Financial Services'
  },
  {
    market1: 'london',
    market2: 'xetra',
    correlation: 0.78,
    strength: 'strong',
    description: 'Strong correlation between UK and German markets',
    sector: 'Industrial'
  },
  {
    market1: 'euronext',
    market2: 'xetra',
    correlation: 0.82,
    strength: 'strong',
    description: 'Very strong correlation between Eurozone markets',
    sector: 'Eurozone Core'
  },
  {
    market1: 'six',
    market2: 'xetra',
    correlation: 0.75,
    strength: 'moderate',
    description: 'Strong correlation between Swiss and German markets',
    sector: 'Pharmaceuticals'
  },
  {
    market1: 'london',
    market2: 'six',
    correlation: 0.68,
    strength: 'moderate',
    description: 'Moderate correlation between UK and Swiss markets',
    sector: 'Financial Services'
  },
  
  // Moderate European correlations
  {
    market1: 'london',
    market2: 'bme',
    correlation: 0.62,
    strength: 'moderate',
    description: 'Moderate correlation between UK and Spanish markets',
    sector: 'Utilities'
  },
  {
    market1: 'euronext',
    market2: 'bme',
    correlation: 0.71,
    strength: 'moderate',
    description: 'Good correlation between French and Spanish markets',
    sector: 'Eurozone Peripheral'
  },
  {
    market1: 'xetra',
    market2: 'bme',
    correlation: 0.58,
    strength: 'moderate',
    description: 'Moderate correlation between German and Spanish markets',
    sector: 'Industrial'
  },
  {
    market1: 'six',
    market2: 'euronext',
    correlation: 0.64,
    strength: 'moderate',
    description: 'Moderate correlation between Swiss and French markets',
    sector: 'Consumer Goods'
  },
  {
    market1: 'london',
    market2: 'nasdaq-nordic',
    correlation: 0.55,
    strength: 'moderate',
    description: 'Moderate correlation between UK and Nordic markets',
    sector: 'Technology'
  },
  
  // Nordic correlations
  {
    market1: 'nasdaq-nordic',
    market2: 'oslo',
    correlation: 0.73,
    strength: 'moderate',
    description: 'Strong correlation between Nordic markets',
    sector: 'Energy'
  },
  {
    market1: 'nasdaq-nordic',
    market2: 'xetra',
    correlation: 0.48,
    strength: 'weak',
    description: 'Weak correlation between Nordic and German markets',
    sector: 'Industrial'
  },
  {
    market1: 'oslo',
    market2: 'london',
    correlation: 0.42,
    strength: 'weak',
    description: 'Weak correlation between Norwegian and UK markets',
    sector: 'Energy'
  }
];

export const CROSS_CONTINENTAL_CORRELATIONS: CrossContinentalCorrelation[] = [
  // Europe-Asia correlations
  {
    market1: 'london',
    market2: 'india',
    correlation: 0.45,
    strength: 'weak',
    description: 'Weak correlation due to historical ties and time zone overlap',
    timeOverlap: 1.5
  },
  {
    market1: 'euronext',
    market2: 'japan',
    correlation: 0.38,
    strength: 'weak',
    description: 'Weak correlation between European and Japanese markets',
    timeOverlap: 2
  },
  {
    market1: 'xetra',
    market2: 'china',
    correlation: 0.42,
    strength: 'weak',
    description: 'Weak correlation between German and Chinese markets',
    timeOverlap: 1
  },
  {
    market1: 'six',
    market2: 'singapore',
    correlation: 0.55,
    strength: 'moderate',
    description: 'Moderate correlation due to financial hub status',
    timeOverlap: 3
  },
  {
    market1: 'london',
    market2: 'hongkong',
    correlation: 0.48,
    strength: 'weak',
    description: 'Weak correlation between major financial hubs',
    timeOverlap: 1
  },
  
  // Europe-Asia specific correlations
  {
    market1: 'euronext',
    market2: 'india',
    correlation: 0.35,
    strength: 'weak',
    description: 'Weak correlation between European and Indian markets',
    timeOverlap: 2.5
  },
  {
    market1: 'xetra',
    market2: 'korea',
    correlation: 0.41,
    strength: 'weak',
    description: 'Weak correlation between German and Korean markets',
    timeOverlap: 1.5
  },
  {
    market1: 'six',
    market2: 'japan',
    correlation: 0.39,
    strength: 'weak',
    description: 'Weak correlation between Swiss and Japanese markets',
    timeOverlap: 2
  },
  
  // Stronger cross-continental correlations
  {
    market1: 'london',
    market2: 'singapore',
    correlation: 0.52,
    strength: 'moderate',
    description: 'Moderate correlation due to financial services sector',
    timeOverlap: 3
  },
  {
    market1: 'euronext',
    market2: 'hongkong',
    correlation: 0.44,
    strength: 'weak',
    description: 'Weak correlation between European and Asian markets',
    timeOverlap: 1
  }
];

export interface CorrelationMatrix {
  [market1: string]: {
    [market2: string]: number;
  };
}

export function getCorrelationMatrix(): CorrelationMatrix {
  const matrix: CorrelationMatrix = {};
  const allMarkets = ['london', 'euronext', 'xetra', 'six', 'bme', 'nasdaq-nordic', 'oslo', 'india', 'japan', 'china', 'hongkong', 'singapore', 'korea'];
  
  // Initialize matrix with 1.0 for same markets
  allMarkets.forEach(market1 => {
    matrix[market1] = {};
    allMarkets.forEach(market2 => {
      if (market1 === market2) {
        matrix[market1][market2] = 1.0;
      } else {
        matrix[market1][market2] = 0.0;
      }
    });
  });
  
  // Fill in European correlations
  EUROPEAN_MARKET_CORRELATIONS.forEach(corr => {
    matrix[corr.market1][corr.market2] = corr.correlation;
    matrix[corr.market2][corr.market1] = corr.correlation;
  });
  
  // Fill in cross-continental correlations
  CROSS_CONTINENTAL_CORRELATIONS.forEach(corr => {
    matrix[corr.market1][corr.market2] = corr.correlation;
    matrix[corr.market2][corr.market1] = corr.correlation;
  });
  
  return matrix;
}

export function getCorrelationsByMarket(marketId: string): EuropeanMarketCorrelation[] {
  return EUROPEAN_MARKET_CORRELATIONS.filter(
    corr => corr.market1 === marketId || corr.market2 === marketId
  );
}

export function getCrossContinentalCorrelationsByMarket(marketId: string): CrossContinentalCorrelation[] {
  return CROSS_CONTINENTAL_CORRELATIONS.filter(
    corr => corr.market1 === marketId || corr.market2 === marketId
  );
}

export function getStrongestCorrelations(marketId: string, limit: number = 5): EuropeanMarketCorrelation[] {
  return getCorrelationsByMarket(marketId)
    .sort((a, b) => b.correlation - a.correlation)
    .slice(0, limit);
}

export function getWeakestCorrelations(marketId: string, limit: number = 5): EuropeanMarketCorrelation[] {
  return getCorrelationsByMarket(marketId)
    .sort((a, b) => a.correlation - b.correlation)
    .slice(0, limit);
}

export function getAverageCorrelationForMarket(marketId: string): number {
  const correlations = getCorrelationsByMarket(marketId);
  if (correlations.length === 0) return 0;
  
  const sum = correlations.reduce((acc, corr) => acc + corr.correlation, 0);
  return sum / correlations.length;
}

export function getCorrelationStrength(correlation: number): 'weak' | 'moderate' | 'strong' {
  if (correlation >= 0.7) return 'strong';
  if (correlation >= 0.4) return 'moderate';
  return 'weak';
}

export function getCorrelationColor(correlation: number): string {
  if (correlation >= 0.7) return 'text-green-600';
  if (correlation >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

export function getMarketPairName(market1: string, market2: string): string {
  const marketNames: {[key: string]: string} = {
    'london': 'London',
    'euronext': 'Euronext',
    'xetra': 'Xetra',
    'six': 'SIX',
    'bme': 'BME',
    'nasdaq-nordic': 'Nasdaq Nordic',
    'oslo': 'Oslo',
    'india': 'India',
    'japan': 'Japan',
    'china': 'China',
    'hongkong': 'Hong Kong',
    'singapore': 'Singapore',
    'korea': 'Korea'
  };
  
  return `${marketNames[market1] || market1} - ${marketNames[market2] || market2}`;
}