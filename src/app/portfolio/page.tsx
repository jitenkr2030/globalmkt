import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PortfolioManagement from '@/components/PortfolioManagement';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Target, 
  Wallet, 
  TrendingUp as Trend,
  Users,
  Star,
  Award,
  Shield,
  Zap,
  Globe,
  Activity,
  Eye,
  Settings,
  Download,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function PortfolioPage() {
  const portfolioStats = [
    { label: 'Total Portfolio Value', value: '$73,157', change: '+15.8%', icon: TrendingUp },
    { label: 'Active Positions', value: '5', change: '+2', icon: PieChart },
    { label: 'Total Return', value: '+20.5%', change: '+4.2%', icon: BarChart3 },
    { label: 'Win Rate', value: '68.4%', change: '+2.1%', icon: Target }
  ];

  const portfolioFeatures = [
    {
      title: 'Real-time Tracking',
      description: 'Live updates of your portfolio performance with real-time market data',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Advanced Analytics',
      description: 'Comprehensive performance metrics and risk analysis tools',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Asset Allocation',
      description: 'Visual breakdown of your portfolio diversification',
      icon: PieChart,
      color: 'text-purple-600'
    },
    {
      title: 'Risk Management',
      description: 'Built-in risk assessment and position sizing tools',
      icon: Shield,
      color: 'text-red-600'
    },
    {
      title: 'Tax Optimization',
      description: 'Tax-loss harvesting and efficient tax reporting',
      icon: Trend,
      color: 'text-yellow-600'
    },
    {
      title: 'Multi-asset Support',
      description: 'Manage stocks, bonds, crypto, forex, and commodities',
      icon: Globe,
      color: 'text-indigo-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Portfolio Management</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Advanced Portfolio
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Management
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Take control of your investments with powerful portfolio tracking, analytics, and management tools
          </p>
        </div>

        {/* Portfolio Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {portfolioStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-green-600 mb-1">{stat.change}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Portfolio Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio Management Dashboard */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Your Portfolio Dashboard</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Investment
              </Button>
            </div>
          </div>
          <PortfolioManagement />
        </div>

        {/* Additional Tools Section */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <span>Premium Analytics</span>
              </CardTitle>
              <CardDescription>Advanced portfolio analysis tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Monte Carlo simulations</li>
                <li>• Value at Risk (VaR) analysis</li>
                <li>• Correlation matrix analysis</li>
                <li>• Portfolio optimization</li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Social Portfolio</span>
              </CardTitle>
              <CardDescription>Share and compare portfolios</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Portfolio sharing</li>
                <li>• Performance comparison</li>
                <li>• Copy trading</li>
                <li>• Community insights</li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                Explore Community
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>API Access</span>
              </CardTitle>
              <CardDescription>Integrate with your tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• REST API access</li>
                <li>• WebSocket streaming</li>
                <li>• Custom reports</li>
                <li>• Third-party integrations</li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}