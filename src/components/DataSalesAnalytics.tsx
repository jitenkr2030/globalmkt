'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Database, 
  Download, 
  DollarSign, 
  TrendingUp, 
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  Calendar,
  Target,
  Zap,
  FileText,
  Package,
  ShoppingCart,
  Filter,
  Search,
  Eye,
  Plus,
  Edit
} from 'lucide-react';

interface DataProduct {
  id: string;
  name: string;
  category: 'market_data' | 'analytics' | 'reports' | 'apis';
  type: 'real_time' | 'historical' | 'processed';
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  purchases: number;
  revenue: number;
  growth: number;
  description: string;
  features: string[];
  dataSources: string[];
  updateFrequency: string;
  license: 'standard' | 'premium' | 'enterprise';
  tags: string[];
}

interface Customer {
  id: string;
  name: string;
  type: 'institution' | 'individual' | 'corporate';
  industry: string;
  purchases: number;
  revenue: number;
  lastPurchase: string;
  favoriteProducts: string[];
}

interface SalesMetrics {
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  averageOrderValue: number;
  growthRate: number;
  topCategory: string;
  topProduct: string;
}

const mockDataProducts: DataProduct[] = [
  {
    id: 'product_001',
    name: 'Real-Time Market Data Feed',
    category: 'market_data',
    type: 'real_time',
    price: 299,
    currency: 'USD',
    rating: 4.8,
    reviews: 127,
    purchases: 89,
    revenue: 26611,
    growth: 23.5,
    description: 'Real-time data feeds from 32 global exchanges with millisecond latency',
    features: ['Real-time streaming', '32 exchanges', 'Low latency', 'REST API', 'WebSocket support'],
    dataSources: ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX'],
    updateFrequency: 'Real-time',
    license: 'premium',
    tags: ['real-time', 'market data', 'api', 'low-latency']
  },
  {
    id: 'product_002',
    name: 'Historical Market Data Package',
    category: 'market_data',
    type: 'historical',
    price: 199,
    currency: 'USD',
    rating: 4.6,
    reviews: 89,
    purchases: 156,
    revenue: 31044,
    growth: 18.7,
    description: 'Comprehensive historical market data spanning 20 years across all major exchanges',
    features: ['20 years history', '32 exchanges', 'Tick-level data', 'Corporate actions', 'Splits/dividends'],
    dataSources: ['All major exchanges'],
    updateFrequency: 'Daily',
    license: 'standard',
    tags: ['historical', 'market data', 'tick-data', 'archive']
  },
  {
    id: 'product_003',
    name: 'AI-Powered Market Analytics',
    category: 'analytics',
    type: 'processed',
    price: 499,
    currency: 'USD',
    rating: 4.9,
    reviews: 203,
    purchases: 67,
    revenue: 33433,
    growth: 45.2,
    description: 'Advanced analytics powered by AI for market predictions and insights',
    features: ['AI predictions', 'Risk analysis', 'Sentiment analysis', 'Portfolio optimization', 'Custom models'],
    dataSources: ['Market data', 'News feeds', 'Social media', 'Economic indicators'],
    updateFrequency: 'Hourly',
    license: 'enterprise',
    tags: ['ai', 'analytics', 'predictions', 'machine-learning']
  },
  {
    id: 'product_004',
    name: 'Market Research Reports',
    category: 'reports',
    type: 'processed',
    price: 89,
    currency: 'USD',
    rating: 4.4,
    reviews: 67,
    purchases: 234,
    revenue: 20826,
    growth: 12.3,
    description: 'In-depth market research reports and analysis from expert analysts',
    features: ['Expert analysis', 'Market trends', 'Company profiles', 'Industry reports', 'Forecasts'],
    dataSources: ['Analyst research', 'Market data', 'Company filings', 'Economic data'],
    updateFrequency: 'Weekly',
    license: 'standard',
    tags: ['research', 'reports', 'analysis', 'forecasts']
  },
  {
    id: 'product_005',
    name: 'Trading Signals API',
    category: 'apis',
    type: 'processed',
    price: 149,
    currency: 'USD',
    rating: 4.7,
    reviews: 145,
    purchases: 112,
    revenue: 16688,
    growth: 28.9,
    description: 'RESTful API for accessing trading signals and market indicators',
    features: ['REST API', 'Trading signals', 'Technical indicators', 'Webhook support', 'Documentation'],
    dataSources: ['Market data', 'Technical analysis', 'AI models'],
    updateFrequency: 'Real-time',
    license: 'premium',
    tags: ['api', 'trading', 'signals', 'technical-analysis']
  },
  {
    id: 'product_006',
    name: 'Alternative Data Feed',
    category: 'market_data',
    type: 'real_time',
    price: 799,
    currency: 'USD',
    rating: 4.5,
    reviews: 45,
    purchases: 34,
    revenue: 27166,
    growth: 67.8,
    description: 'Alternative data sources including satellite imagery, social media, and more',
    features: ['Satellite imagery', 'Social media sentiment', 'Supply chain data', 'Web scraping', 'Custom feeds'],
    dataSources: ['Satellite', 'Social media', 'Web', 'Supply chain', 'Government'],
    updateFrequency: 'Real-time',
    license: 'enterprise',
    tags: ['alternative-data', 'satellite', 'social-media', 'web-scraping']
  }
];

const mockCustomers: Customer[] = [
  {
    id: 'customer_001',
    name: 'Global Investment Bank',
    type: 'institution',
    industry: 'Banking',
    purchases: 12,
    revenue: 8900,
    lastPurchase: '2024-03-15T00:00:00Z',
    favoriteProducts: ['Real-Time Market Data Feed', 'AI-Powered Market Analytics']
  },
  {
    id: 'customer_002',
    name: 'Hedge Fund Alpha',
    type: 'institution',
    industry: 'Investment Management',
    purchases: 8,
    revenue: 6200,
    lastPurchase: '2024-03-12T00:00:00Z',
    favoriteProducts: ['Historical Market Data Package', 'Trading Signals API']
  },
  {
    id: 'customer_003',
    name: 'TechCorp Analytics',
    type: 'corporate',
    industry: 'Technology',
    purchases: 5,
    revenue: 2400,
    lastPurchase: '2024-03-10T00:00:00Z',
    favoriteProducts: ['AI-Powered Market Analytics', 'Market Research Reports']
  }
];

const mockSalesMetrics: SalesMetrics = {
  totalRevenue: 155768,
  totalProducts: 6,
  totalCustomers: 156,
  averageOrderValue: 998,
  growthRate: 28.4,
  topCategory: 'market_data',
  topProduct: 'Historical Market Data Package'
};

export default function DataSalesAnalytics() {
  const [dataProducts, setDataProducts] = useState<DataProduct[]>(mockDataProducts);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>(mockSalesMetrics);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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

  const getRatingStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market_data': return <Database className="h-5 w-5" />;
      case 'analytics': return <BarChart3 className="h-5 w-5" />;
      case 'reports': return <FileText className="h-5 w-5" />;
      case 'apis': return <Zap className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getLicenseColor = (license: string) => {
    switch (license) {
      case 'standard': return 'text-blue-600';
      case 'premium': return 'text-purple-600';
      case 'enterprise': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const filteredProducts = dataProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categoryRevenue = dataProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.revenue;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = [...dataProducts].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Sales & Analytics</h1>
          <p className="text-gray-600">Manage data products, analytics, and sales</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Sales
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
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className={getGrowthColor(salesMetrics.growthRate)}>
                ↑ {Math.abs(salesMetrics.growthRate)}%
              </span>
              {' '}from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active data products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(salesMetrics.totalCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesMetrics.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Category Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Breakdown of revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(categoryRevenue).map(([category, revenue]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category)}
                          <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(revenue)}</div>
                          <div className="text-sm text-gray-500">
                            {((revenue / salesMetrics.totalRevenue) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <Progress 
                        value={(revenue / salesMetrics.totalRevenue) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Best-selling data products this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {getRatingStars(product.rating)} ({product.reviews} reviews)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                        <div className={`text-sm ${getGrowthColor(product.growth)}`}>
                          {product.growth >= 0 ? '+' : ''}{product.growth}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales Activity</CardTitle>
              <CardDescription>Latest product purchases and customer activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {customer.industry} • {customer.type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(customer.revenue)}</div>
                        <div className="text-sm text-gray-500">
                          {customer.purchases} purchases
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(customer.lastPurchase).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {/* Product Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>Browse and manage data products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Categories</option>
                  <option value="market_data">Market Data</option>
                  <option value="analytics">Analytics</option>
                  <option value="reports">Reports</option>
                  <option value="apis">APIs</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(product.category)}
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                        </div>
                        <Badge className={getLicenseColor(product.license)}>
                          {product.license}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {product.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Rating:</span>
                          <span className="text-sm">
                            {getRatingStars(product.rating)} ({product.reviews})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sales:</span>
                          <span className="text-sm font-medium">{product.purchases} sold</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Revenue:</span>
                          <span className={`text-sm font-medium ${getGrowthColor(product.growth)}`}>
                            {formatCurrency(product.revenue)} ({product.growth >= 0 ? '+' : ''}{product.growth}%)
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-3">
                          <Button size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          {/* Customer Management */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>Manage customer accounts and relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {customer.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {customer.industry} • {customer.type.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-gray-400">
                          Favorite: {customer.favoriteProducts.join(', ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(customer.revenue)}</div>
                        <div className="text-sm text-gray-500">
                          {customer.purchases} purchases
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Last: {new Date(customer.lastPurchase).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Sales Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Revenue and sales trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Sales performance chart</p>
                    <p className="text-sm text-gray-400">Interactive chart showing revenue trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
                <CardDescription>Customer behavior and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Customer analytics dashboard</p>
                    <p className="text-sm text-gray-400">Customer segmentation and behavior</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Insights</CardTitle>
              <CardDescription>AI-powered insights for product optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900">Strong Performer</h4>
                      <p className="text-sm text-green-700">
                        AI-Powered Market Analytics showing 45% growth - consider expanding features
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Growth Opportunity</h4>
                      <p className="text-sm text-blue-700">
                        Alternative Data Feed has high demand - consider similar products
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-900">Pricing Opportunity</h4>
                      <p className="text-sm text-yellow-700">
                        Market Research Reports underpriced - consider tiered pricing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Star className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-purple-900">Recommendation</h4>
                      <p className="text-sm text-purple-700">
                        Bundle products to increase average order value and customer retention
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}