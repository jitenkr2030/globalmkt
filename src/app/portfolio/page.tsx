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
    { label: 'Total Portfolio Value', value: 73157, change: '+15.8%', icon: TrendingUp },
    { label: 'Active Positions', value: '5', change: '+2', icon: PieChart },
    { label: 'Total Return', value: '+20.5%', change: '+4.2%', icon: BarChart3 },
    { label: 'Win Rate', value: '68.4%', change: '+2.1%', icon: Target }
  ];

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } catch (error) {
      return `$${value.toFixed(2)}`;
    }
  };

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
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value}
                </div>
                <div className="text-sm font-medium text-green-600 mb-1">{stat.change}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rest of the component */}
      </main>
    </div>
  );
}