import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { HelpCircle, BookOpen, MessageCircle, Phone, Mail, Search, Video, FileText, Users, Clock, ArrowRight, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Learn the basics and set up your account',
      articles: [
        'Creating Your Account',
        'Platform Overview',
        'Setting Up Your Profile',
        'Understanding the Dashboard',
        'First Trade Tutorial'
      ]
    },
    {
      title: 'Trading Features',
      icon: TrendingUp,
      description: 'Master our trading tools and features',
      articles: [
        'Market Data Access',
        'Trading Sessions Analysis',
        'Currency Conversion',
        'AI Integration Tools',
        'Performance Analytics'
      ]
    },
    {
      title: 'Account Management',
      icon: Users,
      description: 'Manage your account and settings',
      articles: [
        'Account Settings',
        'Subscription Management',
        'Payment Methods',
        'Security Settings',
        'Data Preferences'
      ]
    },
    {
      title: 'Technical Support',
      icon: Settings,
      description: 'Resolve technical issues and errors',
      articles: [
        'Connection Issues',
        'Data Loading Problems',
        'Mobile App Troubleshooting',
        'Browser Compatibility',
        'Performance Optimization'
      ]
    }
  ];

  const quickActions = [
    {
      title: 'Live Chat',
      icon: MessageCircle,
      description: 'Chat with our support team',
      action: 'Start Chat',
      available: true
    },
    {
      title: 'Phone Support',
      icon: Phone,
      description: 'Speak with a support agent',
      action: 'Call Now',
      available: true
    },
    {
      title: 'Email Support',
      icon: Mail,
      description: 'Send us a detailed message',
      action: 'Send Email',
      available: true
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      description: 'Watch helpful video guides',
      action: 'Watch Now',
      available: true
    }
  ];

  const popularArticles = [
    {
      title: 'How to set up your first trade',
      category: 'Getting Started',
      views: 15420,
      helpful: 98
    },
    {
      title: 'Understanding market data feeds',
      category: 'Trading Features',
      views: 12350,
      helpful: 95
    },
    {
      title: 'Troubleshooting connection issues',
      category: 'Technical Support',
      views: 9870,
      helpful: 92
    },
    {
      title: 'Managing your subscription',
      category: 'Account Management',
      views: 8650,
      helpful: 89
    },
    {
      title: 'Using AI-powered analytics',
      category: 'Trading Features',
      views: 7430,
      helpful: 94
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Help Center</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How Can We
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Help You?
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions, explore our knowledge base, or get in touch with 
            our support team for personalized assistance.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-16">
          <CardContent className="pt-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for help articles, guides, and answers..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get Help Now</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <action.icon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled={!action.available}>
                    {action.action}
                  </Button>
                  {!action.available && (
                    <p className="text-xs text-gray-500 mt-2">Coming soon</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse Help Categories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <category.icon className="h-6 w-6 text-blue-600" />
                    <span>{category.title}</span>
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="text-sm">{article}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Help Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{article.category}</Badge>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">👍 {article.helpful}%</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{article.views.toLocaleString()} views</span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support Hours */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <span>Support Availability</span>
            </CardTitle>
            <CardDescription>
              Our support team is available to help you during these hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-2">24/7 Availability</p>
                <Badge variant="default" className="bg-green-600">Always Online</Badge>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-2">Mon-Fri, 9AM-6PM EST</p>
                <Badge variant="default" className="bg-blue-600">Business Hours</Badge>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-gray-600 mb-2">24-48 Hour Response</p>
                <Badge variant="default" className="bg-purple-600">Quick Response</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Quick answers to common questions about our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">How do I create an account?</h3>
                <p className="text-gray-600">
                  Creating an account is simple. Click the "Get Started" button on our homepage, 
                  fill in your email address and create a password, and verify your email. 
                  The entire process takes less than 2 minutes.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">What exchanges are available on the platform?</h3>
                <p className="text-gray-600">
                  We provide access to 40+ global exchanges across 6 continents, including major 
                  exchanges like NYSE, NASDAQ, LSE, TSE, HKEX, and many more. You can view the 
                  complete list in our platform dashboard.
                </p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">How accurate is the market data?</h3>
                <p className="text-gray-600">
                  Our market data is sourced directly from exchanges with millisecond latency. 
                  While we strive for 100% accuracy, we recommend verifying critical information 
                  with official exchange sources.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time from your account settings. 
                  You'll continue to have access until the end of your current billing period.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>support@globalmarkets.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Response Times</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Live Chat:</span>
                    <span className="text-green-600">Immediate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-blue-600">24-48 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-purple-600">During business hours</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of traders who are already using our platform with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}