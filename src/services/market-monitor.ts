export interface MarketStatus {
  market: string;
  name: string;
  status: 'open' | 'closed' | 'holiday' | 'maintenance';
  lastUpdate: string;
  uptime: number;
  latency: number;
  dataQuality: {
    completeness: number;
    accuracy: number;
    timeliness: number;
  };
  connections: {
    websocket: boolean;
    api: boolean;
    database: boolean;
  };
  alerts: MarketAlert[];
}

export interface MarketAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  market: string;
}

export interface RegionalStatus {
  region: string;
  markets: string[];
  overallStatus: 'healthy' | 'degraded' | 'critical';
  averageUptime: number;
  averageLatency: number;
  activeAlerts: number;
}

export class MarketMonitor {
  private marketStatuses: Map<string, MarketStatus> = new Map();
  private alerts: MarketAlert[] = [];
  private callbacks: Set<(status: MarketStatus) => void> = new Set();
  private regionalCallbacks: Set<(status: RegionalStatus) => void> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMarketStatuses();
    this.startMonitoring();
  }

  private initializeMarketStatuses() {
    const markets = [
      { id: 'nepal', name: 'Nepal Stock Exchange' },
      { id: 'japan', name: 'Tokyo Stock Exchange' },
      { id: 'china', name: 'Shanghai Stock Exchange' },
      { id: 'hongkong', name: 'Hong Kong Stock Exchange' },
      { id: 'singapore', name: 'Singapore Exchange' },
      { id: 'korea', name: 'Korea Exchange' }
    ];

    markets.forEach(market => {
      this.marketStatuses.set(market.id, {
        market: market.id,
        name: market.name,
        status: this.getMarketStatus(market.id),
        lastUpdate: new Date().toISOString(),
        uptime: 99.9,
        latency: Math.random() * 100 + 50, // 50-150ms
        dataQuality: {
          completeness: 95 + Math.random() * 5,
          accuracy: 92 + Math.random() * 8,
          timeliness: 88 + Math.random() * 12
        },
        connections: {
          websocket: Math.random() > 0.1,
          api: Math.random() > 0.05,
          database: Math.random() > 0.02
        },
        alerts: []
      });
    });
  }

  private getMarketStatus(marketId: string): 'open' | 'closed' | 'holiday' | 'maintenance' {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Simple logic for market status based on time
    switch (marketId) {
      case 'nepal':
        // Nepal market: 11:00-15:00 NPT (approximately 5:15-9:15 UTC)
        return hour >= 5 && hour < 9 && day >= 1 && day <= 5 ? 'open' : 'closed';
      case 'japan':
        // Japan market: 9:00-15:00 JST (approximately 0:00-6:00 UTC)
        return hour >= 0 && hour < 6 && day >= 1 && day <= 5 ? 'open' : 'closed';
      case 'china':
        // China market: 9:30-15:00 CST (approximately 1:30-7:00 UTC)
        return (hour >= 1 && hour < 2) || (hour >= 2 && hour < 7) && day >= 1 && day <= 5 ? 'open' : 'closed';
      case 'hongkong':
        // Hong Kong market: 9:30-16:00 HKT (approximately 1:30-8:00 UTC)
        return (hour >= 1 && hour < 2) || (hour >= 2 && hour < 8) && day >= 1 && day <= 5 ? 'open' : 'closed';
      case 'singapore':
        // Singapore market: 9:00-17:00 SGT (approximately 1:00-9:00 UTC)
        return hour >= 1 && hour < 9 && day >= 1 && day <= 5 ? 'open' : 'closed';
      case 'korea':
        // Korea market: 9:00-15:30 KST (approximately 0:00-6:30 UTC)
        return hour >= 0 && hour < 6 && day >= 1 && day <= 5 ? 'open' : 'closed';
      default:
        return 'closed';
    }
  }

  private startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.updateMarketStatuses();
      this.checkForAlerts();
      this.notifyCallbacks();
    }, 10000); // Update every 10 seconds
  }

  private updateMarketStatuses() {
    this.marketStatuses.forEach((status, marketId) => {
      // Update status
      status.status = this.getMarketStatus(marketId);
      status.lastUpdate = new Date().toISOString();
      
      // Simulate latency changes
      status.latency = Math.max(10, Math.min(500, status.latency + (Math.random() - 0.5) * 20));
      
      // Simulate data quality changes
      status.dataQuality.completeness = Math.max(80, Math.min(100, status.dataQuality.completeness + (Math.random() - 0.5) * 2));
      status.dataQuality.accuracy = Math.max(80, Math.min(100, status.dataQuality.accuracy + (Math.random() - 0.5) * 2));
      status.dataQuality.timeliness = Math.max(75, Math.min(100, status.dataQuality.timeliness + (Math.random() - 0.5) * 3));
      
      // Simulate connection status changes
      if (Math.random() < 0.05) { // 5% chance of connection change
        status.connections.websocket = Math.random() > 0.1;
      }
      if (Math.random() < 0.02) { // 2% chance of API change
        status.connections.api = Math.random() > 0.05;
      }
      
      // Update uptime (simulate small changes)
      status.uptime = Math.max(95, Math.min(100, status.uptime + (Math.random() - 0.5) * 0.1));
    });
  }

  private checkForAlerts() {
    this.marketStatuses.forEach((status, marketId) => {
      // Check for high latency
      if (status.latency > 300) {
        this.createAlert({
          type: 'warning',
          message: `High latency detected: ${status.latency.toFixed(0)}ms`,
          market: marketId
        });
      }
      
      // Check for low data quality
      if (status.dataQuality.completeness < 90) {
        this.createAlert({
          type: 'warning',
          message: `Low data completeness: ${status.dataQuality.completeness.toFixed(1)}%`,
          market: marketId
        });
      }
      
      // Check for connection issues
      if (!status.connections.websocket) {
        this.createAlert({
          type: 'error',
          message: 'WebSocket connection lost',
          market: marketId
        });
      }
      
      if (!status.connections.api) {
        this.createAlert({
          type: 'error',
          message: 'API connection lost',
          market: marketId
        });
      }
      
      // Check for critical latency
      if (status.latency > 500) {
        this.createAlert({
          type: 'critical',
          message: `Critical latency: ${status.latency.toFixed(0)}ms`,
          market: marketId
        });
      }
    });
  }

  private createAlert(alertData: Omit<MarketAlert, 'id' | 'timestamp' | 'resolved'>) {
    const alert: MarketAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alertData
    };
    
    this.alerts.push(alert);
    
    // Add to market status
    const marketStatus = this.marketStatuses.get(alert.market);
    if (marketStatus) {
      marketStatus.alerts.push(alert);
    }
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    
    console.log(`Alert created: ${alert.type} - ${alert.message} (${alert.market})`);
  }

  private notifyCallbacks() {
    // Notify individual market status callbacks
    this.marketStatuses.forEach(status => {
      this.callbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in market status callback:', error);
        }
      });
    });
    
    // Notify regional status callbacks
    const regionalStatuses = this.getRegionalStatuses();
    regionalStatuses.forEach(regionalStatus => {
      this.regionalCallbacks.forEach(callback => {
        try {
          callback(regionalStatus);
        } catch (error) {
          console.error('Error in regional status callback:', error);
        }
      });
    });
  }

  getMarketStatus(marketId: string): MarketStatus | undefined {
    return this.marketStatuses.get(marketId);
  }

  getAllMarketStatuses(): MarketStatus[] {
    return Array.from(this.marketStatuses.values());
  }

  getRegionalStatuses(): RegionalStatus[] {
    const regions = [
      {
        name: 'East Asia',
        markets: ['japan', 'china', 'korea', 'hongkong']
      },
      {
        name: 'Southeast Asia',
        markets: ['singapore', 'malaysia', 'thailand', 'indonesia']
      },
      {
        name: 'South Asia',
        markets: ['nepal', 'india', 'pakistan', 'bangladesh']
      }
    ];

    return regions.map(region => {
      const marketStatuses = region.markets
        .map(market => this.marketStatuses.get(market))
        .filter(Boolean) as MarketStatus[];
      
      const averageUptime = marketStatuses.reduce((sum, status) => sum + status.uptime, 0) / marketStatuses.length;
      const averageLatency = marketStatuses.reduce((sum, status) => sum + status.latency, 0) / marketStatuses.length;
      const activeAlerts = marketStatuses.reduce((sum, status) => sum + status.alerts.filter(a => !a.resolved).length, 0);
      
      let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (averageLatency > 300 || activeAlerts > 3) {
        overallStatus = 'critical';
      } else if (averageLatency > 150 || activeAlerts > 1) {
        overallStatus = 'degraded';
      }
      
      return {
        region: region.name,
        markets: region.markets,
        overallStatus,
        averageUptime,
        averageLatency,
        activeAlerts
      };
    });
  }

  getAlerts(marketId?: string): MarketAlert[] {
    if (marketId) {
      return this.alerts.filter(alert => alert.market === marketId);
    }
    return this.alerts;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      
      // Remove from market status
      const marketStatus = this.marketStatuses.get(alert.market);
      if (marketStatus) {
        marketStatus.alerts = marketStatus.alerts.filter(a => a.id !== alertId);
      }
      
      console.log(`Alert resolved: ${alert.message}`);
      return true;
    }
    return false;
  }

  subscribeToMarketStatus(callback: (status: MarketStatus) => void): () => void {
    this.callbacks.add(callback);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  subscribeToRegionalStatus(callback: (status: RegionalStatus) => void): () => void {
    this.regionalCallbacks.add(callback);
    
    return () => {
      this.regionalCallbacks.delete(callback);
    };
  }

  getSystemHealth(): {
    totalMarkets: number;
    healthyMarkets: number;
    degradedMarkets: number;
    criticalMarkets: number;
    totalAlerts: number;
    unresolvedAlerts: number;
    averageUptime: number;
    averageLatency: number;
  } {
    const statuses = Array.from(this.marketStatuses.values());
    const totalMarkets = statuses.length;
    const healthyMarkets = statuses.filter(s => s.latency <= 150 && s.alerts.filter(a => !a.resolved).length === 0).length;
    const degradedMarkets = statuses.filter(s => s.latency > 150 && s.latency <= 300 || s.alerts.filter(a => !a.resolved).length > 0 && s.alerts.filter(a => !a.resolved).length <= 3).length;
    const criticalMarkets = statuses.filter(s => s.latency > 300 || s.alerts.filter(a => !a.resolved).length > 3).length;
    
    const totalAlerts = this.alerts.length;
    const unresolvedAlerts = this.alerts.filter(a => !a.resolved).length;
    
    const averageUptime = statuses.reduce((sum, s) => sum + s.uptime, 0) / totalMarkets;
    const averageLatency = statuses.reduce((sum, s) => sum + s.latency, 0) / totalMarkets;
    
    return {
      totalMarkets,
      healthyMarkets,
      degradedMarkets,
      criticalMarkets,
      totalAlerts,
      unresolvedAlerts,
      averageUptime,
      averageLatency
    };
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Singleton instance
export const marketMonitor = new MarketMonitor();