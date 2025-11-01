'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gift, 
  Star, 
  Users, 
  TrendingUp, 
  Clock, 
  Zap, 
  Crown,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target
} from 'lucide-react';

interface FreemiumUser {
  id: string;
  email: string;
  plan: 'free' | 'trial' | 'paid';
  registrationDate: string;
  trialEnd?: string;
  usage: {
    apiCalls: number;
    aiAnalyses: number;
    dataExports: number;
    marketAccess: number;
  };
  features: {
    exchanges: number;
    dataDelay: string;
    support: string;
    alerts: number;
  };
  achievements: string[];
  referralCode: string;
  referrals: number;
}

interface ConversionTrigger {
  type: 'usage_limit' | 'feature_request' | 'trial_expiry' | 'referral_bonus';
  message: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReferralProgram {
  code: string;
  referrals: number;
  credits: number;
  rewards: Array<{
    type: string;
    value: number;
    claimed: boolean;
  }>;
}

const mockFreemiumUser: FreemiumUser = {
  id: 'user_123456',
  email: 'user@example.com',
  plan: 'free',
  registrationDate: '2024-01-01T00:00:00Z',
  usage: {
    apiCalls: 850,
    aiAnalyses: 4,
    dataExports: 2,
    marketAccess: 5
  },
  features: {
    exchanges: 5,
    dataDelay: '30 minutes',
    support: 'Community',
    alerts: 3
  },
  achievements: ['Early Adopter', 'Market Explorer'],
  referralCode: 'FREEMIUM2024',
  referrals: 3,
};

const conversionTriggers: ConversionTrigger[] = [
  {
    type: 'usage_limit',
    message: 'You\'ve used 85% of your monthly API calls. Upgrade to continue uninterrupted access.',
    action: 'Upgrade Now',
    priority: 'high'
  },
  {
    type: 'feature_request',
    message: 'Want real-time data? Professional plan offers live market data with no delays.',
    action: 'Explore Pro Features',
    priority: 'medium'
  },
  {
    type: 'referral_bonus',
    message: 'Refer 2 more friends and get 1 month of Professional plan free!',
    action: 'Refer Friends',
    priority: 'medium'
  }
];

const referralProgram: ReferralProgram = {
  code: 'FREEMIUM2024',
  referrals: 3,
  credits: 15,
  rewards: [
    { type: '1 month Pro', value: 1, claimed: false },
    { type: '5 extra AI analyses', value: 5, claimed: true },
    { type: 'Premium support', value: 1, claimed: false }
  ]
};

const featureComparison = [
  {
    feature: 'Global Exchanges',
    free: '5 major exchanges',
    pro: '32 global exchanges',
    enterprise: '32+ exchanges'
  },
  {
    feature: 'Data Latency',
    free: '30 minutes delay',
    pro: 'Real-time data',
    enterprise: 'Real-time + historical'
  },
  {
    feature: 'AI Analysis',
    free: '1 per month',
    pro: 'Unlimited',
    enterprise: 'Unlimited + custom models'
  },
  {
    feature: 'API Access',
    free: '1,000 calls/month',
    pro: '10,000 calls/month',
    enterprise: 'Unlimited'
  },
  {
    feature: 'Support',
    free: 'Community forum',
    pro: 'Priority support',
    enterprise: '24/7 dedicated support'
  },
  {
    feature: 'Mobile App',
    free: 'Basic features',
    pro: 'Full access',
    enterprise: 'White-label option'
  }
];

export default function FreemiumModel() {
  const [user, setUser] = useState<FreemiumUser>(mockFreemiumUser);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    // Generate referral link
    setReferralLink(`https://platform.com/ref/${user.referralCode}`);
  }, [user.referralCode]);

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUpgradeUrgency = () => {
    const apiUsage = getUsagePercentage(user.usage.apiCalls, 1000);
    const aiUsage = getUsagePercentage(user.usage.aiAnalyses, 1);
    
    if (apiUsage >= 90 || aiUsage >= 100) return 'critical';
    if (apiUsage >= 70) return 'high';
    return 'medium';
  };

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  const handleStartTrial = () => {
    setUser(prev => ({
      ...prev,
      plan: 'trial',
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    }));
    alert('14-day Professional trial started!');
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const daysUntilTrialEnd = () => {
    if (!user.trialEnd) return 0;
    const trialEnd = new Date(user.trialEnd);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* User Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5 text-purple-600" />
                <span>Freemium Account</span>
              </CardTitle>
              <CardDescription>Manage your free account and explore upgrade options</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={user.plan === 'free' ? 'secondary' : 'default'}>
                {user.plan === 'free' ? 'Free Plan' : user.plan === 'trial' ? 'Trial Active' : 'Professional'}
              </Badge>
              {user.plan === 'trial' && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {daysUntilTrialEnd()} days left
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{user.features.exchanges}</div>
              <div className="text-sm text-gray-600">Exchanges</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{user.usage.aiAnalyses}/1</div>
              <div className="text-sm text-gray-600">AI Analyses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{user.referrals}</div>
              <div className="text-sm text-gray-600">Referrals</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{user.achievements.length}</div>
              <div className="text-sm text-gray-600">Achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Upgrade Opportunities</span>
          </CardTitle>
          <CardDescription>Personalized recommendations based on your usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversionTriggers.map((trigger, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                trigger.priority === 'high' ? 'border-red-500 bg-red-50' :
                trigger.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className={`h-5 w-5 ${
                      trigger.priority === 'high' ? 'text-red-500' :
                      trigger.priority === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{trigger.message}</p>
                      <p className="text-sm text-gray-600">
                        {trigger.type === 'usage_limit' && 'Based on your current usage patterns'}
                        {trigger.type === 'feature_request' && 'Popular feature among professional traders'}
                        {trigger.type === 'trial_expiry' && 'Limited time offer'}
                        {trigger.type === 'referral_bonus' && 'Share with friends to unlock'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleUpgrade}
                    variant={trigger.priority === 'high' ? 'default' : 'outline'}
                    size="sm"
                  >
                    {trigger.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage Limits</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Usage Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>Track your resource consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Calls</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(user.usage.apiCalls, 1000))}`}>
                      {user.usage.apiCalls} / 1,000
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(user.usage.apiCalls, 1000)} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    {getUsagePercentage(user.usage.apiCalls, 1000)}% used
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Analyses</span>
                    <span className={`text-sm font-medium ${getUsageColor(getUsagePercentage(user.usage.aiAnalyses, 1))}`}>
                      {user.usage.aiAnalyses} / 1
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(user.usage.aiAnalyses, 1)} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500">
                    {getUsagePercentage(user.usage.aiAnalyses, 1)}% used
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
              <CardDescription>Unlock rewards as you use the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {user.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <div className="font-medium text-gray-900">{achievement}</div>
                      <div className="text-sm text-gray-600">Unlocked</div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg opacity-50">
                  <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="font-medium text-gray-700">Power User</div>
                    <div className="text-sm text-gray-500">Use 1000 API calls</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Limits</CardTitle>
              <CardDescription>Free plan limitations and upgrade benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Free Plan Limits</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Market Exchanges</span>
                        <span className="font-medium">{user.features.exchanges}/32</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Delay</span>
                        <span className="font-medium">{user.features.dataDelay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Analyses</span>
                        <span className="font-medium">{user.usage.aiAnalyses}/1 per month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Calls</span>
                        <span className="font-medium">{user.usage.apiCalls}/1,000 per month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support</span>
                        <span className="font-medium">{user.features.support}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Professional Plan Benefits</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Market Exchanges</span>
                        <span className="font-medium text-green-600">32/32</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Delay</span>
                        <span className="font-medium text-green-600">Real-time</span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Analyses</span>
                        <span className="font-medium text-green-600">Unlimited</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Calls</span>
                        <span className="font-medium text-green-600">10,000/month</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Support</span>
                        <span className="font-medium text-green-600">Priority</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">Ready to upgrade?</h4>
                      <p className="text-blue-700 text-sm">Unlock all features and remove limitations</p>
                    </div>
                    <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Referral Program</span>
              </CardTitle>
              <CardDescription>Invite friends and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{referralProgram.referrals}</div>
                    <div className="text-sm text-gray-600">Successful Referrals</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{referralProgram.credits}</div>
                    <div className="text-sm text-gray-600">Credits Earned</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {referralProgram.rewards.filter(r => !r.claimed).length}
                    </div>
                    <div className="text-sm text-gray-600">Available Rewards</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Your Referral Link</span>
                    <Button onClick={handleCopyReferralLink} variant="outline" size="sm">
                      Copy Link
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded border font-mono text-sm break-all">
                    {referralLink}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Available Rewards</h4>
                  <div className="space-y-2">
                    {referralProgram.rewards.map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex items-center space-x-3">
                          {reward.claimed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Gift className="h-5 w-5 text-purple-600" />
                          )}
                          <div>
                            <div className="font-medium">{reward.type}</div>
                            <div className="text-sm text-gray-600">
                              {reward.type === '1 month Pro' && '1 month of Professional plan'}
                              {reward.type === '5 extra AI analyses' && '5 additional AI analyses'}
                              {reward.type === 'Premium support' && 'Priority support access'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {reward.claimed ? (
                            <Badge variant="secondary">Claimed</Badge>
                          ) : (
                            <Button size="sm" disabled={referralProgram.referrals < 5}>
                              Claim Reward
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upgrade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Options</CardTitle>
              <CardDescription>Choose the perfect plan for your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Professional Plan</h3>
                      <Badge>Most Popular</Badge>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">$499</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>32 global exchanges</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Real-time data</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Unlimited AI analyses</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>10,000 API calls/month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                    <Button onClick={handleUpgrade} className="w-full">
                      Upgrade to Professional
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Enterprise Plan</h3>
                      <Crown className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">$2,999</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Everything in Professional</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Unlimited API access</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Custom AI models</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>White-label options</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>24/7 dedicated support</span>
                      </li>
                    </ul>
                    <Button onClick={handleUpgrade} variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </div>
                </div>
                
                {user.plan === 'free' && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-purple-900">Try Professional Free</h4>
                        <p className="text-purple-700 text-sm">14-day trial with full access to all features</p>
                      </div>
                      <Button onClick={handleStartTrial} className="bg-purple-600 hover:bg-purple-700">
                        Start Free Trial
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}