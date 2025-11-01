'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TradingHoursOptimization from '@/components/TradingHoursOptimization';
import EnhancedAIIntegration from '@/components/EnhancedAIIntegration';
import PerformanceOptimization from '@/components/PerformanceOptimization';
import PricingPage from '@/components/PricingPage';
import FreemiumModel from '@/components/FreemiumModel';
import PayPerUseModel from '@/components/PayPerUseModel';
import WhiteLabelPartnerships from '@/components/WhiteLabelPartnerships';
import DataSalesAnalytics from '@/components/DataSalesAnalytics';
import AdvancedOrderTypes from '@/components/AdvancedOrderTypes';
import MLPredictiveAnalytics from '@/components/MLPredictiveAnalytics';
import { 
  Globe, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Clock, 
  Brain, 
  Zap, 
  CreditCard, 
  Users, 
  Database,
  ArrowRight,
  PlayCircle,
  Target
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('trading-sessions');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Globe,
      title: 'Global Market Coverage',
      description: 'Access 40+ exchanges across Asia, Europe, Americas, Africa, and Middle East',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Real-time Data',
      description: 'Live market data streaming with 1M+ updates per second',
      color: 'text-green-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Analytics',
      description: '50+ advanced trading algorithms for market predictions and signals',
      color: 'text-purple-600'
    },
    {
      icon: DollarSign,
      title: 'Multi-Currency Support',
      description: 'Seamless currency conversion and cross-border trading capabilities',
      color: 'text-yellow-600'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive market analysis and correlation studies',
      color: 'text-red-600'
    },
    {
      icon: Calendar,
      title: 'Trading Intelligence',
      description: 'Global holiday schedules and optimal trading times',
      color: 'text-indigo-600'
    }
  ];

  const stats = [
    { label: 'Global Exchanges', value: '40+', description: 'Across 6 continents' },
    { label: 'Real-time Data', value: '1M+', description: 'Updates per second' },
    { label: 'AI Models', value: '50+', description: 'Trading algorithms' },
    { label: 'Active Users', value: '10K+', description: 'Worldwide traders' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              🚀 AI-Powered Trading Intelligence
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Global Markets Trading
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {' '}Platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Access 40+ global exchanges, real-time market data with 1M+ updates per second, 
              and AI-powered analytics all in one unified platform for modern traders and institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-3 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-white/80 backdrop-blur">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600 mb-1">{stat.label}</div>
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
              Core Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive trading intelligence designed for the global financial markets
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
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

      {/* Platform Preview Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trading Tools & Solutions
            </h2>
            <p className="text-xl text-gray-600">
              Explore our comprehensive suite of trading tools and business solutions
            </p>
          </div>

          {/* Responsive Tabs */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { value: 'trading-sessions', label: 'Trading Sessions', icon: Globe },
                    { value: 'market-analysis', label: 'Market Analysis', icon: TrendingUp },
                    { value: 'ai-integration', label: 'AI Integration', icon: Brain },
                    { value: 'ml-analytics', label: 'ML Analytics', icon: Zap },
                    { value: 'performance', label: 'Performance', icon: Zap },
                    { value: 'currency-conversion', label: 'Currency Conversion', icon: DollarSign },
                    { value: 'holiday-calendar', label: 'Holiday Calendar', icon: Calendar },
                    { value: 'trading-hours', label: 'Trading Hours', icon: Clock },
                    { value: 'order-management', label: 'Order Management', icon: Target },
                    { value: 'pricing', label: 'Pricing', icon: CreditCard },
                    { value: 'freemium', label: 'Freemium', icon: Users },
                    { value: 'pay-per-use', label: 'Pay-Per-Use', icon: CreditCard },
                    { value: 'partnerships', label: 'Partnerships', icon: Users },
                    { value: 'data-sales', label: 'Data Sales', icon: Database },
                  ].map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab(tab.value)}
                      className="flex items-center gap-2"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <TabsContent value="trading-sessions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Trading Sessions Analysis</CardTitle>
                      <CardDescription>
                        Real-time analysis of global trading sessions and overlaps
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Asian Session</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            Tokyo, Shanghai, Hong Kong, Singapore, Seoul
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">European Session</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            London, Frankfurt, Paris, Amsterdam, Zurich
                          </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">American Session</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            New York, NASDAQ, Chicago, Toronto, Mexico
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="currency-conversion" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Currency Conversion</CardTitle>
                      <CardDescription>
                        Multi-currency support with real-time exchange rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['USD/EUR', 'GBP/USD', 'USD/JPY', 'AUD/USD'].map((pair) => (
                          <div key={pair} className="p-3 border rounded-lg text-center">
                            <div className="font-semibold">{pair}</div>
                            <div className="text-sm text-green-600">+0.45%</div>
                            <div className="text-xs text-slate-600">Real-time</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="holiday-calendar" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Holiday Calendar</CardTitle>
                      <CardDescription>
                        Global market holidays and trading schedules
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { date: '2024-12-25', market: 'US Markets', holiday: 'Christmas Day' },
                          { date: '2024-12-26', market: 'European Markets', holiday: 'Boxing Day' },
                          { date: '2025-01-01', market: 'Global Markets', holiday: "New Year's Day" }
                        ].map((holiday, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border-b">
                            <span className="font-medium">{holiday.date}</span>
                            <span className="text-sm">{holiday.market}</span>
                            <Badge variant="secondary">{holiday.holiday}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="market-analysis" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Analysis</CardTitle>
                      <CardDescription>
                        Cross-market correlations and trend analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Market Correlations</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>SPX/NKY</span>
                              <Badge variant="outline">0.78</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>DAX/FTSE</span>
                              <Badge variant="outline">0.85</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Regional Trends</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Asia</span>
                              <Badge variant="default" className="bg-green-100 text-green-800">Bullish</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Europe</span>
                              <Badge variant="default" className="bg-yellow-100 text-yellow-800">Neutral</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trading-hours" className="space-y-4">
                  <TradingHoursOptimization />
                </TabsContent>

                <TabsContent value="order-management" className="space-y-4">
                  <AdvancedOrderTypes />
                </TabsContent>

                <TabsContent value="ai-integration" className="space-y-4">
                  <EnhancedAIIntegration />
                </TabsContent>

                <TabsContent value="ml-analytics" className="space-y-4">
                  <MLPredictiveAnalytics />
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <PerformanceOptimization />
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <PricingPage />
                </TabsContent>

                <TabsContent value="freemium" className="space-y-4">
                  <FreemiumModel />
                </TabsContent>

                <TabsContent value="pay-per-use" className="space-y-4">
                  <PayPerUseModel />
                </TabsContent>

                <TabsContent value="partnerships" className="space-y-4">
                  <WhiteLabelPartnerships />
                </TabsContent>

                <TabsContent value="data-sales" className="space-y-4">
                  <DataSalesAnalytics />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of traders accessing 40+ global exchanges with AI-powered analytics and real-time data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}