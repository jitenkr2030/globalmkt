import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Building, Users, Shield, Zap, Globe, CheckCircle, Star, ArrowRight, Phone, Mail, Calendar, Clock, Award, Settings, TrendingUp, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function EnterprisePage() {
  const enterpriseFeatures = [
    {
      title: 'Dedicated Infrastructure',
      description: 'Private cloud infrastructure with guaranteed uptime and performance',
      icon: Building,
      benefits: ['99.99% uptime SLA', 'Dedicated servers', 'Custom deployment options']
    },
    {
      title: 'Advanced Security',
      description: 'Enterprise-grade security with SOC 2 compliance and advanced threat protection',
      icon: Shield,
      benefits: ['SOC 2 Type II certified', 'End-to-end encryption', 'Advanced threat detection']
    },
    {
      title: 'Scalable Architecture',
      description: 'Handle millions of transactions with our scalable, high-performance platform',
      icon: Zap,
      benefits: ['Unlimited scalability', 'High-frequency trading support', 'Low latency execution']
    },
    {
      title: 'Global Market Access',
      description: 'Access to 100+ exchanges worldwide with institutional-grade data feeds',
      icon: Globe,
      benefits: ['100+ global exchanges', 'Institutional data feeds', 'Cross-border trading']
    }
  ];

  const solutions = [
    {
      title: 'Hedge Funds',
      description: 'Advanced trading tools and analytics for quantitative trading strategies',
      features: ['Real-time analytics', 'Risk management', 'Portfolio optimization', 'Backtesting'],
      icon: TrendingUp
    },
    {
      title: 'Investment Banks',
      description: 'Comprehensive platform for institutional trading and market making',
      features: ['Market making tools', 'Compliance reporting', 'Risk analytics', 'Client portals'],
      icon: Building
    },
    {
      title: 'Asset Managers',
      description: 'Portfolio management and analytics for large-scale asset management',
      features: ['Portfolio analytics', 'Performance attribution', 'Risk monitoring', 'Client reporting'],
      icon: BarChart3
    },
    {
      title: 'Proprietary Trading Firms',
      description: 'High-performance trading infrastructure and execution systems',
      features: ['Low latency trading', 'Co-location services', 'Advanced order types', 'Market data feeds'],
      icon: Zap
    }
  ];

  const successStories = [
    {
      company: 'Global Alpha Fund',
      industry: 'Hedge Fund',
      challenge: 'Needed real-time analytics across multiple asset classes',
      solution: 'Implemented our enterprise platform with custom AI models',
      results: '35% improvement in trading performance, 50% reduction in analysis time',
      logo: 'GA'
    },
    {
      company: 'Morgan Capital',
      industry: 'Investment Bank',
      challenge: 'Required cross-border trading capabilities with advanced risk management',
      solution: 'Deployed our enterprise solution with custom compliance modules',
      results: 'Expanded to 15 new markets, 40% increase in trading volume',
      logo: 'MC'
    },
    {
      company: 'Quantum Asset Management',
      industry: 'Asset Management',
      challenge: 'Needed scalable portfolio analytics for $50B in assets',
      solution: 'Enterprise platform with custom reporting and analytics',
      results: 'Improved client reporting efficiency by 60%, enhanced risk monitoring',
      logo: 'QA'
    }
  ];

  const supportOptions = [
    {
      title: 'Dedicated Account Manager',
      description: 'Personal account manager with deep platform expertise',
      icon: Users,
      availability: '24/7'
    },
    {
      title: 'Technical Support Team',
      description: 'Expert technical team for integration and development support',
      icon: Settings,
      availability: '24/7'
    },
    {
      title: 'Implementation Team',
      description: 'Specialized team for smooth onboarding and deployment',
      icon: CheckCircle,
      availability: 'Business hours'
    },
    {
      title: 'Training Programs',
      description: 'Comprehensive training for your team on platform features',
      icon: Award,
      availability: 'Scheduled'
    }
  ];

  const pricingTiers = [
    {
      name: 'Enterprise Basic',
      price: 'Custom',
      description: 'Essential enterprise features for growing institutions',
      features: [
        'Core platform access',
        'Standard market data',
        'Basic analytics',
        'Email support',
        'Standard security'
      ],
      popular: false
    },
    {
      name: 'Enterprise Pro',
      price: 'Custom',
      description: 'Advanced features for established institutions',
      features: [
        'All Basic features',
        'Advanced analytics',
        'Real-time data feeds',
        'Priority support',
        'Custom integrations',
        'Advanced security'
      ],
      popular: true
    },
    {
      name: 'Enterprise Elite',
      price: 'Custom',
      description: 'Complete solution for large-scale operations',
      features: [
        'All Pro features',
        'Dedicated infrastructure',
        'Custom development',
        'White-label options',
        'SLA guarantees',
        'Premium support'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Enterprise Solutions</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Enterprise-Grade Trading
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Infrastructure
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for institutions that demand the highest levels of performance, security, 
            and reliability in global trading operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" className="px-8">
              Schedule Demo
            </Button>
            <Button size="lg" variant="outline" className="px-8">
              Contact Sales
            </Button>
          </div>
        </div>

        {/* Enterprise Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Enterprise?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Industry Solutions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Industry Solutions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <solution.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{solution.title}</CardTitle>
                  <CardDescription>{solution.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Key Features:</h4>
                    <ul className="space-y-1">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mb-4">
                    {story.logo}
                  </div>
                  <CardTitle className="text-lg">{story.company}</CardTitle>
                  <CardDescription>{story.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Challenge</h4>
                      <p className="text-sm text-gray-600">{story.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Solution</h4>
                      <p className="text-sm text-gray-600">{story.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Results</h4>
                      <p className="text-sm text-green-600 font-medium">{story.results}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise Support */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Enterprise Support</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {supportOptions.map((support, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <support.icon className="h-6 w-6 text-blue-600" />
                    <span>{support.title}</span>
                  </CardTitle>
                  <CardDescription>{support.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Availability</span>
                    <Badge variant="outline">{support.availability}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Enterprise Pricing</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Custom pricing tailored to your institution's specific needs and requirements
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{tier.price}</div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={tier.popular ? 'default' : 'outline'}>
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Implementation Process */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Implementation Process</CardTitle>
            <CardDescription>
              Our proven methodology for successful enterprise deployments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                  1
                </div>
                <h3 className="font-semibold mb-2">Discovery</h3>
                <p className="text-sm text-gray-600">Requirements analysis and solution design</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                  2
                </div>
                <h3 className="font-semibold mb-2">Planning</h3>
                <p className="text-sm text-gray-600">Project roadmap and timeline development</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                  3
                </div>
                <h3 className="font-semibold mb-2">Implementation</h3>
                <p className="text-sm text-gray-600">Platform deployment and integration</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 mx-auto mb-3">
                  4
                </div>
                <h3 className="font-semibold mb-2">Optimization</h3>
                <p className="text-sm text-gray-600">Performance tuning and ongoing support</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Transform Your Trading Operations?</CardTitle>
            <CardDescription>
              Let our enterprise team help you design the perfect solution for your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Our Enterprise Team</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>enterprise@globalmarkets.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>+1 (555) 123-4568</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Schedule a Consultation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get a personalized demo and discuss your specific requirements with our experts
                </p>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Leading Institutions</h2>
          <p className="text-xl mb-8 opacity-90">
            Partner with Global Markets to power your institutional trading operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Enterprise Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Download Enterprise Guide
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}