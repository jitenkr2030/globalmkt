'use client';

import Link from 'next/link';
import { Globe, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    platform: [
      { name: 'Trading Sessions', href: '#trading-sessions' },
      { name: 'Market Analysis', href: '#market-analysis' },
      { name: 'AI Integration', href: '#ai-integration' },
      { name: 'Performance', href: '#performance' },
    ],
    tradingTools: [
      { name: 'Currency Conversion', href: '#currency-conversion' },
      { name: 'Holiday Calendar', href: '#holiday-calendar' },
      { name: 'Trading Hours', href: '#trading-hours' },
    ],
    solutions: [
      { name: 'Pricing', href: '#pricing' },
      { name: 'Freemium', href: '#freemium' },
      { name: 'Pay-Per-Use', href: '#pay-per-use' },
      { name: 'Enterprise', href: '/enterprise' },
      { name: 'Partnerships', href: '#partnerships' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Documentation', href: '/docs' },
      { name: 'API Status', href: '/status' },
      { name: 'Community', href: '/community' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'GitHub', href: '#', icon: Github },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Globe className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Global Markets</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Empowering traders with comprehensive global market intelligence and analytics 
                across 40+ exchanges worldwide.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>support@globalmarkets.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>New York, NY | London, UK | Tokyo, JP</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4 mt-6">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Platform</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trading Tools Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Trading Tools</h3>
              <ul className="space-y-3">
                {footerLinks.tradingTools.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solutions Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Solutions</h3>
              <ul className="space-y-3">
                {footerLinks.solutions.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-gray-400">
                © 2024 Global Markets. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <Link href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="#cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
                <Link href="#compliance" className="hover:text-white transition-colors">
                  Compliance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}