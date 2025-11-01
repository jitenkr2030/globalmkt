'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ArrowRight } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  targetAudience: string;
  highlight?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 99,
    period: 'month',
    description: 'Perfect for individual traders and small investors',
    features: [
      'Access to 10 major exchanges',
      '15-minute delayed market data',
      'Basic trading hours analysis',
      '5 AI analyses per month',
      'Email support',
      'Basic reporting tools',
      'Mobile app access'
    ],
    targetAudience: 'Individual Traders, Small Investors',
    cta: 'Start Free Trial'
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 499,
    period: 'month',
    description: 'For professional traders and small trading firms',
    features: [
      'Access to all 32 global exchanges',
      'Real-time market data streaming',
      'Advanced trading hours optimization',
      'Unlimited AI analysis and predictions',
      'Risk assessment tools',
      'Priority email and chat support',
      'Advanced reporting and analytics',
      'API access (10,000 calls/month)',
      'Custom alerts and notifications',
      'Historical data access (1 year)'
    ],
    popular: true,
    highlight: 'Most Popular',
    targetAudience: 'Professional Traders, Small Firms',
    cta: 'Start Free Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 2999,
    period: 'month',
    description: 'Comprehensive solution for financial institutions',
    features: [
      'Everything in Professional plan',
      'Unlimited API access',
      'Custom AI model training',
      'White-label options',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integration support',
      'Advanced security features',
      'Compliance reporting',
      'On-site training',
      'SLA guarantees (99.99% uptime)',
      'Historical data access (10+ years)',
      'Custom development support'
    ],
    targetAudience: 'Financial Institutions, Large Corporations',
    cta: 'Contact Sales',
    highlight: 'Enterprise Grade'
  }
];

interface FeatureComparison {
  feature: string;
  basic: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const featureComparison: FeatureComparison[] = [
  { feature: 'Global Exchanges', basic: '10', professional: '32', enterprise: '32+' },
  { feature: 'Data Latency', basic: '15 min delay', professional: 'Real-time', enterprise: 'Real-time' },
  { feature: 'AI Analysis', basic: '5/month', professional: 'Unlimited', enterprise: 'Unlimited + Custom' },
  { feature: 'API Access', basic: 'None', professional: '10K calls/month', enterprise: 'Unlimited' },
  { feature: 'Support', basic: 'Email', professional: 'Priority Email/Chat', enterprise: '24/7 Phone + Dedicated' },
  { feature: 'Historical Data', basic: '1 month', professional: '1 year', enterprise: '10+ years' },
  { feature: 'Custom Integrations', basic: '❌', professional: '❌', enterprise: '✅' },
  { feature: 'White-label', basic: '❌', professional: '❌', enterprise: '✅' },
  { feature: 'SLA Guarantee', basic: '❌', professional: '99.9%', enterprise: '99.99%' },
  { feature: 'Compliance Support', basic: 'Basic', professional: 'Standard', enterprise: 'Advanced' }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getAnnualPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.85); // 15% discount for annual
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    // Here you would typically handle the checkout process
    console.log(`Selected plan: ${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your trading needs. All plans include access to our powerful AI-powered market analysis tools.
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg font-medium ${billingCycle === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
            </button>
            <span className={`text-lg font-medium ${billingCycle === 'annual' ? 'text-blue-600' : 'text-gray-500'}`}>
              Annual <span className="text-sm text-green-600 font-normal">(Save 15%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl' : 'border-gray-200'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {plan.highlight}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${billingCycle === 'monthly' ? plan.price : getAnnualPrice(plan.price)}
                  </span>
                  <span className="text-gray-600 font-medium">
                    /{billingCycle === 'monthly' ? plan.period : 'year'}
                  </span>
                </div>
                <CardDescription className="text-gray-600 mb-4">
                  {plan.description}
                </CardDescription>
                <div className="text-sm text-gray-500 mb-4">
                  <strong>Perfect for:</strong> {plan.targetAudience}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'} text-white font-medium py-3`}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Feature Comparison
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Basic</th>
                    <th className="text-center py-4 px-4 font-semibold text-blue-600">Professional</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-gray-700">{row.basic}</td>
                      <td className="py-4 px-4 text-center text-blue-600 font-medium">{row.professional}</td>
                      <td className="py-4 px-4 text-center text-gray-700">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can I change plans later?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for enterprise customers.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a long-term contract?</h3>
              <p className="text-gray-600">No, all plans are month-to-month. You can cancel anytime without penalty. Annual plans offer a 15% discount.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer discounts for non-profits or educational institutions?</h3>
              <p className="text-gray-600">Yes, we offer special pricing for educational institutions and non-profit organizations. Contact our sales team for details.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-6 opacity-90">Join thousands of traders who are already using our platform to gain a competitive edge.</p>
            <div className="space-x-4">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}