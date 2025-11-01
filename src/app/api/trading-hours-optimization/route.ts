import { NextRequest, NextResponse } from 'next/server';
import { tradingHoursOptimizer, GlobalTradingSchedule, OptimizedTradingWindow } from '@/lib/trading-hours-optimization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('market');
    const action = searchParams.get('action') || 'global';

    if (marketId && action === 'market') {
      // Get optimal trading windows for a specific market
      const optimalWindows = tradingHoursOptimizer.getOptimalTradingWindows(marketId);
      return NextResponse.json({
        success: true,
        data: optimalWindows,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'global') {
      // Get global trading schedule
      const globalSchedule = tradingHoursOptimizer.getGlobalTradingSchedule();
      return NextResponse.json({
        success: true,
        data: globalSchedule,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action parameter',
      timestamp: new Date().toISOString()
    }, { status: 400 });

  } catch (error) {
    console.error('Trading hours optimization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get trading hours optimization data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}