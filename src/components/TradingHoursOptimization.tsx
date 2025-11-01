'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GlobalTradingSchedule, 
  OptimizedTradingWindow, 
  tradingHoursOptimizer 
} from '@/lib/trading-hours-optimization';

interface TradingHoursOptimizationProps {
  selectedMarket?: string;
}

export default function TradingHoursOptimization({ selectedMarket = 'nyse' }: TradingHoursOptimizationProps) {
  const [globalSchedule, setGlobalSchedule] = useState<GlobalTradingSchedule | null>(null);
  const [marketOptimization, setMarketOptimization] = useState<OptimizedTradingWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch global trading schedule
        const globalResponse = await fetch('/api/trading-hours-optimization?action=global');
        const globalData = await globalResponse.json();
        
        if (globalData.success) {
          setGlobalSchedule(globalData.data);
        }
        
        // Fetch market-specific optimization
        const marketResponse = await fetch(`/api/trading-hours-optimization?market=${selectedMarket}&action=market`);
        const marketData = await marketResponse.json();
        
        if (marketData.success) {
          setMarketOptimization(marketData.data);
        }
        
        setLastUpdate(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching trading hours optimization:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedMarket]);

  const formatTime = (time: string) => {
    return time;
  };

  const getLiquidityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSynergyColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Global Trading Hours Optimization</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      </div>

      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="global">Global Schedule</TabsTrigger>
          <TabsTrigger value="market">Market Optimization</TabsTrigger>
          <TabsTrigger value="overlaps">Market Overlaps</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {globalSchedule && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Markets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{globalSchedule.activeMarkets.length}</div>
                    <div className="text-xs text-gray-500">
                      {globalSchedule.activeMarkets.slice(0, 3).join(', ')}
                      {globalSchedule.activeMarkets.length > 3 && '...'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Global Liquidity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getLiquidityColor(globalSchedule.globalLiquidityScore)}`}>
                      {(globalSchedule.globalLiquidityScore * 100).toFixed(1)}%
                    </div>
                    <Progress value={globalSchedule.globalLiquidityScore * 100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Current Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{globalSchedule.utcOffset}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(globalSchedule.currentTime).toLocaleTimeString()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Market Openings</CardTitle>
                    <CardDescription>Markets opening in the next 8 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {globalSchedule.upcomingOpenings.map((opening, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{opening.market}</span>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{opening.timeUntilOpen}</div>
                            <div className="text-xs text-gray-500">{opening.openTime}</div>
                          </div>
                        </div>
                      ))}
                      {globalSchedule.upcomingOpenings.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          No upcoming openings in the next 8 hours
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Market Closings</CardTitle>
                    <CardDescription>Markets closing in the next 4 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {globalSchedule.upcomingClosings.map((closing, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="font-medium">{closing.market}</span>
                          <div className="text-right">
                            <div className="text-sm font-semibold">{closing.timeUntilClose}</div>
                            <div className="text-xs text-gray-500">{closing.closeTime}</div>
                          </div>
                        </div>
                      ))}
                      {globalSchedule.upcomingClosings.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          No upcoming closings in the next 4 hours
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          {marketOptimization && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{marketOptimization.market} Optimization</CardTitle>
                  <CardDescription>Optimal trading windows for {marketOptimization.region} region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Best Trading Time</h4>
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="font-medium">{formatTime(marketOptimization.bestTradingTime.start)} - {formatTime(marketOptimization.bestTradingTime.end)}</div>
                        <div className="text-xs text-gray-600 mt-1">{marketOptimization.bestTradingTime.reason}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Peak Volume Time</h4>
                      <div className="p-3 bg-green-50 rounded">
                        <div className="font-medium">{formatTime(marketOptimization.peakVolumeTime.start)} - {formatTime(marketOptimization.peakVolumeTime.end)}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Volume: {marketOptimization.peakVolumeTime.volumeMultiplier}x normal
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Low Volatility Time</h4>
                      <div className="p-3 bg-yellow-50 rounded">
                        <div className="font-medium">{formatTime(marketOptimization.lowVolatilityTime.start)} - {formatTime(marketOptimization.lowVolatilityTime.end)}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Volatility reduced by {(marketOptimization.lowVolatilityTime.volatilityReduction * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cross-Market Opportunities</CardTitle>
                  <CardDescription>Trading opportunities with overlapping market hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketOptimization.crossMarketOpportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getSynergyColor(opportunity.synergyScore)}`}></div>
                          <div>
                            <div className="font-medium">{opportunity.market}</div>
                            <div className="text-sm text-gray-500">
                              {formatTime(opportunity.overlapStart)} - {formatTime(opportunity.overlapEnd)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {(opportunity.synergyScore * 100).toFixed(0)}% synergy
                        </Badge>
                      </div>
                    ))}
                    {marketOptimization.crossMarketOpportunities.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No significant cross-market opportunities found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="overlaps" className="space-y-4">
          {globalSchedule && (
            <Card>
              <CardHeader>
                <CardTitle>Regional Market Overlaps</CardTitle>
                <CardDescription>Analysis of trading session overlaps between regions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalSchedule.marketOverlapAnalysis.map((overlap, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${getSynergyColor(overlap.synergyScore)}`}></div>
                        <div>
                          <div className="font-semibold">
                            {overlap.region1.charAt(0).toUpperCase() + overlap.region1.slice(1)} - {overlap.region2.charAt(0).toUpperCase() + overlap.region2.slice(1)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {overlap.overlapDuration} minutes overlap
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{(overlap.synergyScore * 100).toFixed(0)}%</div>
                        <div className="text-xs text-gray-500">synergy score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}