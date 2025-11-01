'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Handshake, 
  Settings,
  CheckCircle,
  AlertCircle,
  Star,
  Globe,
  BarChart3,
  Calendar,
  Target,
  Zap,
  FileText,
  Download,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  type: 'brokerage' | 'financial_advisor' | 'educational' | 'fintech';
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  users: number;
  revenue: number;
  growth: number;
  tier: 'basic' | 'professional' | 'enterprise';
  customizations: string[];
  performance: {
    userRetention: number;
    revenueGrowth: number;
    satisfaction: number;
  };
}

interface PartnershipTier {
  name: string;
  price: number;
  setupFee: number;
  revenueShare: number;
  features: string[];
  description: string;
  targetAudience: string;
  popular?: boolean;
}

interface PartnershipApplication {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  companyType: string;
  estimatedUsers: number;
  targetMarket: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

const mockPartners: Partner[] = [
  {
    id: 'partner_001',
    name: 'TradePro Brokerage',
    type: 'brokerage',
    status: 'active',
    joinDate: '2024-01-15T00:00:00Z',
    users: 1250,
    revenue: 45000,
    growth: 23.5,
    tier: 'enterprise',
    customizations: ['White-label UI', 'Custom branding', 'API integration'],
    performance: {
      userRetention: 85.2,
      revenueGrowth: 23.5,
      satisfaction: 4.7
    }
  },
  {
    id: 'partner_002',
    name: 'Wealth Advisors Inc',
    type: 'financial_advisor',
    status: 'active',
    joinDate: '2024-02-01T00:00:00Z',
    users: 850,
    revenue: 28000,
    growth: 18.7,
    tier: 'professional',
    customizations: ['Custom branding', 'Advisor dashboard'],
    performance: {
      userRetention: 78.9,
      revenueGrowth: 18.7,
      satisfaction: 4.5
    }
  },
  {
    id: 'partner_003',
    name: 'Finance Academy',
    type: 'educational',
    status: 'pending',
    joinDate: '2024-03-01T00:00:00Z',
    users: 320,
    revenue: 8500,
    growth: 12.3,
    tier: 'basic',
    customizations: ['Educational branding'],
    performance: {
      userRetention: 92.1,
      revenueGrowth: 12.3,
      satisfaction: 4.8
    }
  }
];

const partnershipTiers: PartnershipTier[] = [
  {
    name: 'Basic Tier',
    price: 1000,
    setupFee: 5000,
    revenueShare: 20,
    description: 'Perfect for small businesses and educational institutions',
    targetAudience: 'Small businesses, educational institutions',
    features: [
      'White-label branding',
      'Basic customization',
      'Standard features',
      'Email support',
      'Monthly reporting'
    ]
  },
  {
    name: 'Professional Tier',
    price: 2000,
    setupFee: 10000,
    revenueShare: 25,
    popular: true,
    description: 'Ideal for growing companies and financial advisors',
    targetAudience: 'Growing companies, financial advisors',
    features: [
      'Everything in Basic',
      'Advanced customization',
      'API access',
      'Priority support',
      'Custom integrations',
      'Advanced analytics'
    ]
  },
  {
    name: 'Enterprise Tier',
    price: 5000,
    setupFee: 25000,
    revenueShare: 30,
    description: 'Comprehensive solution for large institutions',
    targetAudience: 'Large institutions, enterprises',
    features: [
      'Everything in Professional',
      'Full white-label solution',
      'Custom development',
      'Dedicated support',
      'SLA guarantees',
      'Custom features',
      'On-premise deployment'
    ]
  }
];

const mockApplications: PartnershipApplication[] = [
  {
    id: 'app_001',
    companyName: 'Global Trading Co',
    contactPerson: 'John Smith',
    email: 'john@globaltrading.com',
    phone: '+1-555-0123',
    companyType: 'brokerage',
    estimatedUsers: 500,
    targetMarket: 'North America',
    status: 'pending',
    submittedDate: '2024-03-15T00:00:00Z'
  },
  {
    id: 'app_002',
    companyName: 'Investment Education Ltd',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@invstedu.com',
    phone: '+1-555-0456',
    companyType: 'educational',
    estimatedUsers: 1000,
    targetMarket: 'Europe',
    status: 'approved',
    submittedDate: '2024-03-10T00:00:00Z'
  }
];

export default function WhiteLabelPartnerships() {
  const [partners, setPartners] = useState<Partner[]>(mockPartners);
  const [applications, setApplications] = useState<PartnershipApplication[]>(mockApplications);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-red-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'text-blue-600';
      case 'professional': return 'text-purple-600';
      case 'enterprise': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getPartnerTypeIcon = (type: string) => {
    switch (type) {
      case 'brokerage': return <BarChart3 className="h-5 w-5" />;
      case 'financial_advisor': return <Users className="h-5 w-5" />;
      case 'educational': return <Star className="h-5 w-5" />;
      case 'fintech': return <Zap className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const totalRevenue = partners.reduce((sum, partner) => sum + partner.revenue, 0);
  const totalUsers = partners.reduce((sum, partner) => sum + partner.users, 0);
  const averageGrowth = partners.reduce((sum, partner) => sum + partner.growth, 0) / partners.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">White-Label Partnerships</h1>
          <p className="text-gray-600">Manage partnerships and white-label solutions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowApplicationModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Partner
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 2 new this month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ {averageGrowth.toFixed(1)}% avg growth</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              Across all partners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {applications.filter(app => app.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="tiers">Partnership Tiers</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Partnership Tiers Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnershipTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </CardTitle>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${tier.price.toLocaleString()}
                    </span>
                    <span className="text-gray-600 font-medium">/month</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Setup fee: {formatCurrency(tier.setupFee)}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    {tier.revenueShare}% revenue share
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {tier.description}
                  </CardDescription>
                  <div className="text-xs text-gray-500 mt-2">
                    <strong>Perfect for:</strong> {tier.targetAudience}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button className={`w-full ${tier.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Partner Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Performance Summary</CardTitle>
              <CardDescription>Overview of partner performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <div key={partner.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getPartnerTypeIcon(partner.type)}
                        <span className="font-medium">{partner.name}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(partner.status)}`}></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">{formatNumber(partner.users)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-medium">{formatCurrency(partner.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Growth:</span>
                        <span className={`font-medium ${getGrowthColor(partner.growth)}`}>
                          {partner.growth >= 0 ? '+' : ''}{partner.growth}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tier:</span>
                        <span className={`font-medium ${getTierColor(partner.tier)}`}>
                          {partner.tier}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Retention: {partner.performance.userRetention}%</span>
                        <span>Satisfaction: {partner.performance.satisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          {/* Partners List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Partners</CardTitle>
              <CardDescription>Manage your white-label partners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partners.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(partner.status)}`}></div>
                      <div className="flex items-center space-x-2">
                        {getPartnerTypeIcon(partner.type)}
                        <div>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-gray-500">
                            {partner.type.replace('_', ' ')} • Joined {new Date(partner.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(partner.users)} users</div>
                        <div className="text-sm text-gray-500">Active users</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(partner.revenue)}</div>
                        <div className={`text-sm ${getGrowthColor(partner.growth)}`}>
                          {partner.growth >= 0 ? '+' : ''}{partner.growth}%
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getTierColor(partner.tier)}>
                          {partner.tier}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          {/* Detailed Tier Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tier Comparison</CardTitle>
                <CardDescription>Detailed comparison of partnership tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                        <th className="text-center py-3 px-4 font-semibold text-blue-600">Basic</th>
                        <th className="text-center py-3 px-4 font-semibold text-purple-600">Professional</th>
                        <th className="text-center py-3 px-4 font-semibold text-orange-600">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Monthly Fee</td>
                        <td className="py-3 px-4 text-center">${partnershipTiers[0].price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">${partnershipTiers[1].price.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">${partnershipTiers[2].price.toLocaleString()}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Setup Fee</td>
                        <td className="py-3 px-4 text-center">{formatCurrency(partnershipTiers[0].setupFee)}</td>
                        <td className="py-3 px-4 text-center">{formatCurrency(partnershipTiers[1].setupFee)}</td>
                        <td className="py-3 px-4 text-center">{formatCurrency(partnershipTiers[2].setupFee)}</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Revenue Share</td>
                        <td className="py-3 px-4 text-center">{partnershipTiers[0].revenueShare}%</td>
                        <td className="py-3 px-4 text-center">{partnershipTiers[1].revenueShare}%</td>
                        <td className="py-3 px-4 text-center">{partnershipTiers[2].revenueShare}%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">White-label Branding</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">API Access</td>
                        <td className="py-3 px-4 text-center">Limited</td>
                        <td className="py-3 px-4 text-center">✓</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Custom Development</td>
                        <td className="py-3 px-4 text-center">✗</td>
                        <td className="py-3 px-4 text-center">Limited</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-900">Dedicated Support</td>
                        <td className="py-3 px-4 text-center">✗</td>
                        <td className="py-3 px-4 text-center">✗</td>
                        <td className="py-3 px-4 text-center">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Sharing Calculator</CardTitle>
                <CardDescription>Estimate potential revenue from partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Partners
                      </label>
                      <input 
                        type="number" 
                        defaultValue="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Users per Partner
                      </label>
                      <input 
                        type="number" 
                        defaultValue="500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Average Revenue per User
                      </label>
                      <input 
                        type="number" 
                        defaultValue="50"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revenue Share Percentage
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="20">20%</option>
                        <option value="25">25%</option>
                        <option value="30">30%</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Estimated Monthly Revenue</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(5 * 500 * 50 * 0.25)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Based on current inputs
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {/* Partnership Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Partnership Applications</CardTitle>
              <CardDescription>Review and manage partnership applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(application.status)}`}></div>
                      <div>
                        <div className="font-medium">{application.companyName}</div>
                        <div className="text-sm text-gray-500">
                          {application.contactPerson} • {application.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          {application.companyType} • {application.estimatedUsers} users • {application.targetMarket}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Applied {new Date(application.submittedDate).toLocaleDateString()}
                        </div>
                        <Badge variant={application.status === 'approved' ? 'default' : 'secondary'}>
                          {application.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              Reject
                            </Button>
                          </>
                        )}
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