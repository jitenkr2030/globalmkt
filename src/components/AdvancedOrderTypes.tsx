'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  X,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Target,
  Shield,
  Zap,
  BarChart3,
  Wallet
} from 'lucide-react';

interface Order {
  id: string;
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  side: 'BUY' | 'SELL';
  quantity: number;
  price?: number;
  stopPrice?: number;
  limitPrice?: number;
  status: 'PENDING' | 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
  orderType?: 'TRAILING_STOP' | 'ICEBERG' | 'OCO' | 'BRACKET' | 'IF_THEN' | 'IF_THEN_OCO';
  triggerPrice?: number;
  trailAmount?: number;
  trailPercent?: number;
  icebergQty?: number;
  displayQty?: number;
  filledQuantity: number;
  averagePrice?: number;
  commission: number;
  createdAt: string;
  executedAt?: string;
  instrument: {
    symbol: string;
    name: string;
    type: string;
    exchange: string;
    currency: string;
  };
  portfolio: {
    name: string;
  };
}

interface Position {
  id: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
  instrument: {
    symbol: string;
    name: string;
  };
}

export default function AdvancedOrderTypes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        type: 'LIMIT',
        side: 'BUY',
        quantity: 100,
        price: 150.25,
        status: 'OPEN',
        timeInForce: 'GTC',
        filledQuantity: 0,
        commission: 0,
        createdAt: '2024-01-15T10:30:00Z',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD'
        },
        portfolio: {
          name: 'Main Portfolio'
        }
      },
      {
        id: '2',
        type: 'STOP',
        side: 'SELL',
        quantity: 50,
        stopPrice: 145.00,
        status: 'OPEN',
        timeInForce: 'GTC',
        orderType: 'TRAILING_STOP',
        trailPercent: 2.5,
        triggerPrice: 147.50,
        filledQuantity: 0,
        commission: 0,
        createdAt: '2024-01-15T09:15:00Z',
        instrument: {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD'
        },
        portfolio: {
          name: 'Main Portfolio'
        }
      },
      {
        id: '3',
        type: 'MARKET',
        side: 'BUY',
        quantity: 200,
        status: 'FILLED',
        timeInForce: 'IOC',
        filledQuantity: 200,
        averagePrice: 155.75,
        commission: 31.15,
        createdAt: '2024-01-15T08:45:00Z',
        executedAt: '2024-01-15T08:45:15Z',
        instrument: {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD'
        },
        portfolio: {
          name: 'Main Portfolio'
        }
      },
      {
        id: '4',
        type: 'LIMIT',
        side: 'SELL',
        quantity: 75,
        price: 165.00,
        status: 'OPEN',
        timeInForce: 'DAY',
        orderType: 'BRACKET',
        filledQuantity: 0,
        commission: 0,
        createdAt: '2024-01-15T11:00:00Z',
        instrument: {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD'
        },
        portfolio: {
          name: 'Main Portfolio'
        }
      }
    ];

    const mockPositions: Position[] = [
      {
        id: '1',
        quantity: 200,
        averagePrice: 155.75,
        currentPrice: 157.25,
        unrealizedPnL: 300,
        realizedPnL: 0,
        instrument: {
          symbol: 'MSFT',
          name: 'Microsoft Corporation'
        }
      },
      {
        id: '2',
        quantity: 100,
        averagePrice: 148.50,
        currentPrice: 149.25,
        unrealizedPnL: 75,
        realizedPnL: 0,
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        }
      },
      {
        id: '3',
        quantity: -50,
        averagePrice: 152.00,
        currentPrice: 151.25,
        unrealizedPnL: 37.50,
        realizedPnL: 0,
        instrument: {
          symbol: 'TSLA',
          name: 'Tesla Inc.'
        }
      }
    ];

    setOrders(mockOrders);
    setPositions(mockPositions);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'FILLED': return 'bg-green-100 text-green-800';
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'PARTIALLY_FILLED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'MARKET': return 'bg-gray-100 text-gray-800';
      case 'LIMIT': return 'bg-blue-100 text-blue-800';
      case 'STOP': return 'bg-red-100 text-red-800';
      case 'STOP_LIMIT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdvancedOrderTypeIcon = (type?: string) => {
    switch (type) {
      case 'TRAILING_STOP': return <TrendingUp className="h-4 w-4" />;
      case 'ICEBERG': return <BarChart3 className="h-4 w-4" />;
      case 'OCO': return <Target className="h-4 w-4" />;
      case 'BRACKET': return <Shield className="h-4 w-4" />;
      case 'IF_THEN': return <Zap className="h-4 w-4" />;
      default: return null;
    }
  };

  const executeOrder = async (orderId: string) => {
    // Simulate order execution
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'FILLED' as const, executedAt: new Date().toISOString() }
        : order
    ));
  };

  const cancelOrder = async (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'CANCELLED' as const }
        : order
    ));
  };

  const totalPortfolioValue = positions.reduce((sum, pos) => sum + (pos.quantity * pos.currentPrice), 0);
  const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealizedPnL, 0);
  const totalRealizedPnL = positions.reduce((sum, pos) => sum + pos.realizedPnL, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Portfolio Value</span>
            </div>
            <div className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Unrealized P&L</span>
            </div>
            <div className={`text-2xl font-bold ${totalUnrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalUnrealizedPnL.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Realized P&L</span>
            </div>
            <div className={`text-2xl font-bold ${totalRealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalRealizedPnL.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Open Orders</span>
            </div>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'OPEN' || o.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Order Management</h3>
            <Button onClick={() => setShowOrderForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {order.instrument.symbol.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{order.instrument.symbol}</div>
                          <div className="text-sm text-muted-foreground">{order.instrument.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getOrderTypeColor(order.type)}>
                          {order.type}
                        </Badge>
                        <Badge variant={order.side === 'BUY' ? 'default' : 'destructive'}>
                          {order.side}
                        </Badge>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        {order.orderType && (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            {getAdvancedOrderTypeIcon(order.orderType)}
                            <span>{order.orderType.replace('_', ' ')}</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {order.quantity} @ {order.price || order.stopPrice || 'Market'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.portfolio.name}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {order.status === 'OPEN' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => executeOrder(order.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => cancelOrder(order.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {order.status === 'FILLED' && (
                          <Badge variant="secondary">
                            Filled at {order.averagePrice?.toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {order.orderType === 'TRAILING_STOP' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Trailing Stop:</span>
                        </div>
                        <span>Trail: {order.trailPercent}%</span>
                        <span>Trigger: ${order.triggerPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {order.orderType === 'BRACKET' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-1 text-sm">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Bracket Order:</span>
                        <span>Stop-loss and take-profit orders will be created when filled</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <h3 className="text-lg font-semibold">Position Management</h3>
          
          <div className="grid gap-4">
            {positions.map((position) => (
              <Card key={position.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {position.instrument.symbol.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{position.instrument.symbol}</div>
                          <div className="text-sm text-muted-foreground">{position.instrument.name}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-semibold ${position.quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {position.quantity >= 0 ? '+' : ''}{position.quantity}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg: ${position.averagePrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          ${position.currentPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current Price
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`font-semibold ${position.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${position.unrealizedPnL.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Unrealized P&L
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Target className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-1">
                      <span>Position Progress</span>
                      <span>{Math.abs(position.quantity)} shares</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <h3 className="text-lg font-semibold">Advanced Order Types</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Trailing Stop Orders</span>
                </CardTitle>
                <CardDescription>
                  Automatically adjust stop price as market moves in your favor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Trailing Stops</span>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Trail Distance</span>
                    <span className="font-medium">2.5%</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Create Trailing Stop
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Bracket Orders</span>
                </CardTitle>
                <CardDescription>
                  Automatically set stop-loss and take-profit orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Bracket Orders</span>
                    <Badge variant="secondary">1</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risk/Reward Ratio</span>
                    <span className="font-medium">1:2</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Create Bracket Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>One-Cancels-Other (OCO)</span>
                </CardTitle>
                <CardDescription>
                  Place two orders, when one fills the other is cancelled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active OCO Orders</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Success Rate</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Create OCO Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Iceberg Orders</span>
                </CardTitle>
                <CardDescription>
                  Large orders broken into smaller pieces to minimize market impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Iceberg Orders</span>
                    <Badge variant="secondary">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Display Quantity</span>
                    <span className="font-medium">500</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    Create Iceberg Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}