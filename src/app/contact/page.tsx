import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, MessageCircle, Users, Building, Globe } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      value: 'support@globalmarkets.com',
      response: 'Response within 24 hours',
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team',
      value: '+1 (555) 123-4567',
      response: 'Mon-Fri, 9AM-6PM EST',
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant support',
      value: 'Available on website',
      response: '24/7 for premium users',
      color: 'text-purple-600'
    }
  ];

  const offices = [
    {
      city: 'New York',
      country: 'United States',
      address: '350 Fifth Avenue, New York, NY 10118',
      phone: '+1 (555) 123-4567',
      email: 'ny@globalmarkets.com'
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '30 St Mary Axe, London EC3A 8BF, UK',
      phone: '+44 20 7946 0958',
      email: 'london@globalmarkets.com'
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      address: 'Marunouchi Building, 2-4-1 Marunouchi, Chiyoda City, Tokyo',
      phone: '+81 3-6269-8000',
      email: 'tokyo@globalmarkets.com'
    }
  ];

  const teamContacts = [
    {
      department: 'Sales',
      description: 'New accounts and enterprise solutions',
      email: 'sales@globalmarkets.com',
      phone: '+1 (555) 123-4568'
    },
    {
      department: 'Technical Support',
      description: 'Platform issues and technical assistance',
      email: 'tech@globalmarkets.com',
      phone: '+1 (555) 123-4569'
    },
    {
      department: 'Partnerships',
      description: 'Business development and partnerships',
      email: 'partnerships@globalmarkets.com',
      phone: '+1 (555) 123-4570'
    },
    {
      department: 'Media Inquiries',
      description: 'Press and media related questions',
      email: 'media@globalmarkets.com',
      phone: '+1 (555) 123-4571'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Contact Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch with Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Expert Team
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help you succeed in global markets. Reach out to our team for support, 
            partnerships, or any questions about our platform.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <method.icon className={`h-12 w-12 mx-auto mb-4 ${method.color}`} />
                <CardTitle className="text-xl">{method.title}</CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">{method.value}</div>
                  <div className="text-sm text-gray-500">{method.response}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Contact Form */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-2xl">Send us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>General Inquiry</option>
                    <option>Technical Support</option>
                    <option>Sales Question</option>
                    <option>Partnership Opportunity</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                <Button className="w-full" size="lg">
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Contacts */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Department Contacts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {teamContacts.map((team, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>{team.department}</span>
                  </CardTitle>
                  <CardDescription>{team.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{team.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{team.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Global Offices */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Global Offices</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    <span>{office.city}</span>
                  </CardTitle>
                  <CardDescription>{office.country}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-sm">{office.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{office.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{office.email}</span>
                    </div>
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
              <span>Support Hours</span>
            </CardTitle>
            <CardDescription>
              Our global support team is available across multiple time zones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Basic Support</h3>
                <p className="text-gray-600 mb-2">Monday - Friday</p>
                <p className="text-2xl font-bold text-blue-600">9AM - 6PM EST</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Premium Support</h3>
                <p className="text-gray-600 mb-2">Monday - Friday</p>
                <p className="text-2xl font-bold text-green-600">24/7</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Enterprise Support</h3>
                <p className="text-gray-600 mb-2">All Days</p>
                <p className="text-2xl font-bold text-purple-600">24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of traders who are already using our platform to succeed in global markets.
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