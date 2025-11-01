'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnhancedWebSocket } from '@/hooks/useEnhancedWebSocket';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Clock, 
  DollarSign,
  BarChart3,
  Newspaper,
  Zap,
  RefreshCw,
  Signal,
  SignalHigh,
  SignalLow,
  Wifi,
  WifiOff,
  Eye,
  EyeOff
} from 'lucide-react';

interface MarketOverviewProps {
  data: Map<string, any>;
  title: string;
  type: 'market' | 'stock';
}

function MarketOverview({ data, title, type }: MarketOverviewProps) {
  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPercent = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          Real-time {type} data with live updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.from(data.values()).map((item: any) => (
            <div key={item.market || item.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-100">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">{item.market || item.symbol}</div>
                  <div className="text-sm text-gray-500">
                    {type === 'market' ? item.status : item.market}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-semibold">
                  {type === 'market' ? item.index.toFixed(2) : item.price.toFixed(2)}
                </div>
                <div className="flex items-center gap-1">
                  {item.changePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-sm ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(item.changePercent)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Vol: {formatNumber(item.volume)}
                </div>
              </div>
            </div>
          ))}
          
          {data.size === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No {type} data available</p>
              <p className="text-sm">Connect to start receiving real-time data</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface TechnicalIndicatorsProps {
  data: Map<string, any[]>;
}

function TechnicalIndicators({ data }: TechnicalIndicatorsProps) {
  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-600 bg-green-100';
      case 'sell': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-3 w-3" />;
      case 'sell': return <TrendingDown className="h-3 w-3" />;
      default: return <BarChart3 className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Technical Indicators
        </CardTitle>
        <CardDescription>
          Real-time technical analysis and trading signals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Array.from(data.entries()).map(([symbol, indicators]) => (
            <div key={symbol} className="border rounded-lg p-4">
              <div className="font-semibold mb-3">{symbol}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {indicators.map((indicator: any) => (
                  <div key={indicator.indicator} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getSignalIcon(indicator.signal)}
                      <span className="text-sm font-medium">{indicator.indicator}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{indicator.value.toFixed(2)}</div>
                      <Badge variant="outline" className={getSignalColor(indicator.signal)}>
                        {indicator.signal.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {data.size === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No technical indicators available</p>
              <p className="text-sm">Subscribe to symbols to see technical analysis</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MarketNewsProps {
  news: any[];
}

function MarketNewsComponent({ news }: MarketNewsProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Market News
        </CardTitle>
        <CardDescription>
          Real-time market news and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {news.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-600 mb-2">{item.content}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 ml-4">
                  <Badge variant="outline" className={getSentimentColor(item.sentiment)}>
                    {item.sentiment}
                  </Badge>
                  <Badge variant="outline" className={getImpactColor(item.impact)}>
                    {item.impact}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {item.symbols.map((symbol: string) => (
                  <Badge key={symbol} variant="secondary" className="text-xs">
                    {symbol}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          {news.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Newspaper className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No market news available</p>
              <p className="text-sm">Subscribe to news feed for updates</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ConnectionStatusProps {
  connected: boolean;
  stats: any;
  onSubscribe: () => void;
  onUnsubscribe: () => void;
}

function ConnectionStatus({ connected, stats, onSubscribe, onUnsubscribe }: ConnectionStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connected ? <SignalHigh className="h-5 w-5 text-green-600" /> : <SignalLow className="h-5 w-5 text-red-600" />}
          Connection Status
        </CardTitle>
        <CardDescription>
          WebSocket connection and subscription status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">Disconnected</span>
                </>
              )}
            </div>
            <Badge variant={connected ? "default" : "secondary"}>
              {connected ? "Live" : "Offline"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Subscriptions:</span>
              <span className="font-medium ml-1">{stats.subscriptions}</span>
            </div>
            <div>
              <span className="text-gray-500">Last Update:</span>
              <span className="font-medium ml-1">
                {new Date(stats.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onSubscribe} 
              disabled={!connected}
              size="sm"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Subscribe
            </Button>
            <Button 
              onClick={onUnsubscribe} 
              disabled={!connected}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Unsubscribe
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RealTimeMarketDashboard() {
  const {
    connected,
    marketData,
    stockData,
    technicalIndicators,
    marketNews,
    getConnectionStats,
    subscribeToMarket,
    subscribeToStocks,
    subscribeToTechnical,
    subscribeToNews,
    unsubscribeFromMarket,
    unsubscribeFromStocks,
    unsubscribeFromTechnical,
    unsubscribeFromNews
  } = useEnhancedWebSocket();

  const [stats, setStats] = useState(getConnectionStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getConnectionStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [getConnectionStats]);

  const handleSubscribe = () => {
    // Subscribe to sample data
    subscribeToMarket('NYSE', { includeDepth: true, includeNews: true });
    subscribeToStocks(['AAPL', 'GOOGL', 'MSFT'], { includeTechnical: true, includeDepth: true });
    subscribeToTechnical(['AAPL', 'GOOGL', 'MSFT'], ['RSI', 'MACD', 'SMA']);
    subscribeToNews({ symbols: ['AAPL', 'GOOGL', 'MSFT'] });
  };

  const handleUnsubscribe = () => {
    unsubscribeFromMarket('NYSE');
    unsubscribeFromStocks(['AAPL', 'GOOGL', 'MSFT']);
    unsubscribeFromTechnical(['AAPL', 'GOOGL', 'MSFT']);
    unsubscribeFromNews();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Market Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Live market data with enhanced WebSocket streaming
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "default" : "secondary"}>
            {connected ? "Live Data" : "Offline"}
          </Badge>
          {connected && (
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-sm text-green-600">Real-time</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ConnectionStatus
              connected={connected}
              stats={stats}
              onSubscribe={handleSubscribe}
              onUnsubscribe={handleUnsubscribe}
            />
            <MarketNewsComponent news={marketNews} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Statistics
                </CardTitle>
                <CardDescription>
                  Real-time platform metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active Markets</span>
                    <span className="font-semibold">{marketData.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active Stocks</span>
                    <span className="font-semibold">{stockData.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">News Articles</span>
                    <span className="font-semibold">{marketNews.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Technical Indicators</span>
                    <span className="font-semibold">{technicalIndicators.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Update Frequency</span>
                    <span className="font-semibold">1M+/sec</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="markets" className="space-y-4">
          <MarketOverview data={marketData} title="Global Markets" type="market" />
        </TabsContent>

        <TabsContent value="stocks" className="space-y-4">
          <MarketOverview data={stockData} title="Stock Prices" type="stock" />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <TechnicalIndicators data={technicalIndicators} />
        </TabsContent>
      </Tabs>
    </div>
  );
}