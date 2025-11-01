import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { BookOpen, Code, Database, Settings, Users, Zap, Shield, Globe, FileText, Download, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const docSections = [
    {
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Quick start guides and platform overview',
      articles: [
        { title: 'Installation Guide', level: 'Beginner', readTime: '5 min', href: '#installation' },
        { title: 'Platform Overview', level: 'Beginner', readTime: '10 min', href: '#overview' },
        { title: 'First Trade Tutorial', level: 'Beginner', readTime: '15 min', href: '#first-trade' },
        { title: 'Account Setup', level: 'Beginner', readTime: '8 min', href: '#account-setup' }
      ]
    },
    {
      title: 'API Reference',
      icon: Code,
      description: 'Complete API documentation and examples',
      articles: [
        { title: 'Authentication', level: 'Intermediate', readTime: '12 min', href: '#auth' },
        { title: 'Market Data API', level: 'Intermediate', readTime: '20 min', href: '#market-data' },
        { title: 'Trading API', level: 'Advanced', readTime: '25 min', href: '#trading' },
        { title: 'WebSocket Streams', level: 'Advanced', readTime: '18 min', href: '#websocket' }
      ]
    },
    {
      title: 'Data Integration',
      icon: Database,
      description: 'Connect and work with market data',
      articles: [
        { title: 'Data Sources', level: 'Intermediate', readTime: '15 min', href: '#data-sources' },
        { title: 'Real-time Feeds', level: 'Advanced', readTime: '22 min', href: '#realtime' },
        { title: 'Historical Data', level: 'Intermediate', readTime: '18 min', href: '#historical' },
        { title: 'Data Processing', level: 'Advanced', readTime: '20 min', href: '#processing' }
      ]
    },
    {
      title: 'Configuration',
      icon: Settings,
      description: 'Platform setup and customization',
      articles: [
        { title: 'Environment Setup', level: 'Beginner', readTime: '10 min', href: '#env-setup' },
        { title: 'Custom Indicators', level: 'Intermediate', readTime: '16 min', href: '#custom-indicators' },
        { title: 'Alert Configuration', level: 'Intermediate', readTime: '12 min', href: '#alerts' },
        { title: 'Performance Tuning', level: 'Advanced', readTime: '25 min', href: '#performance' }
      ]
    }
  ];

  const quickStarts = [
    {
      title: 'JavaScript/Node.js',
      icon: Code,
      description: 'Build trading applications with JavaScript',
      language: 'javascript',
      setupTime: '5 minutes',
      href: '#js-quickstart'
    },
    {
      title: 'Python',
      icon: Code,
      description: 'Data analysis and trading with Python',
      language: 'python',
      setupTime: '3 minutes',
      href: '#python-quickstart'
    },
    {
      title: 'REST API',
      icon: ExternalLink,
      description: 'Direct API integration examples',
      language: 'api',
      setupTime: '2 minutes',
      href: '#api-quickstart'
    },
    {
      title: 'WebSocket',
      icon: Zap,
      description: 'Real-time data streaming setup',
      language: 'websocket',
      setupTime: '5 minutes',
      href: '#websocket-quickstart'
    }
  ];

  const gettingStartedGuides = [
    {
      title: 'Your First Application',
      description: 'Build your first trading application in minutes',
      steps: ['Install the SDK', 'Authenticate', 'Fetch market data', 'Place a trade'],
      difficulty: 'Beginner',
      time: '15 minutes'
    },
    {
      title: 'Real-time Data Dashboard',
      description: 'Create a live market data dashboard',
      steps: ['Set up WebSocket', 'Handle data streams', 'Build UI components', 'Add interactivity'],
      difficulty: 'Intermediate',
      time: '30 minutes'
    },
    {
      title: 'Automated Trading Bot',
      description: 'Build an automated trading strategy',
      steps: ['Define strategy', 'Implement logic', 'Backtest', 'Deploy to production'],
      difficulty: 'Advanced',
      time: '45 minutes'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Documentation</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Developer
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Documentation
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guides, API references, and examples to help you integrate 
            with Global Markets and build powerful trading applications.
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Start Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStarts.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <guide.icon className="h-12 w-12 text-blue-600 mb-4" />
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Setup time:</span>
                      <span className="font-medium">{guide.setupTime}</span>
                    </div>
                    <Button className="w-full" size="sm">
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started Tutorials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Step-by-Step Tutorials</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {gettingStartedGuides.map((guide, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getLevelColor(guide.difficulty)}>
                      {guide.difficulty}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{guide.time}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">Steps:</h4>
                      <ul className="space-y-1">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="text-sm text-gray-600 flex items-center space-x-2">
                            <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">
                              {stepIndex + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full" size="sm">
                      Start Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Documentation Sections</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {docSections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <section.icon className="h-6 w-6 text-blue-600" />
                    <span>{section.title}</span>
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.articles.map((article, articleIndex) => (
                      <div key={articleIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{article.title}</div>
                          <div className="flex items-center space-x-3 mt-1">
                            <Badge variant="outline" className={`text-xs ${getLevelColor(article.level)}`}>
                              {article.level}
                            </Badge>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All {section.title} Docs
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* API Reference Overview */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-blue-600" />
              <span>API Reference Overview</span>
            </CardTitle>
            <CardDescription>
              Key endpoints and functionality available in our REST API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Market Data</h3>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">GET /markets</div>
                  <div className="text-gray-600">GET /markets/{'{id}'}/quotes</div>
                  <div className="text-gray-600">GET /markets/{'{id}'}/history</div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Trading</h3>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">POST /orders</div>
                  <div className="text-gray-600">GET /orders/{'{id}'}</div>
                  <div className="text-gray-600">DELETE /orders/{'{id}'}</div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Account</h3>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-600">GET /account</div>
                  <div className="text-gray-600">GET /account/balance</div>
                  <div className="text-gray-600">GET /account/positions</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full API Reference
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SDKs and Libraries */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <span>SDKs & Libraries</span>
            </CardTitle>
            <CardDescription>
              Official libraries and SDKs for popular programming languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🟨</div>
                <h3 className="font-semibold mb-1">JavaScript</h3>
                <p className="text-sm text-gray-600 mb-3">Node.js & Browser</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  npm
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🐍</div>
                <h3 className="font-semibold mb-1">Python</h3>
                <p className="text-sm text-gray-600 mb-3">3.8+</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  pip
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">☕</div>
                <h3 className="font-semibold mb-1">Java</h3>
                <p className="text-sm text-gray-600 mb-3">11+</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Maven
                </Button>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl mb-2">🔷</div>
                <h3 className="font-semibold mb-1">C#</h3>
                <p className="text-sm text-gray-600 mb-3">.NET 6+</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  NuGet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span>Code Examples</span>
            </CardTitle>
            <CardDescription>
              Ready-to-use code snippets for common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Fetch Market Data (JavaScript)</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`const GlobalMarkets = require('globalmarkets-sdk');

const client = new GlobalMarkets.Client({
  apiKey: 'your-api-key',
  secret: 'your-secret-key'
});

// Get real-time market data
async function getMarketData() {
  try {
    const data = await client.markets.getQuotes('AAPL');
    console.log('Current price:', data.price);
    console.log('Volume:', data.volume);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getMarketData();`}
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Place a Trade (Python)</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
{`import globalmarkets

# Initialize client
client = globalmarkets.Client(
    api_key='your-api-key',
    secret_key='your-secret-key'
)

# Place a market order
def place_trade():
    try:
        order = client.orders.create(
            symbol='AAPL',
            side='buy',
            quantity=100,
            order_type='market'
        )
        print(f"Order placed: {order.id}")
        return order
    except Exception as e:
        print(f"Error placing order: {e}")
        return None

# Execute the trade
order = place_trade()`}
                  </pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Building?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get your API key and start integrating with Global Markets today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Get API Key
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Join Developer Community
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}