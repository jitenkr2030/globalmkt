'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2, 
  Star, 
  Trophy, 
  Target,
  BarChart3,
  Clock,
  DollarSign,
  Award,
  Filter,
  Search
} from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  username: string;
  followers: number;
  following: number;
  totalReturn: number;
  winRate: number;
  tradesCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  verified: boolean;
  bio: string;
  favoriteInstruments: string[];
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

interface TradeSignal {
  id: string;
  traderId: string;
  traderName: string;
  instrument: string;
  action: 'buy' | 'sell';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  timestamp: string;
  status: 'active' | 'completed' | 'cancelled';
  result?: number;
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

interface CommunityPost {
  id: string;
  traderId: string;
  traderName: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  type: 'analysis' | 'trade' | 'insight' | 'question';
}

const mockTraders: Trader[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    username: '@sarahtrades',
    followers: 15420,
    following: 342,
    totalReturn: 127.5,
    winRate: 68.4,
    tradesCount: 1247,
    riskLevel: 'medium',
    verified: true,
    bio: 'Technical analysis specialist focusing on Asian markets. 8+ years experience in forex and equity trading.',
    favoriteInstruments: ['USD/JPY', 'NIFTY', 'TSLA', 'BTC/USD'],
    performance: {
      daily: 2.3,
      weekly: 8.7,
      monthly: 24.5,
      yearly: 127.5
    }
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    avatar: '/avatars/marcus.jpg',
    username: '@marcusfx',
    followers: 8934,
    following: 156,
    totalReturn: 89.2,
    winRate: 72.1,
    tradesCount: 892,
    riskLevel: 'low',
    verified: true,
    bio: 'Institutional trader turned independent. Focus on risk management and consistent returns.',
    favoriteInstruments: ['EUR/USD', 'GBP/USD', 'Gold', 'SPX'],
    performance: {
      daily: 1.2,
      weekly: 5.4,
      monthly: 18.3,
      yearly: 89.2
    }
  },
  {
    id: '3',
    name: 'Elena Volkov',
    avatar: '/avatars/elena.jpg',
    username: '@elenavol',
    followers: 23156,
    following: 89,
    totalReturn: 203.7,
    winRate: 64.8,
    tradesCount: 2156,
    riskLevel: 'high',
    verified: true,
    bio: 'Cryptocurrency and emerging markets expert. High-risk, high-reward strategies.',
    favoriteInstruments: ['BTC/USD', 'ETH/USD', 'SOL', 'NVDA'],
    performance: {
      daily: 4.7,
      weekly: 15.2,
      monthly: 42.8,
      yearly: 203.7
    }
  }
];

const mockTradeSignals: TradeSignal[] = [
  {
    id: '1',
    traderId: '1',
    traderName: 'Sarah Chen',
    instrument: 'USD/JPY',
    action: 'buy',
    entryPrice: 149.85,
    targetPrice: 151.20,
    stopLoss: 149.20,
    confidence: 85,
    timestamp: '2024-01-15T10:30:00Z',
    status: 'active',
    description: 'Breaking above resistance with strong momentum. RSI divergence suggests continuation.',
    likes: 234,
    comments: 45,
    shares: 12
  },
  {
    id: '2',
    traderId: '2',
    traderName: 'Marcus Rodriguez',
    instrument: 'EUR/USD',
    action: 'sell',
    entryPrice: 1.0895,
    targetPrice: 1.0820,
    stopLoss: 1.0920,
    confidence: 78,
    timestamp: '2024-01-15T09:15:00Z',
    status: 'completed',
    result: 2.1,
    description: 'Double top formation on daily chart. ECB policy meeting creating uncertainty.',
    likes: 189,
    comments: 32,
    shares: 8
  },
  {
    id: '3',
    traderId: '3',
    traderName: 'Elena Volkov',
    instrument: 'BTC/USD',
    action: 'buy',
    entryPrice: 42850,
    targetPrice: 46500,
    stopLoss: 41500,
    confidence: 92,
    timestamp: '2024-01-15T08:45:00Z',
    status: 'active',
    description: 'Halving cycle momentum building. On-chain metrics showing accumulation.',
    likes: 567,
    comments: 89,
    shares: 34
  }
];

const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    traderId: '1',
    traderName: 'Sarah Chen',
    avatar: '/avatars/sarah.jpg',
    content: 'Just completed analysis on NIFTY 50. The index is showing strong bullish momentum with MACD crossover and increasing volume. Target 21800 by month-end. What are your thoughts?',
    timestamp: '2024-01-15T11:20:00Z',
    likes: 145,
    comments: 23,
    shares: 7,
    tags: ['NIFTY', 'Technical Analysis', 'Bullish'],
    type: 'analysis'
  },
  {
    id: '2',
    traderId: '2',
    traderName: 'Marcus Rodriguez',
    avatar: '/avatars/marcus.jpg',
    content: 'Risk management tip: Never risk more than 1% of your capital on a single trade. This simple rule has saved my portfolio multiple times during market volatility.',
    timestamp: '2024-01-15T10:45:00Z',
    likes: 298,
    comments: 56,
    shares: 42,
    tags: ['Risk Management', 'Trading Tips'],
    type: 'insight'
  },
  {
    id: '3',
    traderId: '3',
    traderName: 'Elena Volkov',
    avatar: '/avatars/elena.jpg',
    content: 'Question for the community: With the upcoming Bitcoin halving, how are you positioning your portfolios? Looking for different perspectives on altcoin vs BTC allocation.',
    timestamp: '2024-01-15T09:30:00Z',
    likes: 178,
    comments: 67,
    shares: 15,
    tags: ['Bitcoin', 'Halving', 'Portfolio Management'],
    type: 'question'
  }
];

export default function SocialTrading() {
  const [activeTab, setActiveTab] = useState('traders');
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [followedTraders, setFollowedTraders] = useState<string[]>(['1']);
  const [likedPosts, setLikedPosts] = useState<string[]>(['1']);

  const toggleFollowTrader = (traderId: string) => {
    if (followedTraders.includes(traderId)) {
      setFollowedTraders(followedTraders.filter(id => id !== traderId));
    } else {
      setFollowedTraders([...followedTraders, traderId]);
    }
  };

  const toggleLikePost = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    return action === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Social Trading</h2>
          <p className="text-muted-foreground">
            Connect with traders, share insights, and follow successful strategies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="traders">Top Traders</TabsTrigger>
          <TabsTrigger value="signals">Trade Signals</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="traders" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockTraders.map((trader) => (
              <Card key={trader.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={trader.avatar} alt={trader.name} />
                        <AvatarFallback>{trader.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{trader.name}</CardTitle>
                          {trader.verified && <Award className="h-4 w-4 text-blue-600" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{trader.username}</p>
                      </div>
                    </div>
                    <Button
                      variant={followedTraders.includes(trader.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleFollowTrader(trader.id)}
                    >
                      {followedTraders.includes(trader.id) ? 'Following' : 'Follow'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{trader.bio}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{trader.followers.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{trader.totalReturn.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Total Return</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Win Rate</span>
                      <span>{trader.winRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={trader.winRate} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getRiskLevelColor(trader.riskLevel)}>
                      {trader.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <div className="flex space-x-1">
                      {trader.favoriteInstruments.slice(0, 3).map((instrument, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="grid gap-4">
            {mockTradeSignals.map((signal) => (
              <Card key={signal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{signal.traderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{signal.traderName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(signal.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getActionColor(signal.action)}>
                        {signal.action.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(signal.status)}>
                        {signal.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Instrument</p>
                      <p className="font-semibold">{signal.instrument}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entry</p>
                      <p className="font-semibold">{signal.entryPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="font-semibold text-green-600">{signal.targetPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stop Loss</p>
                      <p className="font-semibold text-red-600">{signal.stopLoss}</p>
                    </div>
                  </div>

                  <p className="text-sm">{signal.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{signal.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{signal.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Share2 className="h-4 w-4" />
                        <span>{signal.shares}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span className="text-sm">Confidence: {signal.confidence}%</span>
                      </div>
                      <Progress value={signal.confidence} className="w-20 h-2" />
                    </div>
                  </div>

                  {signal.result && (
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">
                        Result: +{signal.result}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="grid gap-4">
            {mockCommunityPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.avatar} alt={post.traderName} />
                        <AvatarFallback>{post.traderName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{post.traderName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{post.type.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLikePost(post.id)}
                        className={likedPosts.includes(post.id) ? 'text-red-600' : ''}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="h-4 w-4 mr-1" />
                        {post.shares}
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Following Performance</CardTitle>
                <CardDescription>
                  Combined performance of traders you follow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">+45.2%</div>
                    <p className="text-sm text-muted-foreground">Total Return</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">Active Traders</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today</span>
                    <span className="text-green-600">+1.2%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="text-green-600">+5.8%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>This Month</span>
                    <span className="text-green-600">+15.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Copy Trading Stats</CardTitle>
                <CardDescription>
                  Your social trading activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-sm text-muted-foreground">Copied Trades</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">68%</div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Copied</span>
                    <span>$24,500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit/Loss</span>
                    <span className="text-green-600">+$3,280</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Trade Size</span>
                    <span>$521</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}