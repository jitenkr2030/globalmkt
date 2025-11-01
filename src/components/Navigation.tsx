'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Menu, X, Globe, TrendingUp, Calendar, DollarSign, BarChart3, Clock, Brain, Zap, CreditCard, Users, Database, ChevronDown, Activity, Target } from 'lucide-react';

const navigationGroups = [
  {
    name: 'Platform',
    description: 'Core platform features and capabilities',
    items: [
      { name: 'Trading Sessions', href: '#trading-sessions', icon: Globe, description: 'Real-time session analysis' },
      { name: 'Market Analysis', href: '#market-analysis', icon: TrendingUp, description: 'Cross-market correlations' },
      { name: 'AI Integration', href: '#ai-integration', icon: Brain, description: 'AI-powered analytics' },
      { name: 'ML Analytics', href: '#ml-analytics', icon: Zap, description: 'Predictive analytics' },
      { name: 'Performance', href: '#performance', icon: Zap, description: 'System optimization' },
    ]
  },
  {
    name: 'Trading Tools',
    description: 'Advanced trading and analytics tools',
    items: [
      { name: 'Currency Conversion', href: '#currency-conversion', icon: DollarSign, description: 'Multi-currency support' },
      { name: 'Holiday Calendar', href: '#holiday-calendar', icon: Calendar, description: 'Market holiday tracking' },
      { name: 'Trading Hours', href: '#trading-hours', icon: Clock, description: 'Global schedule optimization' },
      { name: 'Order Management', href: '#order-management', icon: Target, description: 'Advanced order types' },
    ]
  },
  {
    name: 'Solutions',
    description: 'Business solutions and pricing',
    items: [
      { name: 'Pricing', href: '#pricing', icon: CreditCard, description: 'Subscription plans' },
      { name: 'Freemium', href: '#freemium', icon: Users, description: 'Free tier features' },
      { name: 'Pay-Per-Use', href: '#pay-per-use', icon: CreditCard, description: 'Usage-based pricing' },
      { name: 'Enterprise', href: '/enterprise', icon: Users, description: 'Institutional solutions' },
      { name: 'Partnerships', href: '#partnerships', icon: Users, description: 'Partner programs' },
      { name: 'Data Sales', href: '#data-sales', icon: Database, description: 'Data marketplace' },
    ]
  }
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold">Global Markets</span>
              <p className="text-xs text-muted-foreground hidden sm:block">Trading Intelligence Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navigationGroups.map((group) => (
              <DropdownMenu key={group.name}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-10 px-4 flex items-center space-x-2 hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium">{group.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2">
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b mb-1">
                    {group.description}
                  </div>
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.name} asChild className="rounded-md">
                      <Link 
                        href={item.href} 
                        className="flex items-center space-x-3 p-2 hover:bg-accent cursor-pointer"
                      >
                        <div className="p-1.5 rounded-md bg-muted">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
            
            <div className="w-px h-6 bg-border mx-3" />
            
            {/* Quick Actions */}
            <Button variant="default" size="sm" className="h-10 px-4 font-medium">
              Get Started
            </Button>
            <Link href="/real-time">
              <Button variant="outline" size="sm" className="h-10 px-4 font-medium ml-2">
                <Activity className="h-4 w-4 mr-2" />
                Live Data
              </Button>
            </Link>
            <Link href="/charting">
              <Button variant="outline" size="sm" className="h-10 px-4 font-medium ml-2">
                <BarChart3 className="h-4 w-4 mr-2" />
                Charting
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="outline" size="sm" className="h-10 px-4 font-medium ml-2">
                <BarChart3 className="h-4 w-4 mr-2" />
                Portfolio
              </Button>
            </Link>
          </div>

          {/* Large Tablet Navigation */}
          <div className="hidden lg:flex xl:hidden items-center space-x-1">
            {/* Show first 2 items from each group */}
            {navigationGroups.slice(0, 2).map((group) => {
              const firstItem = group.items[0];
              return (
                <Link key={group.name} href={firstItem.href}>
                  <Button variant="ghost" size="sm" className="h-9 px-3">
                    <firstItem.icon className="h-4 w-4 mr-2" />
                    {firstItem.name}
                  </Button>
                </Link>
              );
            })}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 px-3">
                  More Tools
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {navigationGroups.map((group) => (
                  <div key={group.name}>
                    <DropdownMenuItem className="font-semibold text-muted-foreground cursor-default hover:bg-transparent">
                      {group.name}
                    </DropdownMenuItem>
                    {group.items.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href} className="flex items-center space-x-2 pl-4">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" className="h-9 px-3 ml-2">
              Get Started
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-6 mt-4">
                <div className="flex items-center space-x-3 pb-4 border-b">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold">Global Markets</span>
                    <p className="text-sm text-muted-foreground">Trading Intelligence</p>
                  </div>
                </div>
                
                {navigationGroups.map((group) => (
                  <div key={group.name} className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      {group.name}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
                        >
                          <div className="p-2 rounded-md bg-muted group-hover:bg-accent/50 transition-colors">
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t space-y-3">
                  <Button className="w-full" size="lg">
                    Get Started Free
                  </Button>
                  <Link href="/real-time">
                    <Button variant="outline" className="w-full" size="lg">
                      <Activity className="mr-2 h-5 w-5" />
                      Live Data
                    </Button>
                  </Link>
                  <Link href="/charting">
                    <Button variant="outline" className="w-full" size="lg">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Charting
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button variant="outline" className="w-full" size="lg">
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Portfolio
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" size="lg">
                    Contact Sales
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}