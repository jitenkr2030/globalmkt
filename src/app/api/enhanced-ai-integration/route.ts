import { NextRequest, NextResponse } from 'next/server';
import { enhancedAIIntegration, AIAnalysisResult, AIModel, AITrainingJob, AIInsight } from '@/lib/enhanced-ai-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'models';
    const marketId = searchParams.get('market');
    const type = searchParams.get('type');

    switch (action) {
      case 'models':
        const models = enhancedAIIntegration.getModels();
        return NextResponse.json({
          success: true,
          data: models,
          timestamp: new Date().toISOString()
        });

      case 'training-jobs':
        const trainingJobs = enhancedAIIntegration.getTrainingJobs();
        return NextResponse.json({
          success: true,
          data: trainingJobs,
          timestamp: new Date().toISOString()
        });

      case 'insights':
        const insights = enhancedAIIntegration.getInsights(marketId || undefined, type || undefined);
        return NextResponse.json({
          success: true,
          data: insights,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter',
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Enhanced AI integration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get enhanced AI integration data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Action parameter is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    switch (action) {
      case 'analyze-market':
        if (!body.marketId || !body.region) {
          return NextResponse.json({
            success: false,
            error: 'marketId and region are required',
            timestamp: new Date().toISOString()
          }, { status: 400 });
        }

        const analysis = await enhancedAIIntegration.analyzeMarket(body.marketId, body.region);
        return NextResponse.json({
          success: true,
          data: analysis,
          timestamp: new Date().toISOString()
        });

      case 'train-model':
        if (!body.modelId || !body.dataset) {
          return NextResponse.json({
            success: false,
            error: 'modelId and dataset are required',
            timestamp: new Date().toISOString()
          }, { status: 400 });
        }

        const trainingJob = await enhancedAIIntegration.trainModel(
          body.modelId,
          body.dataset,
          body.parameters || {}
        );
        return NextResponse.json({
          success: true,
          data: trainingJob,
          timestamp: new Date().toISOString()
        });

      case 'generate-trading-signal':
        if (!body.marketId || !body.strategy) {
          return NextResponse.json({
            success: false,
            error: 'marketId and strategy are required',
            timestamp: new Date().toISOString()
          }, { status: 400 });
        }

        const tradingSignal = await enhancedAIIntegration.generateTradingSignal(body.marketId, body.strategy);
        return NextResponse.json({
          success: true,
          data: tradingSignal,
          timestamp: new Date().toISOString()
        });

      case 'perform-sentiment-analysis':
        if (!body.marketId || !body.dataSource) {
          return NextResponse.json({
            success: false,
            error: 'marketId and dataSource are required',
            timestamp: new Date().toISOString()
          }, { status: 400 });
        }

        const sentimentAnalysis = await enhancedAIIntegration.performSentimentAnalysis(body.marketId, body.dataSource);
        return NextResponse.json({
          success: true,
          data: sentimentAnalysis,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action parameter',
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Enhanced AI integration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process enhanced AI integration request',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}