import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Database, Globe, FileText, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  const privacySections = [
    {
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          heading: 'Account Information',
          text: 'When you create an account, we collect your name, email address, and other contact information necessary to provide our services.'
        },
        {
          heading: 'Usage Data',
          text: 'We collect information about how you use our platform, including trading activities, feature usage, and interaction with our tools.'
        },
        {
          heading: 'Device Information',
          text: 'We automatically collect device information such as IP address, browser type, and operating system to ensure optimal service delivery.'
        },
        {
          heading: 'Cookies',
          text: 'We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage.'
        }
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: Eye,
      content: [
        {
          heading: 'Service Provision',
          text: 'To provide, maintain, and improve our trading platform and services.'
        },
        {
          heading: 'Communication',
          text: 'To communicate with you about your account, provide customer support, and send important notifications.'
        },
        {
          heading: 'Analytics',
          text: 'To analyze usage patterns, improve our services, and develop new features.'
        },
        {
          heading: 'Security',
          text: 'To monitor and protect our platform against fraud, security threats, and malicious activities.'
        }
      ]
    },
    {
      title: 'Data Sharing & Disclosure',
      icon: Globe,
      content: [
        {
          heading: 'Third Parties',
          text: 'We do not sell your personal information. We only share data with trusted third parties who help us operate our platform.'
        },
        {
          heading: 'Legal Requirements',
          text: 'We may disclose your information if required by law, regulation, or to protect our rights and safety.'
        },
        {
          heading: 'Business Transfers',
          text: 'In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business assets.'
        }
      ]
    },
    {
      title: 'Data Security',
      icon: Shield,
      content: [
        {
          heading: 'Encryption',
          text: 'All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.'
        },
        {
          heading: 'Access Controls',
          text: 'We implement strict access controls and authentication mechanisms to protect your data.'
        },
        {
          heading: 'Regular Audits',
          text: 'We conduct regular security audits and assessments to ensure the ongoing protection of your information.'
        }
      ]
    },
    {
      title: 'Your Rights',
      icon: FileText,
      content: [
        {
          heading: 'Access',
          text: 'You have the right to access the personal information we hold about you.'
        },
        {
          heading: 'Correction',
          text: 'You can request correction of inaccurate or incomplete personal information.'
        },
        {
          heading: 'Deletion',
          text: 'You can request deletion of your personal information, subject to legal requirements.'
        },
        {
          heading: 'Portability',
          text: 'You have the right to receive your personal information in a portable format.'
        }
      ]
    }
  ];

  const complianceStandards = [
    { name: 'GDPR', description: 'General Data Protection Regulation compliant', status: 'Compliant' },
    { name: 'CCPA', description: 'California Consumer Privacy Act compliant', status: 'Compliant' },
    { name: 'SOC 2', description: 'Service Organization Control 2 certified', status: 'Certified' },
    { name: 'ISO 27001', description: 'Information Security Management certified', status: 'Certified' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Privacy Policy</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Protecting Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Data & Privacy
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            At Global Markets, we take your privacy seriously. This policy explains how we collect, 
            use, and protect your personal information when you use our platform.
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>Last updated: November 2024</span>
            </div>
          </div>
        </div>

        {/* Quick Overview */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Privacy at a Glance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No Data Selling</h3>
                <p className="text-sm text-gray-600">We never sell your personal information to third parties.</p>
              </div>
              <div className="text-center">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">End-to-End Encryption</h3>
                <p className="text-sm text-gray-600">Your data is protected with military-grade encryption.</p>
              </div>
              <div className="text-center">
                <Eye className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Transparent Control</h3>
                <p className="text-sm text-gray-600">You have full control over your personal information.</p>
              </div>
              <div className="text-center">
                <Database className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Compliance First</h3>
                <p className="text-sm text-gray-600">We comply with global privacy regulations.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Standards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Compliance & Certifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceStandards.map((standard, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{standard.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{standard.description}</p>
                  <Badge variant={standard.status === 'Compliant' ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                    {standard.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Privacy Sections */}
        <div className="space-y-12 mb-16">
          {privacySections.map((section, index) => (
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

        {/* Data Retention */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <span>Data Retention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                We retain your personal information only as long as necessary to fulfill the purposes 
                for which it was collected, including legal, accounting, or reporting requirements.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Account Data</h4>
                  <p className="text-sm text-gray-600">Retained while your account is active</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Transaction Data</h4>
                  <p className="text-sm text-gray-600">Retained for 7 years for compliance</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics Data</h4>
                  <p className="text-sm text-gray-600">Retained for 2 years for improvement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Data Transfers */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <span>International Data Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                As a global platform, we may transfer your data to countries outside your home country. 
                We ensure that all international transfers comply with applicable data protection laws 
                and include appropriate safeguards.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">EU-US Data Protection Framework</h4>
                    <p className="text-sm text-blue-700">
                      We adhere to the EU-US Data Protection Framework for transfers of personal data 
                      from the European Union to the United States.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Privacy Concerns */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Privacy Concerns & Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                If you have any questions or concerns about this privacy policy or our data practices, 
                please contact our Data Protection Officer:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                    <p className="text-sm text-gray-600">privacy@globalmarkets.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mailing Address</h4>
                    <p className="text-sm text-gray-600">
                      Global Markets Privacy Team<br />
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

        {/* Policy Updates */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                We may update this privacy policy from time to time. The updated version will be 
                indicated by a revised "Last updated" date and the updated version will be effective 
                as soon as it is accessible.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">How We Notify You</h4>
                    <p className="text-sm text-yellow-700">
                      We will notify you of any material changes by email, through our platform, 
                      or by other means before the changes become effective.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Questions About Your Privacy?</h2>
          <p className="text-xl mb-8 opacity-90">
            Our privacy team is here to help you understand and manage your data rights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Contact Privacy Team
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Download Policy PDF
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}