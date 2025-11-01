'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  BarChart3, 
  Target,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Download,
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonusCredits: number;
  popular?: boolean;
  description: string;
  features: string[];
}

interface UsageRecord {
  id: string;
  type: 'basic_analysis' | 'advanced_analysis' | 'portfolio_analysis' | 'api_call' | 'data_export';
  description: string;
  creditsUsed: number;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending';
  result?: any;
}

interface CreditBalance {
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  resetDate: string;
  autoRecharge: boolean;
  rechargeThreshold: number;
}

interface PricingTier {
  type: string;
  credits: number;
  price: number;
  description: string;
  useCase: string;
  roi: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 10,
    bonusCredits: 10,
    description: 'Perfect for occasional analysis',
    features: ['Basic AI analysis', 'Standard API access', 'Email support']
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 45,
    bonusCredits: 75,
    popular: true,
    description: 'Ideal for active traders',
    features: ['Advanced AI analysis', 'Priority API access', 'Chat support', 'Advanced analytics']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    price: 85,
    bonusCredits: 200,
    description: 'For power users and institutions',
    features: ['All analysis types', 'Unlimited API access', '24/7 support', 'Custom integrations']
  }
];

const pricingTiers: PricingTier[] = [
  {
    type: 'Basic Analysis',
    credits: 1,
    price: 0.10,
    description: 'Standard market prediction and trend analysis',
    useCase: 'Quick market insights and basic predictions',
    roi: 'Save 2-3 hours of research time'
  },
  {
    type: 'Advanced Analysis',
    credits: 3,
    price: 0.30,
    description: 'Comprehensive analysis with risk assessment',
    useCase: 'Detailed investment decisions and risk management',
    roi: 'Save 5-8 hours of analysis time'
  },
  {
    type: 'Portfolio Analysis',
    credits: 5,
    price: 0.50,
    description: 'Multi-asset portfolio optimization',
    useCase: 'Portfolio rebalancing and optimization',
    roi: 'Save 10-15 hours of portfolio management'
  },
  {
    type: 'API Calls',
    credits: 0.1,
    price: 0.01,
    description: 'Real-time data access via API',
    useCase: 'Integration with trading systems',
    roi: 'Automate data collection and analysis'
  },
  {
    type: 'Data Export',
    credits: 2,
    price: 0.20,
    description: 'Export historical data and reports',
    useCase: 'Custom reporting and analysis',
    roi: 'Professional-grade data export'
  }
];

const mockUsageRecords: UsageRecord[] = [
  {
    id: 'usage_001',
    type: 'basic_analysis',
    description: 'NYSE market prediction',
    creditsUsed: 1,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'completed',
    result: { prediction: 'bullish', confidence: 0.85 }
  },
  {
    id: 'usage_002',
    type: 'advanced_analysis',
    description: 'Tech sector risk assessment',
    creditsUsed: 3,
    timestamp: '2024-01-15T14:45:00Z',
    status: 'completed',
    result: { riskLevel: 'medium', mitigation: ['diversify', 'hedge'] }
  },
  {
    id: 'usage_003',
    type: 'portfolio_analysis',
    description: 'Retirement portfolio optimization',
    creditsUsed: 5,
    timestamp: '2024-01-16T09:15:00Z',
    status: 'completed',
    result: { optimization: 'balanced', expectedReturn: 0.08 }
  },
  {
    id: 'usage_004',
    type: 'api_call',
    description: 'Real-time market data fetch',
    creditsUsed: 0.1,
    timestamp: '2024-01-16T11:20:00Z',
    status: 'completed'
  }
];

const mockCreditBalance: CreditBalance = {
  totalCredits: 585.1,
  usedCredits: 14.1,
  remainingCredits: 571,
  resetDate: '2024-02-15T00:00:00Z',
  autoRecharge: true,
  rechargeThreshold: 100
};

export default function PayPerUseModel() {
  const [creditBalance, setCreditBalance] = useState<CreditBalance>(mockCreditBalance);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>(mockUsageRecords);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const getUsagePercentage = () => {
    return Math.round((creditBalance.usedCredits / creditBalance.totalCredits) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'basic_analysis': return <Brain className="h-4 w-4" />;
      case 'advanced_analysis': return <BarChart3 className="h-4 w-4" />;
      case 'portfolio_analysis': return <Target className="h-4 w-4" />;
      case 'api_call': return <Zap className="h-4 w-4" />;
      case 'data_export': return <Download className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handlePurchaseCredits = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPurchaseModal(true);
  };

  const handlePurchaseConfirm = () => {
    const selectedPack = creditPackages.find(p => p.id === selectedPackage);
    if (selectedPack) {
      setCreditBalance(prev => ({
        ...prev,
        totalCredits: prev.totalCredits + selectedPack.credits + selectedPack.bonusCredits,
        remainingCredits: prev.remainingCredits + selectedPack.credits + selectedPack.bonusCredits
      }));
      setShowPurchaseModal(false);
      alert(`Successfully purchased ${selectedPack.name}!`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedSavings = () => {
    const basicAnalysisCount = usageRecords.filter(r => r.type === 'basic_analysis').length;
    const advancedAnalysisCount = usageRecords.filter(r => r.type === 'advanced_analysis').length;
    const portfolioAnalysisCount = usageRecords.filter(r => r.type === 'portfolio_analysis').length;
    
    return (basicAnalysisCount * 2) + (advancedAnalysisCount * 5) + (portfolioAnalysisCount * 10);
  };

  return (
    <div className="space-y-6">
      {/* Credit Balance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Credit Balance</span>
              </CardTitle>
              <CardDescription>Manage your pay-per-use credits and usage</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={creditBalance.autoRecharge ? 'default' : 'secondary'}>
                {creditBalance.autoRecharge ? 'Auto-recharge ON' : 'Auto-recharge OFF'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {creditBalance.remainingCredits.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Credits Available</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {creditBalance.usedCredits.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Credits Used</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {creditBalance.totalCredits.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Total Credits</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                ${getEstimatedSavings()}
              </div>
              <div className="text-sm text-gray-600">Estimated Savings</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Usage This Period</span>
              <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage())}`}>
                {getUsagePercentage()}% used
              </span>
            </div>
            <Progress 
              value={getUsagePercentage()} 
              className="h-3"
            />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Resets on {new Date(creditBalance.resetDate).toLocaleDateString()}</span>
              <span>Auto-recharge at {creditBalance.rechargeThreshold} credits</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Pay-Per-Use Pricing</span>
          </CardTitle>
          <CardDescription>Flexible pricing based on your actual usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricingTiers.map((tier, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{tier.type}</h3>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{tier.credits} credits</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600 mb-2">
                  ${tier.price.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                <div className="text-xs text-gray-500 mb-3">
                  <strong>Use Case:</strong> {tier.useCase}
                </div>
                <div className="text-xs text-green-600 font-medium">
                  {tier.roi}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Credit Packages</span>
          </CardTitle>
          <CardDescription>Purchase credit packages for better value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg) => (
              <div key={pkg.id} className={`border rounded-lg p-6 ${pkg.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    {pkg.credits} credits + {pkg.bonusCredits} bonus
                  </div>
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Save ${((pkg.credits + pkg.bonusCredits) * 0.1 - pkg.price).toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => handlePurchaseCredits(pkg.id)}
                  className={`w-full ${pkg.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
                >
                  Purchase Package
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage History and Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usage">Usage History</TabsTrigger>
          <TabsTrigger value="management">Credit Management</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Usage</CardTitle>
              <CardDescription>Track your credit consumption and analysis results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageRecords.map((record, index) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(record.status)}`}></div>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(record.type)}
                        <div>
                          <div className="font-medium text-gray-900">{record.description}</div>
                          <div className="text-sm text-gray-500">{formatDate(record.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{record.creditsUsed} credits</div>
                        <div className="text-sm text-gray-500">${(record.creditsUsed * 0.1).toFixed(2)}</div>
                      </div>
                      {record.result && (
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Recharge Settings</CardTitle>
              <CardDescription>Configure automatic credit recharging</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Auto-Recharge</div>
                    <div className="text-sm text-gray-600">
                      Automatically purchase credits when balance is low
                    </div>
                  </div>
                  <Button 
                    variant={creditBalance.autoRecharge ? 'default' : 'outline'}
                    onClick={() => setCreditBalance(prev => ({ ...prev, autoRecharge: !prev.autoRecharge }))}
                  >
                    {creditBalance.autoRecharge ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Recharge Threshold</div>
                    <div className="text-sm text-gray-600">
                      Minimum credit balance before auto-recharge
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCreditBalance(prev => ({ 
                        ...prev, 
                        rechargeThreshold: Math.max(10, prev.rechargeThreshold - 10) 
                      }))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-medium w-12 text-center">{creditBalance.rechargeThreshold}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCreditBalance(prev => ({ 
                        ...prev, 
                        rechargeThreshold: Math.min(500, prev.rechargeThreshold + 10) 
                      }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">Pro Tip</div>
                      <div className="text-sm text-blue-700">
                        Enable auto-recharge to ensure uninterrupted access to analysis features, 
                        especially during active trading periods.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Modal (simplified) */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Purchase</h3>
            {selectedPackage && (
              <div className="space-y-4">
                {(() => {
                  const pkg = creditPackages.find(p => p.id === selectedPackage);
                  return pkg ? (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{pkg.name}</div>
                        <div className="text-lg">${pkg.price}</div>
                        <div className="text-sm text-gray-600">
                          {pkg.credits} credits + {pkg.bonusCredits} bonus credits
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between mb-2">
                          <span>Subtotal:</span>
                          <span>${pkg.price}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>${pkg.price}</span>
                        </div>
                      </div>
                    </>
                  ) : null;
                })()}
                <div className="flex space-x-2">
                  <Button onClick={handlePurchaseConfirm} className="flex-1">
                    Confirm Purchase
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}