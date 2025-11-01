'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Percent,
  Clock,
  Target,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  Activity,
  Wallet,
  TrendingUp as Trend,
  Calendar,
  Filter
} from 'lucide-react';

interface PortfolioPosition {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'etf' | 'crypto' | 'forex' | 'commodity';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  weight: number;
  sector: string;
  exchange: string;
  currency: string;
  lastUpdated: string;
}

interface PortfolioSummary {
  totalValue: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  cashBalance: number;
  marginUsed: number;
  marginAvailable: number;
  buyingPower: number;
}

interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
  color: string;
  positions: number;
}

interface PerformanceMetric {
  period: string;
  return: number;
  benchmark: number;
  alpha: number;
  beta: number;
  sharpe: number;
  maxDrawdown: number;
  volatility: number;
}

interface Trade {
  id: string;
  symbol: string;
  name: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  commission: number;
  fees: number;
}

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  addedAt: string;
  alerts: {
    priceAbove?: number;
    priceBelow?: number;
    volumeAlert?: number;
  };
}

const mockPortfolioPositions: PortfolioPosition[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    type: 'stock',
    quantity: 100,
    averagePrice: 150.25,
    currentPrice: 175.80,
    totalValue: 17580.00,
    unrealizedPL: 2555.00,
    unrealizedPLPercent: 17.0,
    dayChange: 2.45,
    dayChangePercent: 1.41,
    weight: 35.2,
    sector: 'Technology',
    exchange: 'NASDAQ',
    currency: 'USD',
    lastUpdated: '2024-01-15T16:00:00Z'
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    type: 'stock',
    quantity: 50,
    averagePrice: 320.50,
    currentPrice: 378.90,
    totalValue: 18945.00,
    unrealizedPL: 2920.00,
    unrealizedPLPercent: 9.1,
    dayChange: -1.20,
    dayChangePercent: -0.32,
    weight: 37.9,
    sector: 'Technology',
    exchange: 'NASDAQ',
    currency: 'USD',
    lastUpdated: '2024-01-15T16:00:00Z'
  },
  {
    id: '3',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    type: 'stock',
    quantity: 30,
    averagePrice: 125.30,
    currentPrice: 142.75,
    totalValue: 4282.50,
    unrealizedPL: 523.50,
    unrealizedPLPercent: 4.2,
    dayChange: 3.15,
    dayChangePercent: 2.26,
    weight: 8.6,
    sector: 'Technology',
    exchange: 'NASDAQ',
    currency: 'USD',
    lastUpdated: '2024-01-15T16:00:00Z'
  },
  {
    id: '4',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 0.5,
    averagePrice: 35000.00,
    currentPrice: 42850.00,
    totalValue: 21425.00,
    unrealizedPL: 3925.00,
    unrealizedPLPercent: 22.4,
    dayChange: 1250.00,
    dayChangePercent: 3.01,
    weight: 12.8,
    sector: 'Cryptocurrency',
    exchange: 'Crypto',
    currency: 'USD',
    lastUpdated: '2024-01-15T16:00:00Z'
  },
  {
    id: '5',
    symbol: 'EUR/USD',
    name: 'Euro/US Dollar',
    type: 'forex',
    quantity: 10000,
    averagePrice: 1.0850,
    currentPrice: 1.0925,
    totalValue: 10925.00,
    unrealizedPL: 75.00,
    unrealizedPLPercent: 0.7,
    dayChange: -0.0025,
    dayChangePercent: -0.23,
    weight: 5.5,
    sector: 'Forex',
    exchange: 'Forex',
    currency: 'USD',
    lastUpdated: '2024-01-15T16:00:00Z'
  }
];

const mockPortfolioSummary: PortfolioSummary = {
  totalValue: 73157.50,
  totalUnrealizedPL: 9998.50,
  totalUnrealizedPLPercent: 15.8,
  dayChange: 6.85,
  dayChangePercent: 0.09,
  totalReturn: 12450.00,
  totalReturnPercent: 20.5,
  cashBalance: 5000.00,
  marginUsed: 2500.00,
  marginAvailable: 7500.00,
  buyingPower: 12500.00
};

const mockAssetAllocation: AssetAllocation[] = [
  { category: 'Stocks', value: 40752.50, percentage: 55.7, color: '#3B82F6', positions: 3 },
  { category: 'Cryptocurrency', value: 21425.00, percentage: 29.3, color: '#F59E0B', positions: 1 },
  { category: 'Forex', value: 10925.00, percentage: 14.9, color: '#10B981', positions: 1 },
  { category: 'Cash', value: 5000.00, percentage: 6.8, color: '#6B7280', positions: 0 }
];

const mockPerformanceMetrics: PerformanceMetric[] = [
  { period: '1D', return: 0.09, benchmark: 0.05, alpha: 0.04, beta: 0.95, sharpe: 1.2, maxDrawdown: -0.5, volatility: 0.8 },
  { period: '1W', return: 2.3, benchmark: 1.8, alpha: 0.5, beta: 0.98, sharpe: 1.8, maxDrawdown: -1.2, volatility: 2.1 },
  { period: '1M', return: 8.7, benchmark: 6.5, alpha: 2.2, beta: 1.05, sharpe: 2.4, maxDrawdown: -3.1, volatility: 5.2 },
  { period: '3M', return: 15.2, benchmark: 12.8, alpha: 2.4, beta: 1.02, sharpe: 2.1, maxDrawdown: -5.8, volatility: 8.7 },
  { period: 'YTD', return: 20.5, benchmark: 18.2, alpha: 2.3, beta: 0.99, sharpe: 2.3, maxDrawdown: -7.2, volatility: 12.4 },
  { period: '1Y', return: 28.7, benchmark: 24.5, alpha: 4.2, beta: 1.08, sharpe: 2.6, maxDrawdown: -12.1, volatility: 18.9 }
];

const mockTrades: Trade[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    action: 'buy',
    quantity: 25,
    price: 174.50,
    totalValue: 4362.50,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    commission: 1.00,
    fees: 0.50
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    action: 'sell',
    quantity: 10,
    price: 379.20,
    totalValue: 3792.00,
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed',
    commission: 1.00,
    fees: 0.50
  },
  {
    id: '3',
    symbol: 'BTC',
    name: 'Bitcoin',
    action: 'buy',
    quantity: 0.1,
    price: 42750.00,
    totalValue: 4275.00,
    timestamp: '2024-01-14T14:45:00Z',
    status: 'completed',
    commission: 5.00,
    fees: 2.50
  }
];

const mockWatchlist: WatchlistItem[] = [
  {
    id: '1',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 238.45,
    change: 5.67,
    changePercent: 2.44,
    volume: 89234000,
    marketCap: 756000000000,
    addedAt: '2024-01-10T10:00:00Z',
    alerts: { priceAbove: 250.00, priceBelow: 220.00 }
  },
  {
    id: '2',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 522.30,
    change: -2.15,
    changePercent: -0.41,
    volume: 45678000,
    marketCap: 1280000000000,
    addedAt: '2024-01-08T15:30:00Z',
    alerts: { priceAbove: 550.00 }
  },
  {
    id: '3',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2580.00,
    change: 45.50,
    changePercent: 1.80,
    volume: 15670000000,
    marketCap: 310000000000,
    addedAt: '2024-01-12T09:00:00Z',
    alerts: { priceBelow: 2400.00, volumeAlert: 20000000000 }
  }
];

export default function PortfolioManagement() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPosition, setSelectedPosition] = useState<PortfolioPosition | null>(null);
  const [timeRange, setTimeRange] = useState('1M');
  const [sortBy, setSortBy] = useState('value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (value: number) => {
    return value >= 0 ? TrendingUp : TrendingDown;
  };

  const sortedPositions = [...mockPortfolioPositions].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'symbol':
        aValue = a.symbol.localeCompare(b.symbol);
        bValue = 0;
        break;
      case 'value':
        aValue = a.totalValue;
        bValue = b.totalValue;
        break;
      case 'pl':
        aValue = a.unrealizedPL;
        bValue = b.unrealizedPL;
        break;
      case 'plPercent':
        aValue = a.unrealizedPLPercent;
        bValue = b.unrealizedPLPercent;
        break;
      case 'dayChange':
        aValue = a.dayChangePercent;
        bValue = b.dayChangePercent;
        break;
      default:
        aValue = a.totalValue;
        bValue = b.totalValue;
    }

    if (typeof aValue === 'string') return sortDirection === 'asc' ? aValue : -aValue;
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Management</h2>
          <p className="text-muted-foreground">
            Track your investments, analyze performance, and manage your portfolio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(mockPortfolioSummary.totalValue)}</p>
                <div className={`flex items-center text-sm ${getChangeColor(mockPortfolioSummary.dayChangePercent)}`}>
                  {(() => {
                    const Icon = getChangeIcon(mockPortfolioSummary.dayChangePercent);
                    return <Icon className="h-3 w-3 mr-1" />;
                  })()}
                  {formatPercent(mockPortfolioSummary.dayChangePercent)} today
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${getChangeColor(mockPortfolioSummary.totalUnrealizedPL)}`}>
                  {formatCurrency(mockPortfolioSummary.totalUnrealizedPL)}
                </p>
                <div className={`flex items-center text-sm ${getChangeColor(mockPortfolioSummary.totalUnrealizedPLPercent)}`}>
                  {(() => {
                    const Icon = getChangeIcon(mockPortfolioSummary.totalUnrealizedPLPercent);
                    return <Icon className="h-3 w-3 mr-1" />;
                  })()}
                  {formatPercent(mockPortfolioSummary.totalUnrealizedPLPercent)}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(mockPortfolioSummary.cashBalance)}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Wallet className="h-3 w-3 mr-1" />
                  Available for trading
                </div>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buying Power</p>
                <p className="text-2xl font-bold">{formatCurrency(mockPortfolioSummary.buyingPower)}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Target className="h-3 w-3 mr-1" />
                  Including margin
                </div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Asset Allocation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5" />
                  <span>Asset Allocation</span>
                </CardTitle>
                <CardDescription>Portfolio distribution by asset class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAssetAllocation.map((asset, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: asset.color }}
                        />
                        <span className="text-sm font-medium">{asset.category}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(asset.value)} ({asset.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <Progress value={asset.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className={`text-lg font-semibold ${getChangeColor(mockPortfolioSummary.totalReturnPercent)}`}>
                      {formatPercent(mockPortfolioSummary.totalReturnPercent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alpha (1Y)</p>
                    <p className="text-lg font-semibold text-green-600">
                      +{mockPerformanceMetrics.find(m => m.period === '1Y')?.alpha.toFixed(2) || '0.00'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                    <p className="text-lg font-semibold">
                      {mockPerformanceMetrics.find(m => m.period === '1Y')?.sharpe.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Beta</p>
                    <p className="text-lg font-semibold">
                      {mockPerformanceMetrics.find(m => m.period === '1Y')?.beta.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Positions */}
          <Card>
            <CardHeader>
              <CardTitle>Top Positions</CardTitle>
              <CardDescription>Your largest holdings by value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedPositions.slice(0, 5).map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {position.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">{position.symbol}</p>
                        <p className="text-sm text-muted-foreground">{position.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(position.totalValue)}</p>
                      <div className={`flex items-center text-sm ${getChangeColor(position.unrealizedPLPercent)}`}>
                        {(() => {
                          const Icon = getChangeIcon(position.unrealizedPLPercent);
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {formatPercent(position.unrealizedPLPercent)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Positions</CardTitle>
                  <CardDescription>Detailed view of your portfolio holdings</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="value">Sort by Value</option>
                    <option value="symbol">Sort by Symbol</option>
                    <option value="pl">Sort by P&L</option>
                    <option value="plPercent">Sort by P&L %</option>
                    <option value="dayChange">Sort by Day Change</option>
                  </select>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedPositions.map((position) => (
                  <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {position.symbol.substring(0, 3)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{position.symbol}</h3>
                          <Badge variant="outline">{position.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{position.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{position.quantity} shares</span>
                          <span>Avg: {formatCurrency(position.averagePrice)}</span>
                          <span>Current: {formatCurrency(position.currentPrice)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">{formatCurrency(position.totalValue)}</p>
                      <div className={`flex items-center justify-end text-sm ${getChangeColor(position.unrealizedPLPercent)}`}>
                        {(() => {
                          const Icon = getChangeIcon(position.unrealizedPLPercent);
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {formatCurrency(position.unrealizedPL)} ({formatPercent(position.unrealizedPLPercent)})
                      </div>
                      <div className={`flex items-center justify-end text-xs ${getChangeColor(position.dayChangePercent)}`}>
                        {(() => {
                          const Icon = getChangeIcon(position.dayChangePercent);
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {formatPercent(position.dayChangePercent)} today
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {mockPerformanceMetrics.map((metric) => (
              <Card key={metric.period}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.period}</CardTitle>
                  <CardDescription>Performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Return</p>
                      <p className={`font-semibold ${getChangeColor(metric.return)}`}>
                        {formatPercent(metric.return)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Benchmark</p>
                      <p className="font-semibold">{formatPercent(metric.benchmark)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Alpha</p>
                      <p className={`font-semibold ${getChangeColor(metric.alpha)}`}>
                        {formatPercent(metric.alpha)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Beta</p>
                      <p className="font-semibold">{metric.beta.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sharpe</p>
                      <p className="font-semibold">{metric.sharpe.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Max DD</p>
                      <p className="font-semibold text-red-600">
                        {formatPercent(metric.maxDrawdown)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Volatility</span>
                      <span className="font-semibold">{formatPercent(metric.volatility)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Your latest trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTrades.map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        trade.action === 'buy' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {trade.action === 'buy' ? (
                          <Plus className="h-5 w-5 text-green-600" />
                        ) : (
                          <Minus className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{trade.symbol}</h3>
                          <Badge className={trade.action === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {trade.action.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{trade.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{trade.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{trade.quantity} shares</span>
                          <span>@ {formatCurrency(trade.price)}</span>
                          <span>{new Date(trade.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(trade.totalValue)}</p>
                      <p className="text-sm text-muted-foreground">
                        Fees: {formatCurrency(trade.commission + trade.fees)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
              <CardDescription>Track your favorite instruments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWatchlist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">
                          {item.symbol.substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{item.symbol}</h3>
                          {Object.keys(item.alerts).length > 0 && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.name}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>Vol: {(item.volume / 1000000).toFixed(1)}M</span>
                          <span>MC: {formatCurrency(item.marketCap / 1000000000, '')}B</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold">{formatCurrency(item.price)}</p>
                      <div className={`flex items-center justify-end text-sm ${getChangeColor(item.changePercent)}`}>
                        {(() => {
                          const Icon = getChangeIcon(item.changePercent);
                          return <Icon className="h-3 w-3 mr-1" />;
                        })()}
                        {formatCurrency(item.change)} ({formatPercent(item.changePercent)})
                      </div>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}