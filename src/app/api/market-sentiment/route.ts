import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// GET /api/market-sentiment - Get market sentiment data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentId = searchParams.get('instrumentId');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '100');

    const whereClause: any = {};
    
    if (instrumentId) {
      whereClause.instrumentId = instrumentId;
    }
    
    if (source) {
      whereClause.source = source;
    }

    // Get sentiment from last 24 hours by default
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    whereClause.timestamp = {
      gte: twentyFourHoursAgo
    };

    const sentiments = await db.marketSentiment.findMany({
      where: whereClause,
      include: {
        instrument: true
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Calculate aggregated sentiment
    if (sentiments.length > 0) {
      const aggregatedSentiment = sentiments.reduce((acc, sentiment) => {
        acc.totalSentiment += sentiment.sentiment * sentiment.confidence;
        acc.totalWeight += sentiment.confidence;
        acc.sources.add(sentiment.source);
        return acc;
      }, { totalSentiment: 0, totalWeight: 0, sources: new Set() });

      const averageSentiment = aggregatedSentiment.totalSentiment / aggregatedSentiment.totalWeight;
      
      return NextResponse.json({
        sentiments,
        aggregated: {
          sentiment: averageSentiment,
          confidence: aggregatedSentiment.totalWeight / sentiments.length,
          sources: Array.from(aggregatedSentiment.sources),
          dataPoints: sentiments.length
        }
      });
    }

    return NextResponse.json({ sentiments, aggregated: null });
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    return NextResponse.json({ error: 'Failed to fetch market sentiment' }, { status: 500 });
  }
}

// POST /api/market-sentiment - Analyze market sentiment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      instrumentId,
      sources = ['news', 'social_media', 'analyst_ratings'],
      forceRefresh = false
    } = body;

    if (!instrumentId) {
      return NextResponse.json({ error: 'Instrument ID is required' }, { status: 400 });
    }

    // Check if instrument exists
    const instrument = await db.instrument.findUnique({ 
      where: { id: instrumentId }
    });

    if (!instrument) {
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }

    // Check if we have recent sentiment analysis (within last hour)
    const recentSentiment = await db.marketSentiment.findFirst({
      where: {
        instrumentId,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    if (recentSentiment && !forceRefresh) {
      return NextResponse.json({
        message: 'Using cached sentiment analysis',
        sentiment: recentSentiment
      });
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    const sentimentResults = [];

    // Analyze sentiment for each source
    for (const source of sources) {
      try {
        const sentimentPrompt = `Analyze market sentiment for ${instrument.symbol} (${instrument.name}) from ${source} perspective.

Current context:
- Instrument: ${instrument.symbol} - ${instrument.name}
- Type: ${instrument.type}
- Exchange: ${instrument.exchange}
- Current Price: ${instrument.currentPrice || 'Unknown'}

Focus on ${source} sentiment analysis:
${source === 'news' ? 'Recent news articles, press releases, and media coverage' : ''}
${source === 'social_media' ? 'Social media discussions, forums, and community sentiment' : ''}
${source === 'analyst_ratings' ? 'Analyst recommendations, ratings, and professional opinions' : ''}
${source === 'options_market' ? 'Options market activity, put/call ratios, and implied volatility' : ''}

Provide sentiment analysis in JSON format:
{
  "sentiment": number (-1 to 1, where -1 is very negative, 0 is neutral, 1 is very positive),
  "confidence": number (0 to 1),
  "volume": number (social media posts, news articles, etc.),
  "keyFactors": ["factor1", "factor2", ...],
  "summary": "brief summary of sentiment analysis"
}`;

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `You are an expert ${source} sentiment analyst for financial markets. Provide accurate, nuanced sentiment analysis with confidence scores.`
            },
            {
              role: 'user',
              content: sentimentPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
          throw new Error(`No response from AI model for ${source}`);
        }

        let sentimentData;
        try {
          sentimentData = JSON.parse(responseContent);
        } catch (parseError) {
          console.error(`Failed to parse AI response for ${source}:`, responseContent);
          continue;
        }

        // Validate sentiment data
        const sentiment = Math.max(-1, Math.min(1, sentimentData.sentiment || 0));
        const confidence = Math.max(0, Math.min(1, sentimentData.confidence || 0.5));

        // Create sentiment record
        const sentimentRecord = await db.marketSentiment.create({
          data: {
            instrumentId,
            source,
            sentiment,
            confidence,
            volume: sentimentData.volume || null,
            metadata: JSON.stringify({
              keyFactors: sentimentData.keyFactors || [],
              summary: sentimentData.summary || '',
              analysis: responseContent
            })
          },
          include: {
            instrument: true
          }
        });

        sentimentResults.push(sentimentRecord);

      } catch (sourceError) {
        console.error(`Error analyzing ${source} sentiment:`, sourceError);
        // Continue with other sources
      }
    }

    if (sentimentResults.length === 0) {
      return NextResponse.json({ error: 'Failed to analyze sentiment for any source' }, { status: 500 });
    }

    // Calculate aggregated sentiment
    const aggregatedSentiment = sentimentResults.reduce((acc, sentiment) => {
      acc.totalSentiment += sentiment.sentiment * sentiment.confidence;
      acc.totalWeight += sentiment.confidence;
      return acc;
    }, { totalSentiment: 0, totalWeight: 0 });

    const averageSentiment = aggregatedSentiment.totalSentiment / aggregatedSentiment.totalWeight;

    return NextResponse.json({
      message: 'Market sentiment analysis completed',
      sentiments: sentimentResults,
      aggregated: {
        sentiment: averageSentiment,
        confidence: aggregatedSentiment.totalWeight / sentimentResults.length,
        sources: sentimentResults.map(s => s.source),
        dataPoints: sentimentResults.length
      }
    });

  } catch (error) {
    console.error('Error analyzing market sentiment:', error);
    return NextResponse.json({ error: 'Failed to analyze market sentiment' }, { status: 500 });
  }
}