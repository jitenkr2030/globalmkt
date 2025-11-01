'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  DollarSign, 
  Gift, 
  Star,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  Zap,
  Crown,
  BarChart3,
  PieChart,
  Activity,
  Download
} from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  customerLifetimeValue: number;
  growthRate: number;
  churnRate: number;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  paidUsers: number;
  trialUsers: number;
  conversionRate: number;
}

interface MonetizationStream {
  name: string;
  revenue: number;
  growth: number;
  users: number;
  color: string;
  icon: JSX.Element;
}

interface TopPerformer {
  name: string;
  revenue: number;
  growth: number;
  stream: string;
}

const mockRevenueMetrics: RevenueMetrics = {
  totalRevenue: 284750,
  monthlyRecurringRevenue: 125000,
  averageRevenuePerUser: 342,
  customerLifetimeValue: 2850,
  growthRate: 23.5,
  churnRate: 2.1
};

const mockUserMetrics: UserMetrics = {
  totalUsers: 832,
  activeUsers: 498,
  freeUsers: 415,
  paidUsers: 367,
  trialUsers: 50,
  conversionRate: 8.5
};

const monetizationStreams: MonetizationStream[] = [
  {
    name: 'Subscription Plans',
    revenue: 185000,
    growth: 28.5,
    users: 367,
    color: 'bg-blue-500',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    name: 'Pay-Per-Use Credits',
    revenue: 42500,
    growth: 45.2,
    users: 234,
    color: 'bg-green-500',
    icon: <Zap className="h-5 w-5" />
  },
  {
    name: 'Data Sales',
    revenue: 35250,
    growth: 18.7,
    users: 89,
    color: 'bg-purple-500',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    name: 'White-Label Partnerships',
    revenue: 22000,
    growth: 12.3,
    users: 15,
    color: 'bg-orange-500',
    icon: <Crown className="h-5 w-5" />
  }
];

const topPerformers: TopPerformer[] = [
  { name: 'Professional Plan', revenue: 125000, growth: 32.1, stream: 'Subscription' },
  { name: 'AI Analysis Credits', revenue: 28500, growth: 52.3, stream: 'Pay-Per-Use' },
  { name: 'Enterprise Data', revenue: 22000, growth: 15.7, stream: 'Data Sales' },
  { name: 'Brokerage Partners', revenue: 18000, growth: 8.9, stream: 'Partnerships' }
];

export default function MonetizationDashboard() {
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>(mockRevenueMetrics);
  const [userMetrics, setUserMetrics] = useState<UserMetrics>(mockUserMetrics);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monetization Dashboard</h1>
          <p className="text-gray-600">Track revenue, user growth, and monetization performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(revenueMetrics.growthRate)}>
                {getGrowthIcon(revenueMetrics.growthRate)} {Math.abs(revenueMetrics.growthRate)}%
              </span>
              {' '}from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.monthlyRecurringRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 12.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(userMetrics.activeUsers)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 18.7%</span> from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 2.1%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monetization Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Stream</CardTitle>
            <CardDescription>Breakdown of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monetizationStreams.map((stream, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${stream.color}`}></div>
                      <span className="font-medium">{stream.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(stream.revenue)}</div>
                      <div className={`text-sm ${getGrowthColor(stream.growth)}`}>
                        {getGrowthIcon(stream.growth)} {Math.abs(stream.growth)}%
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={(stream.revenue / revenueMetrics.totalRevenue) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{stream.users} users</span>
                    <span>{((stream.revenue / revenueMetrics.totalRevenue) * 100).toFixed(1)}% of total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user types and conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userMetrics.freeUsers}</div>
                  <div className="text-sm text-gray-600">Free Users</div>
                  <div className="text-xs text-gray-500">
                    {((userMetrics.freeUsers / userMetrics.totalUsers) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userMetrics.paidUsers}</div>
                  <div className="text-sm text-gray-600">Paid Users</div>
                  <div className="text-xs text-gray-500">
                    {((userMetrics.paidUsers / userMetrics.totalUsers) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{userMetrics.trialUsers}</div>
                  <div className="text-sm text-gray-600">Trial Users</div>
                  <div className="text-xs text-gray-500">
                    {((userMetrics.trialUsers / userMetrics.totalUsers) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{userMetrics.conversionRate}%</div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                  <div className="text-xs text-gray-500">
                    Free to paid conversion
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Average Revenue Per User</span>
                  <span className="font-bold text-lg">{formatCurrency(revenueMetrics.averageRevenuePerUser)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Customer Lifetime Value</span>
                  <span className="font-bold text-lg">{formatCurrency(revenueMetrics.customerLifetimeValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Churn Rate</span>
                  <span className="font-bold text-lg text-red-600">{revenueMetrics.churnRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Best performing products and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{performer.name}</div>
                      <div className="text-sm text-gray-500">{performer.stream}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(performer.revenue)}</div>
                    <div className={`text-sm ${getGrowthColor(performer.growth)}`}>
                      {getGrowthIcon(performer.growth)} {Math.abs(performer.growth)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common monetization tasks and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <CreditCard className="h-6 w-6" />
                <span>View Subscriptions</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Gift className="h-6 w-6" />
                <span>Manage Freemium</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Zap className="h-6 w-6" />
                <span>Credit Packages</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Crown className="h-6 w-6" />
                <span>Partnerships</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Data Sales</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <PieChart className="h-6 w-6" />
                <span>Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Growth Trend</CardTitle>
          <CardDescription>Monthly revenue growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Revenue growth chart visualization</p>
              <p className="text-sm text-gray-400">Interactive chart showing monthly revenue trends</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
          <CardDescription>AI-powered insights for monetization optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Strong Performance</h4>
                  <p className="text-sm text-green-700">
                    Pay-per-use credits showing 45% growth - consider expanding credit package options
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">Opportunity Identified</h4>
                  <p className="text-sm text-yellow-700">
                    Enterprise plan adoption is low - consider targeted marketing for institutional clients
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Growth Opportunity</h4>
                  <p className="text-sm text-blue-700">
                    Data sales growing steadily - expand premium data offerings and analytics
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900">Recommendation</h4>
                  <p className="text-sm text-purple-700">
                    Focus on improving free-to-paid conversion - current 8.5% can reach 12-15%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}