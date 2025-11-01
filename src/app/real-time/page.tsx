'use client';

import { useEffect, useState } from 'react';
import RealTimeMarketDashboard from '@/components/RealTimeMarketDashboard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Globe, 
  Database,
  RefreshCw,
  Wifi,
  WifiOff,
  Signal,
  BarChart3
} from 'lucide-react';

export default function RealTimePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Simulate connection status updates
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1); // 90% chance of being connected
      setUpdateCount(prev => prev + Math.floor(Math.random() * 100));
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Activity,
      title: 'Live Data Streams',
      value: '16',
      description: 'Active market data feeds',
      color: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'Updates/Second',
      value: '1M+',
      description: 'Real-time data processing',
      color: 'text-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Latency',
      value: '< 1ms',
      description: 'Ultra-low latency delivery',
      color: 'text-purple-600'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      value: '40+',
      description: 'Exchanges worldwide',
      color: 'text-orange-600'
    }
  ];

  const features = [
    {
      title: 'Real-Time Market Data',
      description: 'Live streaming of market indices, stock prices, and trading volumes with millisecond updates.',
      icon: Database
    },
    {
      title: 'Technical Indicators',
      description: 'Advanced technical analysis with RSI, MACD, SMA, and other indicators with buy/sell signals.',
      icon: BarChart3
    },
    {
      title: 'Order Book Depth',
      description: 'Real-time order book data showing bid/ask spreads and market depth analysis.',
      icon: Signal
    },
    {
      title: 'Trade Streaming',
      description: 'Live trade execution data with price, size, and market condition information.',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-4 w-4 mr-1" />
                🚀 Real-Time Platform
              </Badge>
              {isConnected ? (
                <Badge variant="default" className="px-3 py-1 bg-green-600">
                  <Wifi className="h-4 w-4 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1">
                  <WifiOff className="h-4 w-4 mr-1" />
                  Connecting...
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Real-Time Market Data
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Streaming
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the power of real-time market data with our enhanced WebSocket streaming platform. 
              Get instant access to live market data, technical indicators, and trading signals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-3 text-lg">
                <Activity className="mr-2 h-5 w-5" />
                Start Streaming
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <RefreshCw className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardContent className="pt-6">
                  <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600 mb-1">{stat.title}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Advanced Real-Time Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform delivers comprehensive real-time market data with advanced analytics and trading tools
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Live Dashboard Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Live Market Dashboard
            </h2>
            <p className="text-xl text-gray-600">
              Experience real-time market data streaming with our interactive dashboard
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-sm">
                Updates: {updateCount.toLocaleString()}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Last: {lastUpdate.toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          <RealTimeMarketDashboard />
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Technical Specifications
            </h2>
            <p className="text-xl text-gray-600">
              Built with cutting-edge technology for maximum performance and reliability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 1M+ updates per second</li>
                  <li>• &lt; 1ms latency</li>
                  <li>• 99.9% uptime</li>
                  <li>• Auto-reconnection</li>
                  <li>• Load balancing</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 40+ global exchanges</li>
                  <li>• 10,000+ symbols</li>
                  <li>• Real-time news</li>
                  <li>• Market depth data</li>
                  <li>• Historical data</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• 50+ technical indicators</li>
                  <li>• AI-powered signals</li>
                  <li>• Pattern recognition</li>
                  <li>• Risk analysis</li>
                  <li>• Portfolio tracking</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}