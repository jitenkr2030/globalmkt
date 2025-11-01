import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FileText, Users, Shield, DollarSign, AlertTriangle, CheckCircle, Calendar, Scale } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
  const termsSections = [
    {
      title: 'Acceptance of Terms',
      icon: FileText,
      content: [
        {
          heading: 'Agreement',
          text: 'By accessing and using Global Markets ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'
        },
        {
          heading: 'Modifications',
          text: 'We reserve the right to modify these terms at any time. We will notify users of material changes through email or platform notifications. Continued use of the platform constitutes acceptance of modified terms.'
        },
        {
          heading: 'Age Requirement',
          text: 'You must be at least 18 years old to use our platform. By using Global Markets, you confirm that you meet this age requirement.'
        }
      ]
    },
    {
      title: 'Account Terms',
      icon: Users,
      content: [
        {
          heading: 'Account Creation',
          text: 'You must provide accurate and complete information when creating your account. You are responsible for maintaining the confidentiality of your account credentials.'
        },
        {
          heading: 'Account Security',
          text: 'You are solely responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.'
        },
        {
          heading: 'Account Termination',
          text: 'We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, or any other reason that jeopardizes platform integrity.'
        }
      ]
    },
    {
      title: 'Service Description',
      icon: Scale,
      content: [
        {
          heading: 'Platform Features',
          text: 'Global Markets provides access to real-time market data, trading analytics, AI-powered insights, and various trading tools across 40+ global exchanges.'
        },
        {
          heading: 'Data Accuracy',
          text: 'While we strive to provide accurate and timely information, we do not guarantee the completeness, accuracy, or reliability of market data or analytics.'
        },
        {
          heading: 'Service Availability',
          text: 'We endeavor to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance or experience outages beyond our control.'
        }
      ]
    },
    {
      title: 'Payment Terms',
      icon: DollarSign,
      content: [
        {
          heading: 'Subscription Plans',
          text: 'We offer various subscription plans with different features and pricing. All fees are billed in advance and are non-refundable except as expressly stated in our refund policy.'
        },
        {
          heading: 'Payment Methods',
          text: 'We accept major credit cards, bank transfers, and other payment methods as specified on our platform. You are responsible for providing valid payment information.'
        },
        {
          heading: 'Late Payments',
          text: 'Failure to pay fees when due may result in service suspension or termination. Late payments may be subject to interest charges.'
        }
      ]
    },
    {
      title: 'User Responsibilities',
      icon: Shield,
      content: [
        {
          heading: 'Compliance with Laws',
          text: 'You must comply with all applicable laws and regulations when using our platform, including securities laws, tax regulations, and anti-money laundering requirements.'
        },
        {
          heading: 'Prohibited Activities',
          text: 'You may not use the platform for illegal activities, market manipulation, unauthorized data scraping, or any activity that could harm the platform or other users.'
        },
        {
          heading: 'Intellectual Property',
          text: 'All content, features, and functionality on the platform are owned by Global Markets and are protected by intellectual property laws.'
        }
      ]
    },
    {
      title: 'Limitation of Liability',
      icon: AlertTriangle,
      content: [
        {
          heading: 'Disclaimer',
          text: 'The platform is provided "as is" without warranties of any kind. We do not guarantee that the platform will be error-free or uninterrupted.'
        },
        {
          heading: 'Limitation of Damages',
          text: 'Global Markets shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.'
        },
        {
          heading: 'Investment Disclaimer',
          text: 'Our platform provides tools and information for educational and analytical purposes. Past performance does not indicate future results. Trading involves substantial risk.'
        }
      ]
    }
  ];

  const keyPoints = [
    { icon: CheckCircle, title: 'Data Accuracy', text: 'Market data provided for informational purposes only' },
    { icon: CheckCircle, title: 'No Investment Advice', text: 'Platform does not provide personalized investment recommendations' },
    { icon: CheckCircle, title: 'Risk Disclosure', text: 'Trading financial markets involves significant risk' },
    { icon: CheckCircle, title: 'Privacy Protection', text: 'Your personal information is protected according to our Privacy Policy' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Terms of Service</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Terms of Service for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Global Markets
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These terms govern your use of the Global Markets platform. Please read them carefully 
            before accessing or using our services.
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Last updated: November 2024</span>
            </div>
          </div>
        </div>

        {/* Key Points Overview */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <span>Important Terms at a Glance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {keyPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <point.icon className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{point.title}</h3>
                    <p className="text-sm text-gray-600">{point.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Disclosure */}
        <Card className="mb-16 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span>Important Risk Disclosure</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="space-y-4">
                <p className="text-red-800 font-semibold">
                  Trading financial markets involves substantial risk and is not suitable for all investors.
                </p>
                <ul className="space-y-2 text-red-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>You could lose all of your invested capital</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Leverage can work against you as well as for you</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Past performance is not indicative of future results</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Only trade with money you can afford to lose</span>
                  </li>
                </ul>
                <p className="text-red-700 text-sm">
                  Global Markets provides analytical tools and market data for educational purposes. 
                  We do not provide personalized investment advice or guarantee trading results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Terms Sections */}
        <div className="space-y-12 mb-16">
          {termsSections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <section.icon className="h-8 w-8 text-blue-600" />
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-l-4 border-blue-200 pl-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.heading}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Governing Law */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Governing Law & Jurisdiction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                These Terms of Service shall be governed by and construed in accordance with the laws 
                of the State of New York, United States, without regard to its conflict of law principles.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Governing Law</h4>
                  <p className="text-sm text-gray-600">Laws of New York State, USA</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Jurisdiction</h4>
                  <p className="text-sm text-gray-600">Federal and State Courts of New York</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Resolution */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                We believe in resolving disputes amicably. Before pursuing formal legal action, 
                we encourage users to contact us to resolve any issues through our customer support channels.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Arbitration Agreement</h4>
                    <p className="text-sm text-blue-700">
                      Any disputes arising from these terms shall be resolved through binding arbitration 
                      in accordance with the rules of the American Arbitration Association.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Questions About These Terms?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact our legal team:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Legal Department</h4>
                    <p className="text-sm text-gray-600">legal@globalmarkets.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mailing Address</h4>
                    <p className="text-sm text-gray-600">
                      Global Markets Legal Department<br />
                      350 Fifth Avenue<br />
                      New York, NY 10118<br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acceptance & Agreement */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Your Agreement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                By using Global Markets, you acknowledge that you have read, understood, and agree 
                to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Continued Use = Agreement</h4>
                    <p className="text-sm text-green-700">
                      If you do not agree to these terms, you must immediately cease using the platform 
                      and close your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Need Clarification?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our legal and support teams are here to help you understand these terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Legal Team
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Download Terms PDF
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}