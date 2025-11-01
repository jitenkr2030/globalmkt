import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// GET /api/pattern-recognition - Get recognized patterns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentId = searchParams.get('instrumentId');
    const patternType = searchParams.get('patternType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    
    if (instrumentId) {
      whereClause.instrumentId = instrumentId;
    }
    
    if (patternType) {
      whereClause.patternType = patternType;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const patterns = await db.patternRecognition.findMany({
      where: whereClause,
      include: {
        instrument: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(patterns);
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json({ error: 'Failed to fetch patterns' }, { status: 500 });
  }
}

// POST /api/pattern-recognition - Recognize patterns
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      instrumentId,
      timeframe = '1d',
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

    // Check if we have recent pattern analysis (within last 2 hours)
    const recentPattern = await db.patternRecognition.findFirst({
      where: {
        instrumentId,
        timeframe,
        timestamp: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
        }
      }
    });

    if (recentPattern && !forceRefresh) {
      return NextResponse.json({
        message: 'Using cached pattern analysis',
        pattern: recentPattern
      });
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    const patternPrompt = `Analyze technical chart patterns for ${instrument.symbol} (${instrument.name}) on ${timeframe} timeframe.

Current context:
- Instrument: ${instrument.symbol} - ${instrument.name}
- Type: ${instrument.type}
- Exchange: ${instrument.exchange}
- Current Price: ${instrument.currentPrice || 'Unknown'}
- Timeframe: ${timeframe}

Please identify and analyze any technical patterns that may be forming or have formed. Look for:

Common Chart Patterns:
1. Reversal Patterns:
   - Head and Shoulders / Inverse Head and Shoulders
   - Double Top / Double Bottom
   - Triple Top / Triple Bottom
   - Rounded Top / Rounded Bottom

2. Continuation Patterns:
   - Triangles (Ascending, Descending, Symmetrical)
   - Flags and Pennants
   - Rectangles
   - Cup and Handle

3. Candlestick Patterns:
   - Doji, Hammer, Shooting Star
   - Engulfing Patterns
   - Morning Star, Evening Star
   - Harami Patterns

For each pattern identified, provide:
- Pattern type and direction (bullish/bearish)
- Confidence level (0-1)
- Current status (forming, confirmed, failed, completed)
- Start and end prices if applicable
- Target price projection
- Stop price recommendation
- Key confirmation signals

Format your response as JSON array of patterns:
[
  {
    "patternType": "string",
    "direction": "bullish|bearish",
    "confidence": number,
    "status": "FORMING|CONFIRMED|FAILED|COMPLETED",
    "startPrice": number,
    "endPrice": number,
    "targetPrice": number,
    "stopPrice": number,
    "description": "detailed pattern analysis"
  }
]

If no clear patterns are identified, return an empty array.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical analyst specializing in chart pattern recognition. Provide accurate pattern identification with confidence scores and price targets.'
        },
        {
          role: 'user',
          content: patternPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI model');
    }

    let patternsData;
    try {
      patternsData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      // If response is not valid JSON, return empty patterns
      patternsData = [];
    }

    if (!Array.isArray(patternsData)) {
      patternsData = [];
    }

    const recognizedPatterns = [];

    // Create pattern records for each identified pattern
    for (const patternData of patternsData) {
      try {
        // Validate pattern data
        const validDirections = ['bullish', 'bearish'];
        const validStatuses = ['FORMING', 'CONFIRMED', 'FAILED', 'COMPLETED'];

        if (!validDirections.includes(patternData.direction) || 
            !validStatuses.includes(patternData.status)) {
          continue;
        }

        const pattern = await db.patternRecognition.create({
          data: {
            instrumentId,
            patternType: patternData.patternType,
            direction: patternData.direction,
            confidence: Math.max(0, Math.min(1, patternData.confidence || 0.5)),
            timeframe,
            startPrice: patternData.startPrice || 0,
            endPrice: patternData.endPrice || 0,
            targetPrice: patternData.targetPrice || null,
            stopPrice: patternData.stopPrice || null,
            status: patternData.status,
            metadata: JSON.stringify({
              description: patternData.description || '',
              analysis: responseContent
            })
          },
          include: {
            instrument: true
          }
        });

        recognizedPatterns.push(pattern);

      } catch (patternError) {
        console.error('Error creating pattern record:', patternError);
        // Continue with other patterns
      }
    }

    return NextResponse.json({
      message: 'Pattern recognition completed',
      patterns: recognizedPatterns,
      totalPatterns: recognizedPatterns.length
    });

  } catch (error) {
    console.error('Error recognizing patterns:', error);
    return NextResponse.json({ error: 'Failed to recognize patterns' }, { status: 500 });
  }
}