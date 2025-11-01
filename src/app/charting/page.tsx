'use client';

import { useEffect, useState } from 'react';
import AdvancedCharting from '@/components/AdvancedCharting';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  LineChart, 
  Candlestick, 
  TrendingUp, 
  Target, 
  Activity,
  Zap,
  RefreshCw,
  Download,
  Settings,
  Maximize,
  Eye,
  Calculator,
  Brain,
  AlertCircle
} from 'lucide-react';

export default function ChartingPage() {
  const [activeFeature, setActiveFeature] = useState('overview');

  const features = [
    {
      title: 'Interactive Charts',
      description: 'Multiple chart types including candlestick, line, area, and volume charts with full interactivity.',
      icon: BarChart3
    },
    {
      title: 'Technical Indicators',
      description: '50+ technical indicators including RSI, MACD, Bollinger Bands, Stochastic, and more.',
      icon: LineChart
    },
    {
      title: 'Pattern Recognition',
      description: 'AI-powered pattern recognition for Head & Shoulders, Double Tops/Bottoms, Triangles, and more.',
      icon: Brain
    },
    {
      title: 'Support & Resistance',
      description: 'Automatic detection of key support and resistance levels with visual indicators.',
      icon: Target
    },
    {
      title: 'Drawing Tools',
      description: 'Comprehensive drawing tools including trendlines, channels, Fibonacci retracements, and more.',
      icon: Activity
    },
    {
      title: 'Multi-Timeframe',
      description: 'Analyze multiple timeframes simultaneously from 1-minute to monthly charts.',
      icon: RefreshCw
    }
  ];

  const indicators = [
    { name: 'RSI (Relative Strength Index)', type: 'Momentum', description: 'Measures speed and change of price movements' },
    { name: 'MACD (Moving Average Convergence Divergence)', type: 'Trend', description: 'Shows relationship between two moving averages' },
    { name: 'Bollinger Bands', type: 'Volatility', description: 'Measures volatility and identifies overbought/oversold conditions' },
    { name: 'Stochastic Oscillator', type: 'Momentum', description: 'Compares closing price to price range over period' },
    { name: 'Moving Averages', type: 'Trend', description: 'Smooths price data to identify trends' },
    { name: 'Fibonacci Retracement', type: 'Support/Resistance', description: 'Identifies potential reversal levels' },
    { name: 'Volume Profile', type: 'Volume', description: 'Shows trading activity at specific price levels' },
    { name: 'Ichimoku Cloud', type: 'Trend', description: 'Comprehensive indicator showing support, resistance, and momentum' }
  ];

  const chartTypes = [
    { name: 'Candlestick', description: 'Shows open, high, low, and close prices for each period', icon: Candlestick },
    { name: 'Line Chart', description: 'Connects closing prices with a continuous line', icon: LineChart },
    { name: 'Area Chart', description: 'Filled line chart showing price movements', icon: Activity },
    { name: 'Volume Chart', description: 'Displays trading volume over time', icon: BarChart3 },
    { name: 'Heikin-Ashi', description: 'Candlestick chart that filters noise', icon: Candlestick },
    { name: 'Renko Chart', description: 'Price-based chart that filters minor movements', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <BarChart3 className="h-4 w-4 mr-1" />
              🚀 Professional Charting
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Advanced Charting &
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Technical Analysis
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Professional-grade charting tools with 50+ technical indicators, AI-powered pattern recognition, 
              and advanced drawing tools for comprehensive market analysis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-3 text-lg">
                <Eye className="mr-2 h-5 w-5" />
                Try Charting Tools
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Download className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Professional Charting Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for comprehensive technical analysis and informed trading decisions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Charting Demo */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Interactive Charting Demo
            </h2>
            <p className="text-xl text-gray-600">
              Experience our advanced charting tools with real-time data and technical analysis
            </p>
          </div>

          <AdvancedCharting />
        </div>
      </section>

      {/* Technical Indicators */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              50+ Technical Indicators
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive technical analysis tools for every trading style
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {indicators.map((indicator, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{indicator.name}</h3>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {indicator.type}
                      </Badge>
                    </div>
                    <Calculator className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">{indicator.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Chart Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Multiple Chart Types
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect chart type for your analysis needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chartTypes.map((chart, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <chart.icon className="h-8 w-8 text-purple-600" />
                    <h3 className="font-semibold">{chart.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{chart.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Advanced Analysis Tools
            </h2>
            <p className="text-xl text-gray-600">
              Professional-grade features for serious traders
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Pattern Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Head & Shoulders detection</li>
                  <li>• Double Top/Bottom patterns</li>
                  <li>• Triangle patterns</li>
                  <li>• Flag and Pennant patterns</li>
                  <li>• Confidence scoring</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Support & Resistance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Automatic level detection</li>
                  <li>• Dynamic adjustment</li>
                  <li>• Strength indicators</li>
                  <li>• Breakout alerts</li>
                  <li>• Historical levels</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  Drawing Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Trendlines and channels</li>
                  <li>• Fibonacci retracements</li>
                  <li>• Gann fans</li>
                  <li>• Pitchforks</li>
                  <li>• Text and annotations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Performance & Reliability */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Performance & Reliability
            </h2>
            <p className="text-xl text-gray-600">
              Built for speed and accuracy in fast-moving markets
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">&lt; 50ms</div>
                <div className="text-sm text-gray-600">Chart Load Time</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <RefreshCw className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">60 FPS</div>
                <div className="text-sm text-gray-600">Smooth Rendering</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Activity className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">1M+</div>
                <div className="text-sm text-gray-600">Data Points</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900 mb-1">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}