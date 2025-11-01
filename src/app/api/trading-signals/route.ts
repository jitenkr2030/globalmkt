import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// GET /api/trading-signals - Get trading signals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentId = searchParams.get('instrumentId');
    const signalType = searchParams.get('signalType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    
    if (instrumentId) {
      whereClause.instrumentId = instrumentId;
    }
    
    if (signalType) {
      whereClause.signalType = signalType;
    }
    
    if (status) {
      whereClause.status = status;
    } else {
      // Only return active signals by default
      whereClause.status = 'ACTIVE';
    }

    // Only return non-expired signals
    whereClause.expiresAt = {
      gte: new Date()
    };

    const signals = await db.tradingSignal.findMany({
      where: whereClause,
      include: {
        instrument: true,
        model: true,
        orders: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    return NextResponse.json({ error: 'Failed to fetch trading signals' }, { status: 500 });
  }
}

// POST /api/trading-signals - Generate new trading signals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      instrumentId,
      strategy = 'combined',
      timeframe = '1h',
      forceRefresh = false
    } = body;

    if (!instrumentId) {
      return NextResponse.json({ error: 'Instrument ID is required' }, { status: 400 });
    }

    // Check if instrument exists
    const instrument = await db.instrument.findUnique({ 
      where: { id: instrumentId },
      include: { 
        predictions: true,
        sentiments: true,
        patterns: true
      }
    });

    if (!instrument) {
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }

    // Check if we have recent active signals (within last 30 minutes)
    const recentSignal = await db.tradingSignal.findFirst({
      where: {
        instrumentId,
        status: 'ACTIVE',
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
        },
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (recentSignal && !forceRefresh) {
      return NextResponse.json({
        message: 'Using existing signal',
        signal: recentSignal
      });
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Gather market data for signal generation
    const recentPredictions = await db.mLPrediction.findMany({
      where: {
        instrumentId,
        expiresAt: { gte: new Date() }
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    const recentSentiments = await db.marketSentiment.findMany({
      where: {
        instrumentId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    const activePatterns = await db.patternRecognition.findMany({
      where: {
        instrumentId,
        status: { in: ['FORMING', 'CONFIRMED'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Prepare signal generation prompt
    const signalPrompt = `Generate a comprehensive trading signal for ${instrument.symbol} (${instrument.name}).

Current Market Data:
- Current Price: ${instrument.currentPrice || 'Unknown'}
- Timeframe: ${timeframe}
- Strategy: ${strategy}

Recent ML Predictions:
${recentPredictions.map(p => 
  `- ${p.modelType} (${p.predictionType}): ${p.predictedValue} (confidence: ${p.confidence})`
).join('\n')}

Recent Sentiment Analysis:
${recentSentiments.map(s => 
  `- ${s.source}: ${s.sentiment} (confidence: ${s.confidence}, volume: ${s.volume || 'N/A'})`
).join('\n')}

Active Patterns:
${activePatterns.map(p => 
  `- ${p.patternType}: ${p.direction} (confidence: ${p.confidence}, status: ${p.status})`
).join('\n')}

Analyze all available data and generate a trading signal. Consider:
1. Price predictions and trends
2. Market sentiment across multiple sources
3. Technical patterns and formations
4. Risk-reward ratios
5. Market conditions and volatility

Provide a comprehensive trading signal in JSON format:
{
  "signalType": "BUY|SELL|HOLD|STRONG_BUY|STRONG_SELL",
  "strength": number (0-1),
  "confidence": number (0-1),
  "priceTarget": number,
  "stopLoss": number,
  "riskReward": number,
  "reasoning": "detailed analysis",
  "keyFactors": ["factor1", "factor2", ...],
  "timeHorizon": "short|medium|long"
}`;

    // Get signal from ZAI
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert trading signal generator. Analyze market data comprehensively and provide high-confidence trading signals with proper risk management parameters.'
        },
        {
          role: 'user',
          content: signalPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI model');
    }

    let signalData;
    try {
      signalData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Invalid AI response format');
    }

    // Validate signal data
    const validSignalTypes = ['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL'];
    if (!validSignalTypes.includes(signalData.signalType)) {
      throw new Error('Invalid signal type in AI response');
    }

    // Calculate expiration time based on timeframe
    let expiresAt = new Date();
    switch (timeframe) {
      case '1m':
      case '5m':
      case '15m':
        expiresAt.setHours(expiresAt.getHours() + 1);
        break;
      case '30m':
      case '1h':
        expiresAt.setHours(expiresAt.getHours() + 4);
        break;
      case '4h':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case '1d':
        expiresAt.setDate(expiresAt.getDate() + 3);
        break;
      case '1w':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 4);
    }

    // Create or get ML model
    const modelName = 'trading_signal_generator';
    const modelVersion = '1.0.0';
    
    let mlModel = await db.mLModel.findFirst({
      where: {
        name: modelName,
        version: modelVersion
      }
    });

    if (!mlModel) {
      mlModel = await db.mLModel.create({
        data: {
          name: modelName,
          type: 'transformer',
          version: modelVersion,
          description: 'AI-powered trading signal generator using multiple data sources',
          accuracy: 0.82,
          isActive: true,
          lastTrained: new Date()
        }
      });
    }

    // Create trading signal record
    const signal = await db.tradingSignal.create({
      data: {
        instrumentId,
        modelId: mlModel.id,
        signalType: signalData.signalType,
        strategy,
        strength: Math.max(0, Math.min(1, signalData.strength || 0.5)),
        confidence: Math.max(0, Math.min(1, signalData.confidence || 0.5)),
        priceTarget: signalData.priceTarget,
        stopLoss: signalData.stopLoss,
        timeframe,
        riskReward: signalData.riskReward,
        status: 'ACTIVE',
        expiresAt,
        notes: signalData.reasoning
      },
      include: {
        instrument: true,
        model: true,
        orders: true
      }
    });

    return NextResponse.json({
      message: 'Trading signal generated successfully',
      signal
    });

  } catch (error) {
    console.error('Error generating trading signal:', error);
    return NextResponse.json({ error: 'Failed to generate trading signal' }, { status: 500 });
  }
}