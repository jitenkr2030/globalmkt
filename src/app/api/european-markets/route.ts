import { NextRequest, NextResponse } from 'next/server';
import { europeanMarketDataService } from '@/lib/european-market-data';
import { EUROPEAN_MARKET_CORRELATIONS, CROSS_CONTINENTAL_CORRELATIONS } from '@/lib/european-correlations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const marketId = searchParams.get('market');
  const action = searchParams.get('action');
  
  try {
    switch (action) {
      case 'get_market_data':
        if (!marketId) {
          return NextResponse.json({ error: 'Market ID is required' }, { status: 400 });
        }
        const marketData = await europeanMarketDataService.getMarketData(marketId);
        return NextResponse.json({ marketData });
        
      case 'get_market_index':
        if (!marketId) {
          return NextResponse.json({ error: 'Market ID is required' }, { status: 400 });
        }
        const marketIndex = await europeanMarketDataService.getMarketIndex(marketId);
        return NextResponse.json({ marketIndex });
        
      case 'get_all_markets':
        const allMarketsData = await europeanMarketDataService.getAllMarketsData();
        return NextResponse.json({ markets: allMarketsData });
        
      case 'get_data_sources':
        const dataSources = europeanMarketDataService.getAllDataSources();
        return NextResponse.json({ dataSources });
        
      case 'get_correlations':
        if (marketId) {
          const correlations = EUROPEAN_MARKET_CORRELATIONS.filter(
            corr => corr.market1 === marketId || corr.market2 === marketId
          );
          return NextResponse.json({ correlations });
        }
        return NextResponse.json({ correlations: EUROPEAN_MARKET_CORRELATIONS });
        
      case 'get_cross_correlations':
        if (marketId) {
          const crossCorrelations = CROSS_CONTINENTAL_CORRELATIONS.filter(
            corr => corr.market1 === marketId || corr.market2 === marketId
          );
          return NextResponse.json({ correlations: crossCorrelations });
        }
        return NextResponse.json({ correlations: CROSS_CONTINENTAL_CORRELATIONS });
        
      default:
        // Return all available markets if no specific action
        const sources = europeanMarketDataService.getAllDataSources();
        return NextResponse.json({ 
          markets: sources.map(s => ({
            id: s.id,
            name: s.name,
            currency: s.currency,
            timezone: s.timezone,
            reliability: s.reliability
          }))
        });
    }
  } catch (error) {
    console.error('Error in European markets API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, marketId, data } = body;
    
    switch (action) {
      case 'refresh_market_data':
        if (!marketId) {
          return NextResponse.json({ error: 'Market ID is required' }, { status: 400 });
        }
        const refreshedData = await europeanMarketDataService.getMarketData(marketId);
        return NextResponse.json({ 
          success: true, 
          marketData: refreshedData,
          timestamp: new Date().toISOString()
        });
        
      case 'refresh_market_index':
        if (!marketId) {
          return NextResponse.json({ error: 'Market ID is required' }, { status: 400 });
        }
        const refreshedIndex = await europeanMarketDataService.getMarketIndex(marketId);
        return NextResponse.json({ 
          success: true, 
          marketIndex: refreshedIndex,
          timestamp: new Date().toISOString()
        });
        
      case 'refresh_all_markets':
        const allRefreshedData = await europeanMarketDataService.getAllMarketsData();
        return NextResponse.json({ 
          success: true, 
          markets: allRefreshedData,
          timestamp: new Date().toISOString()
        });
        
      case 'get_market_by_currency':
        if (!data?.currency) {
          return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
        }
        const marketsByCurrency = europeanMarketDataService.getMarketsByCurrency(data.currency);
        return NextResponse.json({ markets: marketsByCurrency });
        
      case 'get_market_by_timezone':
        if (!data?.timezone) {
          return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
        }
        const marketsByTimezone = europeanMarketDataService.getMarketsByTimezone(data.timezone);
        return NextResponse.json({ markets: marketsByTimezone });
        
      case 'batch_market_data':
        if (!data?.marketIds || !Array.isArray(data.marketIds)) {
          return NextResponse.json({ error: 'Valid market IDs array is required' }, { status: 400 });
        }
        
        const batchData: {[key: string]: any} = {};
        for (const id of data.marketIds) {
          try {
            const marketData = await europeanMarketDataService.getMarketData(id);
            const marketIndex = await europeanMarketDataService.getMarketIndex(id);
            batchData[id] = {
              data: marketData,
              index: marketIndex,
              timestamp: new Date().toISOString()
            };
          } catch (error) {
            batchData[id] = { error: `Failed to fetch data for ${id}` };
          }
        }
        
        return NextResponse.json({ 
          success: true, 
          batchData,
          timestamp: new Date().toISOString()
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in European markets POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}