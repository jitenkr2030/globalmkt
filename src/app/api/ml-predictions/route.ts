import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// GET /api/ml-predictions - Get ML predictions for instruments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instrumentId = searchParams.get('instrumentId');
    const modelType = searchParams.get('modelType');
    const predictionType = searchParams.get('predictionType');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = {};
    
    if (instrumentId) {
      whereClause.instrumentId = instrumentId;
    }
    
    if (modelType) {
      whereClause.modelType = modelType;
    }
    
    if (predictionType) {
      whereClause.predictionType = predictionType;
    }

    // Only return non-expired predictions
    whereClause.expiresAt = {
      gte: new Date()
    };

    const predictions = await db.mLPrediction.findMany({
      where: whereClause,
      include: {
        instrument: true,
        model: true
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching ML predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch ML predictions' }, { status: 500 });
  }
}

// POST /api/ml-predictions - Generate new ML predictions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      instrumentId,
      modelType,
      predictionType,
      forceRefresh = false
    } = body;

    if (!instrumentId || !modelType || !predictionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if instrument exists
    const instrument = await db.instrument.findUnique({ 
      where: { id: instrumentId },
      include: { predictions: true }
    });

    if (!instrument) {
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }

    // Check if we have recent predictions (within last hour)
    const recentPrediction = await db.mLPrediction.findFirst({
      where: {
        instrumentId,
        modelType,
        predictionType,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        },
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (recentPrediction && !forceRefresh) {
      return NextResponse.json({
        message: 'Using cached prediction',
        prediction: recentPrediction
      });
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // Prepare prediction prompt based on model type
    let predictionPrompt = '';
    let predictionValue = 0;
    let confidence = 0;

    switch (modelType) {
      case 'price':
        predictionPrompt = `Generate a price prediction for ${instrument.symbol} (${instrument.name}). 
        Current price: ${instrument.currentPrice || 'Unknown'}. 
        Consider market conditions, trends, and technical indicators.
        Provide predicted price movement for ${predictionType} timeframe.
        Format your response as JSON: {"predictedPrice": number, "confidence": number, "reasoning": string}`;
        break;
      
      case 'volume':
        predictionPrompt = `Predict trading volume for ${instrument.symbol} (${instrument.name}).
        Current market conditions and recent volume trends.
        Provide volume prediction for ${predictionType} timeframe.
        Format your response as JSON: {"predictedVolume": number, "confidence": number, "reasoning": string}`;
        break;
      
      case 'volatility':
        predictionPrompt = `Predict volatility for ${instrument.symbol} (${instrument.name}).
        Current price: ${instrument.currentPrice || 'Unknown'}.
        Analyze market conditions and volatility patterns.
        Provide volatility prediction for ${predictionType} timeframe.
        Format your response as JSON: {"predictedVolatility": number, "confidence": number, "reasoning": string}`;
        break;
      
      case 'sentiment':
        predictionPrompt = `Analyze market sentiment for ${instrument.symbol} (${instrument.name}).
        Current price: ${instrument.currentPrice || 'Unknown'}.
        Consider news, social media, and market indicators.
        Provide sentiment score (-1 to 1) for ${predictionType} timeframe.
        Format your response as JSON: {"sentimentScore": number, "confidence": number, "reasoning": string}`;
        break;
      
      case 'trend':
        predictionPrompt = `Predict market trend for ${instrument.symbol} (${instrument.name}).
        Current price: ${instrument.currentPrice || 'Unknown'}.
        Analyze technical indicators and market patterns.
        Provide trend prediction (bullish/bearish) for ${predictionType} timeframe.
        Format your response as JSON: {"trend": string, "strength": number, "confidence": number, "reasoning": string}`;
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid model type' }, { status: 400 });
    }

    // Get prediction from ZAI
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial analyst and ML prediction model. Provide accurate, data-driven predictions with confidence scores.'
        },
        {
          role: 'user',
          content: predictionPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI model');
    }

    let predictionData;
    try {
      predictionData = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Invalid AI response format');
    }

    // Extract prediction value based on model type
    switch (modelType) {
      case 'price':
        predictionValue = predictionData.predictedPrice || 0;
        confidence = predictionData.confidence || 0.5;
        break;
      case 'volume':
        predictionValue = predictionData.predictedVolume || 0;
        confidence = predictionData.confidence || 0.5;
        break;
      case 'volatility':
        predictionValue = predictionData.predictedVolatility || 0;
        confidence = predictionData.confidence || 0.5;
        break;
      case 'sentiment':
        predictionValue = predictionData.sentimentScore || 0;
        confidence = predictionData.confidence || 0.5;
        break;
      case 'trend':
        predictionValue = predictionData.strength || 0;
        confidence = predictionData.confidence || 0.5;
        break;
    }

    // Calculate expiration time based on prediction type
    let expiresAt = new Date();
    switch (predictionType) {
      case 'short_term':
        expiresAt.setHours(expiresAt.getHours() + 1);
        break;
      case 'medium_term':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case 'long_term':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 4);
    }

    // Create or get ML model
    const modelName = `${modelType}_${predictionType}_predictor`;
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
          description: `AI-powered ${modelType} prediction model for ${predictionType} timeframe`,
          accuracy: 0.85, // Default accuracy
          isActive: true,
          lastTrained: new Date()
        }
      });
    }

    // Create prediction record
    const prediction = await db.mLPrediction.create({
      data: {
        instrumentId,
        modelId: mlModel.id,
        modelType,
        predictionType,
        predictedValue: predictionValue,
        confidence,
        expiresAt,
        modelVersion: modelVersion,
        features: JSON.stringify({
          instrumentSymbol: instrument.symbol,
          currentPrice: instrument.currentPrice,
          timestamp: new Date().toISOString()
        }),
        metadata: JSON.stringify({
          reasoning: predictionData.reasoning || 'AI-generated prediction',
          modelResponse: responseContent
        })
      },
      include: {
        instrument: true,
        model: true
      }
    });

    return NextResponse.json({
      message: 'Prediction generated successfully',
      prediction
    });

  } catch (error) {
    console.error('Error generating ML prediction:', error);
    return NextResponse.json({ error: 'Failed to generate ML prediction' }, { status: 500 });
  }
}