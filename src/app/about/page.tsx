import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Globe, Users, Award, Target, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const milestones = [
    { year: '2020', title: 'Founded', description: 'Started with a vision to democratize global market access' },
    { year: '2021', title: 'First Exchange', description: 'Integrated with 5 major global exchanges' },
    { year: '2022', title: 'AI Integration', description: 'Launched AI-powered market analytics' },
    { year: '2023', title: 'Global Expansion', description: 'Reached 40+ exchanges across 6 continents' },
    { year: '2024', title: 'Enterprise Platform', description: 'Launched comprehensive trading intelligence platform' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Mission',
      description: 'To empower traders and institutions with comprehensive global market intelligence and cutting-edge analytics tools.'
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'We prioritize our users\' success, providing 24/7 support and continuously improving based on feedback.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering the highest quality data, analytics, and user experience in the industry.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting traders to markets worldwide with real-time data and cross-border trading capabilities.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Empowering Global Traders with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {' '}Intelligent Technology
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Global Markets is a leading trading intelligence platform that provides real-time access to 
            40+ exchanges worldwide, powered by advanced AI analytics and comprehensive market data.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">40+</div>
              <div className="text-sm font-medium text-gray-600">Global Exchanges</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
              <div className="text-sm font-medium text-gray-600">Active Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-sm font-medium text-gray-600">AI Models</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
              <div className="text-sm font-medium text-gray-600">Uptime</div>
            </CardContent>
          </Card>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 mb-6">
              We believe that access to global markets should be seamless, intelligent, and available to everyone. 
              Our platform breaks down barriers between traders and worldwide opportunities.
            </p>
            <p className="text-lg text-gray-600">
              By combining cutting-edge AI technology with comprehensive market data, we provide traders 
              with the insights and tools they need to make informed decisions in today's complex global markets.
            </p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Values</h2>
            <div className="space-y-4">
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <value.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="flex-1 md:text-right md:pr-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border">
                      <div className="text-sm font-semibold text-blue-600 mb-1">{milestone.year}</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 md:pl-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Be part of the future of global trading. Join thousands of traders who trust our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}