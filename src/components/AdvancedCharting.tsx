'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  CandlestickChart,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  LineChart as LineChartIcon,
  Candlestick,
  RefreshCw,
  Download,
  Settings,
  Maximize,
  Minimize,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Chart data types
interface ChartDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  strength: 'weak' | 'moderate' | 'strong';
}

interface ChartPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  description: string;
}

interface SupportResistance {
  support: number[];
  resistance: number[];
  currentPrice: number;
}

export default function AdvancedCharting() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [timeframe, setTimeframe] = useState('1d');
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'area' | 'volume'>('candlestick');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [patterns, setPatterns] = useState<ChartPattern[]>([]);
  const [supportResistance, setSupportResistance] = useState<SupportResistance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate mock chart data
  const generateChartData = (symbol: string, timeframe: string, points: number = 100) => {
    const data: ChartDataPoint[] = [];
    const basePrice = 100 + Math.random() * 400;
    let currentPrice = basePrice;
    
    for (let i = 0; i < points; i++) {
      const variation = (Math.random() - 0.5) * 0.02;
      currentPrice = currentPrice * (1 + variation);
      
      const volatility = 0.01;
      const high = currentPrice * (1 + Math.random() * volatility);
      const low = currentPrice * (1 - Math.random() * volatility);
      const open = i === 0 ? currentPrice : data[i - 1].close;
      const close = currentPrice;
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({
        timestamp: new Date(Date.now() - (points - i) * 60000).toISOString(),
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    return data;
  };

  // Generate technical indicators
  const generateTechnicalIndicators = (data: ChartDataPoint[]) => {
    const indicators: TechnicalIndicator[] = [
      {
        name: 'RSI (14)',
        value: 30 + Math.random() * 40,
        signal: Math.random() > 0.5 ? 'buy' : 'sell',
        strength: Math.random() > 0.7 ? 'strong' : Math.random() > 0.3 ? 'moderate' : 'weak'
      },
      {
        name: 'MACD (12,26)',
        value: (Math.random() - 0.5) * 2,
        signal: Math.random() > 0.5 ? 'buy' : 'sell',
        strength: Math.random() > 0.7 ? 'strong' : Math.random() > 0.3 ? 'moderate' : 'weak'
      },
      {
        name: 'SMA (20)',
        value: data[data.length - 1]?.close || 100,
        signal: 'hold',
        strength: 'moderate'
      },
      {
        name: 'EMA (50)',
        value: (data[data.length - 1]?.close || 100) * (1 + (Math.random() - 0.5) * 0.01),
        signal: 'hold',
        strength: 'moderate'
      },
      {
        name: 'Stochastic',
        value: Math.random() * 100,
        signal: Math.random() > 0.5 ? 'buy' : 'sell',
        strength: Math.random() > 0.7 ? 'strong' : Math.random() > 0.3 ? 'moderate' : 'weak'
      },
      {
        name: 'Bollinger Bands',
        value: 50 + Math.random() * 50,
        signal: 'hold',
        strength: 'moderate'
      }
    ];
    
    return indicators;
  };

  // Generate chart patterns
  const generateChartPatterns = () => {
    const patterns: ChartPattern[] = [
      {
        name: 'Head and Shoulders',
        type: 'bearish',
        confidence: 0.85,
        description: 'Classic reversal pattern indicating trend change'
      },
      {
        name: 'Double Bottom',
        type: 'bullish',
        confidence: 0.72,
        description: 'W-shaped pattern suggesting upward reversal'
      },
      {
        name: 'Ascending Triangle',
        type: 'bullish',
        confidence: 0.68,
        description: 'Continuation pattern with higher lows'
      },
      {
        name: 'Descending Triangle',
        type: 'bearish',
        confidence: 0.64,
        description: 'Continuation pattern with lower highs'
      }
    ];
    
    return patterns;
  };

  // Generate support and resistance levels
  const generateSupportResistance = (data: ChartDataPoint[]) => {
    const prices = data.map(d => d.close).sort((a, b) => a - b);
    const currentPrice = data[data.length - 1]?.close || 100;
    
    // Simple support/resistance calculation
    const support = [
      prices[Math.floor(prices.length * 0.1)],
      prices[Math.floor(prices.length * 0.25)],
      prices[Math.floor(prices.length * 0.4)]
    ];
    
    const resistance = [
      prices[Math.floor(prices.length * 0.6)],
      prices[Math.floor(prices.length * 0.75)],
      prices[Math.floor(prices.length * 0.9)]
    ];
    
    return {
      support,
      resistance,
      currentPrice
    };
  };

  // Load chart data
  const loadChartData = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const data = generateChartData(selectedSymbol, timeframe);
      const techIndicators = generateTechnicalIndicators(data);
      const chartPatterns = generateChartPatterns();
      const srLevels = generateSupportResistance(data);
      
      setChartData(data);
      setIndicators(techIndicators);
      setPatterns(chartPatterns);
      setSupportResistance(srLevels);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    loadChartData();
  }, [selectedSymbol, timeframe]);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-600 bg-green-100';
      case 'sell': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'bullish': return 'text-green-600 bg-green-100';
      case 'bearish': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-600">Loading chart data...</p>
          </div>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-gray-600">No chart data available</p>
          </div>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [formatCurrency(value), 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [formatCurrency(value), 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                fill="#3b82f6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [value.toLocaleString(), 'Volume']}
              />
              <Bar 
                dataKey="volume" 
                fill="#8b5cf6"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default: // candlestick
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value: number) => [formatCurrency(value), 'Price']}
              />
              {/* Support and resistance lines */}
              {supportResistance && supportResistance.support.map((level, index) => (
                <ReferenceLine 
                  key={`support-${index}`}
                  y={level} 
                  stroke="#10b981" 
                  strokeDasharray="5 5"
                  label={{ value: `S${index + 1}`, position: 'insideBottomLeft' }}
                />
              ))}
              {supportResistance && supportResistance.resistance.map((level, index) => (
                <ReferenceLine 
                  key={`resistance-${index}`}
                  y={level} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: `R${index + 1}`, position: 'insideTopLeft' }}
                />
              ))}
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Charting & Technical Analysis</h1>
          <p className="text-gray-600 mt-1">
            Professional-grade charting tools with technical indicators and pattern recognition
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={loadChartData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Chart Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Symbol</label>
              <select 
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'].map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <select 
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'].map(tf => (
                  <option key={tf} value={tf}>{tf}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Chart Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'candlestick', icon: Candlestick, label: 'Candlestick' },
                  { value: 'line', icon: LineChartIcon, label: 'Line' },
                  { value: 'area', icon: BarChart3, label: 'Area' },
                  { value: 'volume', icon: Activity, label: 'Volume' }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={chartType === value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType(value as any)}
                    className="flex items-center gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-xs">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {chartData.length > 0 && (
              <div className="pt-4 border-t">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Open:</span>
                    <span className="font-medium">{formatCurrency(chartData[0].open)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current:</span>
                    <span className="font-medium">{formatCurrency(chartData[chartData.length - 1].close)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Change:</span>
                    <span className={`font-medium ${
                      chartData[chartData.length - 1].close >= chartData[0].open 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(
                        ((chartData[chartData.length - 1].close - chartData[0].open) / chartData[0].open) * 100
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Chart */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {selectedSymbol} Chart
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{timeframe}</Badge>
                  <Badge variant={isLoading ? "secondary" : "default"}>
                    {isLoading ? "Loading..." : "Live"}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderChart()}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technical Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Technical Indicators
            </CardTitle>
            <CardDescription>
              Real-time technical analysis and trading signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {indicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{indicator.name}</div>
                    <div className="text-xs text-gray-500">
                      Strength: {indicator.strength}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{indicator.value.toFixed(2)}</div>
                    <Badge variant="outline" className={getSignalColor(indicator.signal)}>
                      {indicator.signal.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Chart Patterns
            </CardTitle>
            <CardDescription>
              AI-powered pattern recognition and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {patterns.map((pattern, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{pattern.name}</div>
                    <Badge variant="outline" className={getPatternColor(pattern.type)}>
                      {pattern.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{pattern.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Confidence: {(pattern.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="flex items-center gap-1">
                      {pattern.confidence > 0.8 ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-yellow-600" />
                      )}
                      <span className="text-xs">
                        {pattern.confidence > 0.8 ? 'High' : pattern.confidence > 0.6 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support & Resistance */}
      {supportResistance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5" />
              Support & Resistance Levels
            </CardTitle>
            <CardDescription>
              Key price levels for trading decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-3">Support Levels</h4>
                <div className="space-y-2">
                  {supportResistance.support.map((level, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">S{index + 1}</span>
                      <span className="text-sm font-semibold">{formatCurrency(level)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-600 mb-3">Current Price</h4>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(supportResistance.currentPrice)}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    {selectedSymbol}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-600 mb-3">Resistance Levels</h4>
                <div className="space-y-2">
                  {supportResistance.resistance.map((level, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium">R{index + 1}</span>
                      <span className="text-sm font-semibold">{formatCurrency(level)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}