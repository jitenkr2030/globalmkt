'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  Settings,
  Download
} from 'lucide-react';

interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  usage: {
    apiCalls: number;
    apiLimit: number;
    aiAnalyses: number;
    aiLimit: number;
    dataExports: number;
    dataLimit: number;
  };
}

interface UsageStats {
  period: string;
  apiCalls: number;
  aiAnalyses: number;
  dataExports: number;
  cost: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  downloadUrl: string;
}

const mockSubscription: Subscription = {
  id: 'sub_123456789',
  plan: 'Professional',
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  usage: {
    apiCalls: 7500,
    apiLimit: 10000,
    aiAnalyses: 45,
    aiLimit: 100,
    dataExports: 8,
    dataLimit: 20
  }
};

const mockUsageStats: UsageStats[] = [
  { period: 'Jan 2024', apiCalls: 8500, aiAnalyses: 52, dataExports: 12, cost: 499 },
  { period: 'Dec 2023', apiCalls: 7200, aiAnalyses: 38, dataExports: 9, cost: 499 },
  { period: 'Nov 2023', apiCalls: 9100, aiAnalyses: 67, dataExports: 15, cost: 499 },
  { period: 'Oct 2023', apiCalls: 6800, aiAnalyses: 41, dataExports: 7, cost: 499 }
];

const mockInvoices: Invoice[] = [
  { id: 'inv_001', date: '2024-01-01', amount: 499, status: 'paid', downloadUrl: '/invoices/inv_001.pdf' },
  { id: 'inv_002', date: '2023-12-01', amount: 499, status: 'paid', downloadUrl: '/invoices/inv_002.pdf' },
  { id: 'inv_003', date: '2023-11-01', amount: 499, status: 'paid', downloadUrl: '/invoices/inv_003.pdf' }
];

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription>(mockSubscription);
  const [usageStats, setUsageStats] = useState<UsageStats[]>(mockUsageStats);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [loading, setLoading] = useState(false);

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleUpgradePlan = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Upgrade process initiated. You will be redirected to checkout.');
    }, 1000);
  };

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period.')) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: true }));
        setLoading(false);
      }, 1000);
    }
  };

  const handleReactivateSubscription = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubscription(prev => ({ ...prev, cancelAtPeriodEnd: false }));
      setLoading(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription Overview</span>
              </CardTitle>
              <CardDescription>Manage your subscription and billing information</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(subscription.status)}`}></div>
              <span className="text-sm font-medium capitalize">{subscription.status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Current Plan</div>
              <div className="text-2xl font-bold">{subscription.plan}</div>
              <div className="text-sm text-gray-600">$499/month</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Billing Period</div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Actions</div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleUpgradePlan}
                  disabled={loading}
                  size="sm"
                >
                  Upgrade Plan
                </Button>
                {subscription.cancelAtPeriodEnd ? (
                  <Button 
                    onClick={handleReactivateSubscription}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    Reactivate
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {subscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">Subscription Cancellation Scheduled</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                You can reactivate anytime before this date to maintain access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Usage Statistics</span>
          </CardTitle>
          <CardDescription>Monitor your resource usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Calls</span>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription.usage.apiCalls, subscription.usage.apiLimit))}`}>
                  {subscription.usage.apiCalls.toLocaleString()} / {subscription.usage.apiLimit.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(subscription.usage.apiCalls, subscription.usage.apiLimit)} 
                className="h-2"
              />
              <div className="text-xs text-gray-500">
                {getUsagePercentage(subscription.usage.apiCalls, subscription.usage.apiLimit)}% used
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">AI Analyses</span>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription.usage.aiAnalyses, subscription.usage.aiLimit))}`}>
                  {subscription.usage.aiAnalyses} / {subscription.usage.aiLimit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(subscription.usage.aiAnalyses, subscription.usage.aiLimit)} 
                className="h-2"
              />
              <div className="text-xs text-gray-500">
                {getUsagePercentage(subscription.usage.aiAnalyses, subscription.usage.aiLimit)}% used
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data Exports</span>
                <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(subscription.usage.dataExports, subscription.usage.dataLimit))}`}>
                  {subscription.usage.dataExports} / {subscription.usage.dataLimit}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(subscription.usage.dataExports, subscription.usage.dataLimit)} 
                className="h-2"
              />
              <div className="text-xs text-gray-500">
                {getUsagePercentage(subscription.usage.dataExports, subscription.usage.dataLimit)}% used
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="usage" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="usage">Usage History</TabsTrigger>
              <TabsTrigger value="billing">Billing History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">API Calls</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">AI Analyses</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Data Exports</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageStats.map((stat, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 font-medium text-gray-900">{stat.period}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{stat.apiCalls.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{stat.aiAnalyses}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{stat.dataExports}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">${stat.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="billing" className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Invoice ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4 font-medium text-gray-900">{invoice.id}</td>
                        <td className="py-3 px-4 text-gray-700">{formatDate(invoice.date)}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">${invoice.amount}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(invoice.downloadUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Common subscription management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CreditCard className="h-6 w-6" />
              <span>Update Payment Method</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Team Members</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Clock className="h-6 w-6" />
              <span>View Billing History</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <CheckCircle className="h-6 w-6" />
              <span>Download Receipts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}