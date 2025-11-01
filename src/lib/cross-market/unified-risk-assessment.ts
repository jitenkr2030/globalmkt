import { MarketAdapter } from '../adapters/market-adapter';

export interface RiskMetrics {
  market: string;
  volatility: number;
  var95: number; // Value at Risk 95%
  var99: number; // Value at Risk 99%
  expectedShortfall: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  liquidityRisk: number;
  creditRisk: number;
  operationalRisk: number;
  marketRisk: number;
  overallRisk: number;
  lastUpdate: Date;
}

export interface RegionalRisk {
  region: string;
  markets: string[];
  aggregatedVolatility: number;
  systemicRisk: number;
  contagionRisk: number;
  correlationRisk: number;
  liquidityRisk: number;
  sovereignRisk: number;
  currencyRisk: number;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  keyRiskFactors: string[];
  mitigationStrategies: string[];
  lastUpdate: Date;
}

export interface HedgingRecommendation {
  id: string;
  strategy: 'pairs_hedging' | 'options_hedging' | 'futures_hedging' | 'cross_asset_hedging' | 'volatility_hedging';
  markets: string[];
  hedgeRatio: number;
  expectedCost: number;
  riskReduction: number;
  effectiveness: number;
  timeframe: string;
  description: string;
  implementation: string;
  monitoring: string[];
  riskFactors: string[];
}

export class UnifiedRiskAssessment {
  private marketAdapters: Map<string, MarketAdapter>;
  private riskMetricsCache: Map<string, RiskMetrics>;

  constructor() {
    this.marketAdapters = new Map();
    this.riskMetricsCache = new Map();
  }

  addMarketAdapter(marketId: string, adapter: MarketAdapter): void {
    this.marketAdapters.set(marketId, adapter);
  }

  async calculateMultiMarketRiskMetrics(timeframe: string = '1d'): Promise<RiskMetrics[]> {
    const markets = Array.from(this.marketAdapters.keys());
    const riskMetrics: RiskMetrics[] = [];

    for (const market of markets) {
      try {
        const metrics = await this.calculateMarketRiskMetrics(market, timeframe);
        riskMetrics.push(metrics);
      } catch (error) {
        console.warn(`Failed to calculate risk metrics for market ${market}:`, error);
      }
    }

    return riskMetrics.sort((a, b) => b.overallRisk - a.overallRisk);
  }

  async aggregateRegionalRisk(region: string, marketIds: string[]): Promise<RegionalRisk> {
    const marketRisks = await Promise.all(
      marketIds.map(async (marketId) => {
        try {
          return await this.calculateMarketRiskMetrics(marketId, '1d');
        } catch (error) {
          console.warn(`Failed to get risk metrics for market ${marketId}:`, error);
          return null;
        }
      })
    ).then(results => results.filter(Boolean) as RiskMetrics[]);

    if (marketRisks.length === 0) {
      throw new Error(`No risk data available for region ${region}`);
    }

    // Calculate aggregated metrics
    const aggregatedVolatility = this.calculateWeightedAverage(
      marketRisks.map(r => r.volatility),
      marketRisks.map(r => this.getMarketWeight(r.market))
    );

    const systemicRisk = this.calculateSystemicRisk(marketRisks);
    const contagionRisk = this.calculateContagionRisk(marketRisks);
    const correlationRisk = this.calculateCorrelationRisk(marketRisks);
    const liquidityRisk = this.calculateWeightedAverage(
      marketRisks.map(r => r.liquidityRisk),
      marketRisks.map(r => this.getMarketWeight(r.market))
    );
    const sovereignRisk = this.calculateSovereignRisk(region, marketRisks);
    const currencyRisk = this.calculateCurrencyRisk(region, marketRisks);

    const overallRiskScore = this.calculateOverallRiskScore({
      aggregatedVolatility,
      systemicRisk,
      contagionRisk,
      correlationRisk,
      liquidityRisk,
      sovereignRisk,
      currencyRisk
    });

    const riskLevel = this.getRiskLevel(overallRiskScore);
    const keyRiskFactors = this.identifyKeyRiskFactors(marketRisks);
    const mitigationStrategies = this.generateMitigationStrategies(riskLevel, keyRiskFactors);

    return {
      region,
      markets: marketIds,
      aggregatedVolatility,
      systemicRisk,
      contagionRisk,
      correlationRisk,
      liquidityRisk,
      sovereignRisk,
      currencyRisk,
      overallRiskScore,
      riskLevel,
      keyRiskFactors,
      mitigationStrategies,
      lastUpdate: new Date()
    };
  }

  async generateCrossMarketHedgingRecommendations(timeframe: string = '1d'): Promise<HedgingRecommendation[]> {
    const markets = Array.from(this.marketAdapters.keys());
    const riskMetrics = await this.calculateMultiMarketRiskMetrics(timeframe);
    const recommendations: HedgingRecommendation[] = [];

    // Pairs Hedging
    const pairsHedging = this.generatePairsHedging(riskMetrics);
    recommendations.push(...pairsHedging);

    // Options Hedging
    const optionsHedging = this.generateOptionsHedging(riskMetrics);
    recommendations.push(...optionsHedging);

    // Futures Hedging
    const futuresHedging = this.generateFuturesHedging(riskMetrics);
    recommendations.push(...futuresHedging);

    // Cross-Asset Hedging
    const crossAssetHedging = this.generateCrossAssetHedging(riskMetrics);
    recommendations.push(...crossAssetHedging);

    // Volatility Hedging
    const volatilityHedging = this.generateVolatilityHedging(riskMetrics);
    recommendations.push(...volatilityHedging);

    return recommendations
      .filter(rec => rec.effectiveness > 0.6) // Filter by effectiveness threshold
      .sort((a, b) => b.riskReduction - a.riskReduction)
      .slice(0, 10); // Top 10 recommendations
  }

  private async calculateMarketRiskMetrics(market: string, timeframe: string): Promise<RiskMetrics> {
    const cacheKey = `${market}_${timeframe}_${Date.now()}`;
    
    if (this.riskMetricsCache.has(cacheKey)) {
      return this.riskMetricsCache.get(cacheKey)!;
    }

    try {
      const marketData = await this.marketAdapters.get(market)!.getMarketData();
      const marketFactors = this.getMarketRiskFactors(market);

      // Calculate risk metrics
      const volatility = marketData.volatility;
      const var95 = volatility * 1.65; // 95% VaR
      const var99 = volatility * 2.33; // 99% VaR
      const expectedShortfall = volatility * 2.5; // Expected Shortfall approximation
      const beta = marketFactors.beta;
      const sharpeRatio = this.calculateSharpeRatio(market, volatility);
      const maxDrawdown = this.calculateMaxDrawdown(market);
      
      // Risk category breakdown
      const liquidityRisk = marketFactors.liquidityRisk;
      const creditRisk = marketFactors.creditRisk;
      const operationalRisk = marketFactors.operationalRisk;
      const marketRisk = volatility;

      // Calculate overall risk score
      const overallRisk = this.calculateOverallRisk({
        volatility,
        liquidityRisk,
        creditRisk,
        operationalRisk,
        marketRisk
      });

      const riskMetrics: RiskMetrics = {
        market,
        volatility,
        var95,
        var99,
        expectedShortfall,
        beta,
        sharpeRatio,
        maxDrawdown,
        liquidityRisk,
        creditRisk,
        operationalRisk,
        marketRisk,
        overallRisk,
        lastUpdate: new Date()
      };

      this.riskMetricsCache.set(cacheKey, riskMetrics);
      return riskMetrics;
    } catch (error) {
      throw new Error(`Failed to calculate risk metrics for market ${market}: ${error}`);
    }
  }

  private calculateWeightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length || values.length === 0) {
      return 0;
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight === 0) return 0;

    const weightedSum = values.reduce((sum, value, index) => sum + (value * weights[index]), 0);
    return weightedSum / totalWeight;
  }

  private calculateSystemicRisk(marketRisks: RiskMetrics[]): number {
    // Systemic risk based on correlation and market size
    const avgVolatility = marketRisks.reduce((sum, r) => sum + r.volatility, 0) / marketRisks.length;
    const avgBeta = marketRisks.reduce((sum, r) => sum + r.beta, 0) / marketRisks.length;
    const correlationFactor = this.estimateMarketCorrelation(marketRisks);

    return (avgVolatility * 0.4 + avgBeta * 0.3 + correlationFactor * 0.3);
  }

  private calculateContagionRisk(marketRisks: RiskMetrics[]): number {
    // Contagion risk based on market interconnectedness
    const highRiskMarkets = marketRisks.filter(r => r.overallRisk > 0.7).length;
    const concentrationRisk = highRiskMarkets / marketRisks.length;
    
    return Math.min(1, concentrationRisk * 1.5);
  }

  private calculateCorrelationRisk(marketRisks: RiskMetrics[]): number {
    // Risk from high correlation between markets
    const correlationFactor = this.estimateMarketCorrelation(marketRisks);
    return correlationFactor * 0.8; // High correlation = higher risk
  }

  private calculateSovereignRisk(region: string, marketRisks: RiskMetrics[]): number {
    // Sovereign risk based on region and market stability
    const regionFactors: Record<string, number> = {
      'asia': 0.3,
      'southeast_asia': 0.4,
      'east_asia': 0.2,
      'south_asia': 0.6
    };

    const baseRisk = regionFactors[region] || 0.4;
    const marketStability = 1 - (marketRisks.reduce((sum, r) => sum + r.overallRisk, 0) / marketRisks.length);
    
    return Math.max(0, Math.min(1, baseRisk * (2 - marketStability)));
  }

  private calculateCurrencyRisk(region: string, marketRisks: RiskMetrics[]): number {
    // Currency risk based on region and exchange rate volatility
    const regionFactors: Record<string, number> = {
      'asia': 0.4,
      'southeast_asia': 0.3,
      'east_asia': 0.5,
      'south_asia': 0.6
    };

    const baseRisk = regionFactors[region] || 0.4;
    const avgMarketRisk = marketRisks.reduce((sum, r) => sum + r.marketRisk, 0) / marketRisks.length;
    
    return Math.max(0, Math.min(1, baseRisk * (1 + avgMarketRisk)));
  }

  private calculateOverallRiskScore(risks: {
    aggregatedVolatility: number;
    systemicRisk: number;
    contagionRisk: number;
    correlationRisk: number;
    liquidityRisk: number;
    sovereignRisk: number;
    currencyRisk: number;
  }): number {
    const weights = {
      aggregatedVolatility: 0.2,
      systemicRisk: 0.25,
      contagionRisk: 0.15,
      correlationRisk: 0.1,
      liquidityRisk: 0.1,
      sovereignRisk: 0.1,
      currencyRisk: 0.1
    };

    return (
      risks.aggregatedVolatility * weights.aggregatedVolatility +
      risks.systemicRisk * weights.systemicRisk +
      risks.contagionRisk * weights.contagionRisk +
      risks.correlationRisk * weights.correlationRisk +
      risks.liquidityRisk * weights.liquidityRisk +
      risks.sovereignRisk * weights.sovereignRisk +
      risks.currencyRisk * weights.currencyRisk
    );
  }

  private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    if (riskScore < 0.8) return 'high';
    return 'critical';
  }

  private identifyKeyRiskFactors(marketRisks: RiskMetrics[]): string[] {
    const factors = [
      'High market volatility',
      'Systemic risk exposure',
      'Liquidity constraints',
      'Credit deterioration',
      'Operational failures',
      'Currency fluctuations',
      'Sovereign debt concerns',
      'Regulatory changes',
      'Geopolitical tensions',
      'Economic slowdown'
    ];

    // Return top factors based on current risk levels
    const avgRisk = marketRisks.reduce((sum, r) => sum + r.overallRisk, 0) / marketRisks.length;
    const numFactors = Math.max(3, Math.min(6, Math.floor(avgRisk * 10)));
    
    return factors.slice(0, numFactors);
  }

  private generateMitigationStrategies(riskLevel: string, keyRiskFactors: string[]): string[] {
    const strategies: Record<string, string[]> = {
      'low': ['Maintain current positions', 'Monitor risk levels regularly'],
      'medium': ['Diversify portfolio', 'Increase hedging coverage', 'Reduce high-risk exposures'],
      'high': ['Significant portfolio rebalancing', 'Aggressive hedging strategies', 'Reduce leverage', 'Increase cash positions'],
      'critical': ['Emergency risk reduction', 'Maximize hedging', 'Consider deleveraging', 'Prepare for market stress scenarios']
    };

    return strategies[riskLevel] || strategies['medium'];
  }

  private generatePairsHedging(riskMetrics: RiskMetrics[]): HedgingRecommendation[] {
    const recommendations: HedgingRecommendation[] = [];
    
    // Find pairs with high correlation but different risk levels
    for (let i = 0; i < riskMetrics.length - 1; i++) {
      for (let j = i + 1; j < riskMetrics.length; j++) {
        const riskDiff = Math.abs(riskMetrics[i].overallRisk - riskMetrics[j].overallRisk);
        
        if (riskDiff > 0.2) { // Significant risk difference
          const highRiskMarket = riskMetrics[i].overallRisk > riskMetrics[j].overallRisk ? 
            riskMetrics[i].market : riskMetrics[j].market;
          const lowRiskMarket = riskMetrics[i].overallRisk > riskMetrics[j].overallRisk ? 
            riskMetrics[j].market : riskMetrics[i].market;

          recommendations.push({
            id: `pairs_hedge_${i}_${j}`,
            strategy: 'pairs_hedging',
            markets: [highRiskMarket, lowRiskMarket],
            hedgeRatio: 0.8,
            expectedCost: 0.5,
            riskReduction: riskDiff * 0.7,
            effectiveness: 0.75,
            timeframe: '1d',
            description: `Pairs hedging between ${highRiskMarket} (high risk) and ${lowRiskMarket} (low risk)`,
            implementation: `Long ${lowRiskMarket}, short ${highRiskMarket} with 0.8 hedge ratio`,
            monitoring: ['Correlation monitoring', 'Risk differential tracking'],
            riskFactors: ['Correlation breakdown', 'Risk convergence']
          });
        }
      }
    }

    return recommendations;
  }

  private generateOptionsHedging(riskMetrics: RiskMetrics[]): HedgingRecommendation[] {
    return riskMetrics
      .filter(r => r.overallRisk > 0.6) // High risk markets
      .map((risk, index) => ({
        id: `options_hedge_${index}`,
        strategy: 'options_hedging',
        markets: [risk.market],
        hedgeRatio: 0.6,
        expectedCost: risk.var95 * 0.1, // Cost as percentage of VaR
        riskReduction: risk.overallRisk * 0.4,
        effectiveness: 0.8,
        timeframe: '1d',
        description: `Options hedging for ${risk.market} to protect against downside risk`,
        implementation: `Purchase put options with strike price 10% below current level`,
        monitoring: ['Option premium monitoring', 'Underlying price movement'],
        riskFactors: ['Option premium cost', 'Time decay', 'Implied volatility changes']
      }));
  }

  private generateFuturesHedging(riskMetrics: RiskMetrics[]): HedgingRecommendation[] {
    return riskMetrics
      .filter(r => r.beta > 1.2 || r.beta < 0.8) // High beta markets
      .map((risk, index) => ({
        id: `futures_hedge_${index}`,
        strategy: 'futures_hedging',
        markets: [risk.market],
        hedgeRatio: Math.abs(risk.beta - 1) * 0.8,
        expectedCost: 0.3,
        riskReduction: Math.abs(risk.beta - 1) * 0.5,
        effectiveness: 0.7,
        timeframe: '1d',
        description: `Futures hedging for ${risk.market} based on beta ${risk.beta.toFixed(2)}`,
        implementation: `${risk.beta > 1 ? 'Short' : 'Long'} futures contracts to neutralize beta`,
        monitoring: ['Beta tracking', 'Futures basis risk'],
        riskFactors: ['Basis risk', 'Roll yield', 'Margin requirements']
      }));
  }

  private generateCrossAssetHedging(riskMetrics: RiskMetrics[]): HedgingRecommendation[] {
    return [
      {
        id: 'cross_asset_hedge_1',
        strategy: 'cross_asset_hedging',
        markets: riskMetrics.map(r => r.market),
        hedgeRatio: 0.5,
        expectedCost: 0.8,
        riskReduction: 0.4,
        effectiveness: 0.65,
        timeframe: '1d',
        description: 'Cross-asset hedging using currency and commodity futures',
        implementation: 'Allocate to safe-haven assets and currencies during high risk periods',
        monitoring: ['Asset correlation monitoring', 'Safe-haven asset performance'],
        riskFactors: ['Asset correlation changes', 'Liquidity constraints']
      }
    ];
  }

  private generateVolatilityHedging(riskMetrics: RiskMetrics[]): HedgingRecommendation[] {
    const highVolatilityMarkets = riskMetrics.filter(r => r.volatility > 0.25);
    
    return highVolatilityMarkets.map((risk, index) => ({
      id: `volatility_hedge_${index}`,
      strategy: 'volatility_hedging',
      markets: [risk.market],
      hedgeRatio: 0.4,
      expectedCost: risk.volatility * 0.15,
      riskReduction: risk.volatility * 0.3,
      effectiveness: 0.75,
      timeframe: '1d',
      description: `Volatility hedging for ${risk.market} with high volatility ${risk.volatility.toFixed(2)}`,
      implementation: 'Use VIX futures or volatility options to hedge against volatility spikes',
      monitoring: ['Volatility index tracking', 'Implied volatility vs realized volatility'],
      riskFactors: ['Volatility mean reversion', 'Hedge cost volatility']
    }));
  }

  private calculateSharpeRatio(market: string, volatility: number): number {
    // Simulate Sharpe ratio calculation
    const marketFactors = this.getMarketRiskFactors(market);
    const expectedReturn = marketFactors.expectedReturn;
    const riskFreeRate = 0.02; // 2% risk-free rate
    
    return volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;
  }

  private calculateMaxDrawdown(market: string): number {
    // Simulate max drawdown calculation
    const marketFactors = this.getMarketRiskFactors(market);
    return marketFactors.maxDrawdown;
  }

  private calculateOverallRisk(risks: {
    volatility: number;
    liquidityRisk: number;
    creditRisk: number;
    operationalRisk: number;
    marketRisk: number;
  }): number {
    const weights = {
      volatility: 0.3,
      liquidityRisk: 0.2,
      creditRisk: 0.15,
      operationalRisk: 0.15,
      marketRisk: 0.2
    };

    return (
      risks.volatility * weights.volatility +
      risks.liquidityRisk * weights.liquidityRisk +
      risks.creditRisk * weights.creditRisk +
      risks.operationalRisk * weights.operationalRisk +
      risks.marketRisk * weights.marketRisk
    );
  }

  private estimateMarketCorrelation(marketRisks: RiskMetrics[]): number {
    // Estimate average correlation between markets
    const avgVolatility = marketRisks.reduce((sum, r) => sum + r.volatility, 0) / marketRisks.length;
    const avgBeta = marketRisks.reduce((sum, r) => sum + r.beta, 0) / marketRisks.length;
    
    return Math.min(1, (avgVolatility * 0.5 + avgBeta * 0.3 + 0.2));
  }

  private getMarketWeight(market: string): number {
    const weights: Record<string, number> = {
      'japan': 0.25,
      'china': 0.30,
      'korea': 0.15,
      'hongkong': 0.12,
      'singapore': 0.10,
      'nepal': 0.08
    };
    return weights[market] || 0.1;
  }

  private getMarketRiskFactors(market: string) {
    const factors: Record<string, {
      beta: number;
      expectedReturn: number;
      maxDrawdown: number;
      liquidityRisk: number;
      creditRisk: number;
      operationalRisk: number;
    }> = {
      'japan': { beta: 0.8, expectedReturn: 0.06, maxDrawdown: 0.25, liquidityRisk: 0.1, creditRisk: 0.1, operationalRisk: 0.05 },
      'china': { beta: 1.2, expectedReturn: 0.09, maxDrawdown: 0.40, liquidityRisk: 0.2, creditRisk: 0.2, operationalRisk: 0.15 },
      'korea': { beta: 1.1, expectedReturn: 0.08, maxDrawdown: 0.35, liquidityRisk: 0.15, creditRisk: 0.15, operationalRisk: 0.1 },
      'hongkong': { beta: 1.3, expectedReturn: 0.10, maxDrawdown: 0.45, liquidityRisk: 0.15, creditRisk: 0.1, operationalRisk: 0.1 },
      'singapore': { beta: 0.7, expectedReturn: 0.05, maxDrawdown: 0.20, liquidityRisk: 0.05, creditRisk: 0.05, operationalRisk: 0.05 },
      'nepal': { beta: 0.9, expectedReturn: 0.07, maxDrawdown: 0.50, liquidityRisk: 0.3, creditRisk: 0.25, operationalRisk: 0.2 }
    };
    return factors[market] || factors['singapore']; // Default to Singapore factors
  }
}
