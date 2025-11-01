import { MarketSentiment, SentimentAnalysis } from './market-sentiment';

export class HongKongMarketSentiment implements MarketSentiment {
  async getOverallSentiment(): Promise<SentimentAnalysis> {
    const now = new Date();
    const marketHash = this.hashDate(now);
    
    return {
      overall: this.generateSentimentScore(marketHash),
      foreignInvestment: this.generateSentimentScore(marketHash + 1),
      institutional: this.generateSentimentScore(marketHash + 2),
      retail: this.generateSentimentScore(marketHash + 3),
      newsSentiment: this.generateSentimentScore(marketHash + 4),
      socialMedia: this.generateSentimentScore(marketHash + 5),
      policyImpact: this.generateSentimentScore(marketHash + 6),
      lastUpdate: now,
      factors: this.getHongKongSentimentFactors(marketHash),
      recommendations: this.getHongKongRecommendations(marketHash),
      riskFactors: this.getHongKongRiskFactors(marketHash)
    };
  }

  async getStockSentiment(symbol: string): Promise<SentimentAnalysis> {
    const now = new Date();
    const stockHash = this.hashSymbol(symbol);
    
    return {
      overall: this.generateSentimentScore(stockHash),
      foreignInvestment: this.generateSentimentScore(stockHash + 1),
      institutional: this.generateSentimentScore(stockHash + 2),
      retail: this.generateSentimentScore(stockHash + 3),
      newsSentiment: this.generateSentimentScore(stockHash + 4),
      socialMedia: this.generateSentimentScore(stockHash + 5),
      policyImpact: this.generateSentimentScore(stockHash + 6),
      lastUpdate: now,
      factors: this.getStockSentimentFactors(symbol, stockHash),
      recommendations: this.getStockRecommendations(symbol, stockHash),
      riskFactors: this.getStockRiskFactors(symbol, stockHash)
    };
  }

  async getSectorSentiment(sector: string): Promise<SentimentAnalysis> {
    const now = new Date();
    const sectorHash = this.hashString(sector);
    
    return {
      overall: this.generateSentimentScore(sectorHash),
      foreignInvestment: this.generateSentimentScore(sectorHash + 1),
      institutional: this.generateSentimentScore(sectorHash + 2),
      retail: this.generateSentimentScore(sectorHash + 3),
      newsSentiment: this.generateSentimentScore(sectorHash + 4),
      socialMedia: this.generateSentimentScore(sectorHash + 5),
      policyImpact: this.generateSentimentScore(sectorHash + 6),
      lastUpdate: now,
      factors: this.getSectorSentimentFactors(sector, sectorHash),
      recommendations: this.getSectorRecommendations(sector, sectorHash),
      riskFactors: this.getSectorRiskFactors(sector, sectorHash)
    };
  }

  async getChinaInfluenceSentiment(): Promise<any> {
    const now = new Date();
    const chinaHash = this.hashDate(now);
    
    return {
      mainlandCapitalFlow: this.generateSentimentScore(chinaHash),
      shanghaiConnect: this.generateSentimentScore(chinaHash + 1),
      shenzhenConnect: this.generateSentimentScore(chinaHash + 2),
      policyAlignment: this.generateSentimentScore(chinaHash + 3),
      economicIntegration: this.generateSentimentScore(chinaHash + 4),
      lastUpdate: now,
      keyFactors: this.getChinaInfluenceFactors(chinaHash),
      outlook: this.getChinaInfluenceOutlook(chinaHash)
    };
  }

  async getInternationalSentiment(): Promise<any> {
    const now = new Date();
    const intlHash = this.hashDate(now);
    
    return {
      usMarketInfluence: this.generateSentimentScore(intlHash),
      europeanMarketInfluence: this.generateSentimentScore(intlHash + 1),
      globalRiskAppetite: this.generateSentimentScore(intlHash + 2),
      emergingMarketSentiment: this.generateSentimentScore(intlHash + 3),
      currencyImpact: this.generateSentimentScore(intlHash + 4),
      lastUpdate: now,
      keyFactors: this.getInternationalFactors(intlHash),
      outlook: this.getInternationalOutlook(intlHash)
    };
  }

  private generateSentimentScore(seed: number): number {
    return (Math.sin(seed) + 1) / 2; // Normalize to 0-1 range
  }

  private getHongKongSentimentFactors(hash: number): string[] {
    const factors = [
      '中國經濟數據 (China Economic Data)',
      '美國利率政策 (US Interest Rate Policy)',
      '港元匯率 (HKD Exchange Rate)',
      '北水南流 (Southbound Trading)',
      '地緣政治 (Geopolitical Factors)',
      '本地經濟指標 (Local Economic Indicators)',
      '樓市表現 (Property Market Performance)',
      '旅遊業復甦 (Tourism Recovery)',
      '金融市場流動性 (Financial Market Liquidity)',
      '監管環境 (Regulatory Environment)'
    ];

    return factors.slice(0, 3 + (hash % 4));
  }

  private getHongKongRecommendations(hash: number): string[] {
    const recommendations = [
      '關注中概股回歸 (Focus on Chinese Stock Returnees)',
      '布局新經濟板塊 (Position for New Economy Sectors)',
      '配置金融龍頭 (Allocate to Financial Leaders)',
      '關注消費復甦 (Focus on Consumption Recovery)',
      '把握科技機遇 (Seize Technology Opportunities)',
      '防範政策風險 (Guard Against Policy Risks)',
      '關注綠色金融 (Focus on Green Finance)',
      '布局大灣區概念 (Position for Greater Bay Area Concept)'
    ];

    return recommendations.slice(0, 2 + (hash % 3));
  }

  private getHongKongRiskFactors(hash: number): string[] {
    const risks = [
      '中美關係 (US-China Relations)',
      '中國監管政策 (China Regulatory Policies)',
      '利率上升風險 (Rising Interest Rate Risk)',
      '資金外流壓力 (Capital Outflow Pressure)',
      '地緣政治風險 (Geopolitical Risks)',
      '經濟放緩 (Economic Slowdown)',
      '樓市調整 (Property Market Adjustment)',
      '疫情反覆 (Pandemic Recurrence)'
    ];

    return risks.slice(0, 2 + (hash % 3));
  }

  private getStockSentimentFactors(symbol: string, hash: number): string[] {
    const stockFactors = [
      '盈利預期 (Earnings Expectations)',
      '行業地位 (Industry Position)',
      '中國業務佔比 (China Business Exposure)',
      '國際投資者關注 (International Investor Interest)',
      '估值水平 (Valuation Level)',
      '技術走勢 (Technical Trend)',
      '資金流向 (Capital Flow)',
      '公司治理 (Corporate Governance)'
    ];

    return stockFactors.slice(0, 2 + (hash % 3));
  }

  private getStockRecommendations(symbol: string, hash: number): string[] {
    const stockRecommendations = [
      '逢低吸納 (Accumulate on Dips)',
      '長線持有 (Long-term Hold)',
      '短線操作 (Short-term Trading)',
      '減持避險 (Reduce Position for Risk)',
      '等待突破 (Wait for Breakout)',
      '分批建倉 (Build Position Gradually)',
      '設止損位 (Set Stop Loss)',
      '鎖定利潤 (Lock in Profits)'
    ];

    return stockRecommendations.slice(0, 1 + (hash % 2));
  }

  private getStockRiskFactors(symbol: string, hash: number): string[] {
    const stockRisks = [
      '中國政策風險 (China Policy Risk)',
      '行業競爭加劇 (Intensified Industry Competition)',
      '匯率波動 (Exchange Rate Fluctuation)',
      '估值偏高 (High Valuation)',
      '流動性風險 (Liquidity Risk)',
      '管理層變動 (Management Changes)',
      '市場情緒轉變 (Market Sentiment Shift)',
      '技術性調整 (Technical Correction)'
    ];

    return stockRisks.slice(0, 1 + (hash % 2));
  }

  private getSectorSentimentFactors(sector: string, hash: number): string[] {
    const sectorFactors = [
      '行業週期 (Industry Cycle)',
      '政策支持度 (Policy Support Level)',
      '中國需求 (China Demand)',
      '國際競爭力 (International Competitiveness)',
      '技術創新 (Technological Innovation)',
      '監管環境 (Regulatory Environment)',
      '估值吸引力 (Valuation Attractiveness)',
      '資金流向 (Capital Flow Direction)'
    ];

    return sectorFactors.slice(0, 2 + (hash % 3));
  }

  private getSectorRecommendations(sector: string, hash: number): string[] {
    const sectorRecommendations = [
      '超配行業 (Overweight Sector)',
      '標配行業 (Market Weight Sector)',
      '低配行業 (Underweight Sector)',
      '關注龍頭股 (Focus on Leader Stocks)',
      '尋找錯殺機會 (Find Oversold Opportunities)',
      '等待入市時機 (Wait for Entry Timing)',
      '分散投資 (Diversified Investment)',
      '集中配置 (Concentrated Allocation)'
    ];

    return sectorRecommendations.slice(0, 1 + (hash % 2));
  }

  private getSectorRiskFactors(sector: string, hash: number): string[] {
    const sectorRisks = [
      '政策監管風險 (Policy Regulatory Risk)',
      '中國經濟放緩 (China Economic Slowdown)',
      '國際貿易摩擦 (International Trade Friction)',
      '技術替代風險 (Technology Substitution Risk)',
      '成本上升壓力 (Cost Increase Pressure)',
      '需求轉變 (Demand Shift)',
      '資金緊張 (Funding Tightness)',
      '市場飽和 (Market Saturation)'
    ];

    return sectorRisks.slice(0, 1 + (hash % 2));
  }

  private getChinaInfluenceFactors(hash: number): string[] {
    return [
      '南向資金流入 (Southbound Capital Inflow)',
      '滬港通活躍度 (Shanghai-HK Connect Activity)',
      '深港通活躍度 (Shenzhen-HK Connect Activity)',
      '中概股回歸趨勢 (Chinese Stock Return Trend)',
      '人民幣匯率走勢 (RMB Exchange Rate Trend)',
      '中國政策支持 (China Policy Support)'
    ].slice(0, 3 + (hash % 2));
  }

  private getChinaInfluenceOutlook(hash: number): string {
    const outlooks = [
      '中國影響力增強 (Increasing China Influence)',
      '資金流入持續 (Continued Capital Inflow)',
      '政策協同加強 (Strengthened Policy Coordination)',
      '經濟融合深化 (Deepening Economic Integration)',
      '市場聯動性提高 (Increased Market Correlation)'
    ];
    return outlooks[hash % outlooks.length];
  }

  private getInternationalFactors(hash: number): string[] {
    return [
      '美聯儲政策 (Fed Policy)',
      '全球市場情緒 (Global Market Sentiment)',
      '新興市場表現 (Emerging Market Performance)',
      '避險情緒 (Risk Aversion)',
      '商品價格走勢 (Commodity Price Trend)',
      '地緣政治事件 (Geopolitical Events)'
    ].slice(0, 3 + (hash % 2));
  }

  private getInternationalOutlook(hash: number): string {
    const outlooks = [
      '國際資金流入 (International Capital Inflow)',
      '全球風險偏好提升 (Improved Global Risk Appetite)',
      '美元走弱影響 (USD Weakness Impact)',
      '新興市場資金流入 (Emerging Market Capital Inflow)',
      '避險情緒上升 (Rising Risk Aversion)'
    ];
    return outlooks[hash % outlooks.length];
  }

  private hashSymbol(symbol: string): number {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = ((hash << 5) - hash) + symbol.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private hashDate(date: Date): number {
    return this.hashString(date.toISOString().split('T')[0]);
  }
}
