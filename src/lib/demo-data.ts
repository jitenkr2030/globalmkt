import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

async function createDemoData() {
  console.log('Creating demo data...');

  try {
    // Create demo instruments
    const instruments = await Promise.all([
      db.instrument.create({
        data: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          tickSize: 0.01,
          lotSize: 1,
          currentPrice: 154.25,
        },
      }),
      db.instrument.create({
        data: {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          tickSize: 0.01,
          lotSize: 1,
          currentPrice: 238.45,
        },
      }),
      db.instrument.create({
        data: {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          tickSize: 0.01,
          lotSize: 1,
          currentPrice: 138.21,
        },
      }),
      db.instrument.create({
        data: {
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          tickSize: 0.01,
          lotSize: 1,
          currentPrice: 378.85,
        },
      }),
      db.instrument.create({
        data: {
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          type: 'stock',
          exchange: 'NASDAQ',
          currency: 'USD',
          tickSize: 0.01,
          lotSize: 1,
          currentPrice: 155.33,
        },
      }),
    ]);

    console.log(`Created ${instruments.length} instruments`);

    // Create demo ML models
    const models = await Promise.all([
      db.mLModel.create({
        data: {
          name: 'price_short_term_predictor',
          type: 'neural_network',
          version: '1.0.0',
          description: 'Short-term price prediction using LSTM neural network',
          accuracy: 0.85,
          precision: 0.82,
          recall: 0.87,
          f1Score: 0.84,
          trainingData: JSON.stringify({
            dataset: 'historical_prices_2020_2024',
            samples: 100000,
            features: ['price', 'volume', 'volatility', 'technical_indicators'],
          }),
          hyperparameters: JSON.stringify({
            layers: 4,
            units: 128,
            dropout: 0.2,
            learning_rate: 0.001,
            epochs: 100,
          }),
          lastTrained: new Date('2024-01-10T00:00:00Z'),
        },
      }),
      db.mLModel.create({
        data: {
          name: 'volume_medium_term_predictor',
          type: 'random_forest',
          version: '1.0.0',
          description: 'Medium-term volume prediction using Random Forest',
          accuracy: 0.78,
          precision: 0.75,
          recall: 0.81,
          f1Score: 0.78,
          trainingData: JSON.stringify({
            dataset: 'volume_patterns_2020_2024',
            samples: 50000,
            features: ['volume', 'price_change', 'volatility', 'market_sentiment'],
          }),
          hyperparameters: JSON.stringify({
            n_estimators: 100,
            max_depth: 10,
            min_samples_split: 5,
            random_state: 42,
          }),
          lastTrained: new Date('2024-01-08T00:00:00Z'),
        },
      }),
      db.mLModel.create({
        data: {
          name: 'volatility_predictor',
          type: 'gradient_boosting',
          version: '1.0.0',
          description: 'Volatility prediction using Gradient Boosting',
          accuracy: 0.82,
          precision: 0.79,
          recall: 0.85,
          f1Score: 0.82,
          trainingData: JSON.stringify({
            dataset: 'volatility_data_2020_2024',
            samples: 75000,
            features: ['historical_volatility', 'volume', 'price_range', 'market_conditions'],
          }),
          hyperparameters: JSON.stringify({
            n_estimators: 200,
            learning_rate: 0.1,
            max_depth: 6,
            subsample: 0.8,
          }),
          lastTrained: new Date('2024-01-12T00:00:00Z'),
        },
      }),
      db.mLModel.create({
        data: {
          name: 'sentiment_analyzer',
          type: 'transformer',
          version: '1.0.0',
          description: 'Market sentiment analysis using BERT transformer',
          accuracy: 0.89,
          precision: 0.87,
          recall: 0.91,
          f1Score: 0.89,
          trainingData: JSON.stringify({
            dataset: 'news_social_media_2020_2024',
            samples: 200000,
            features: ['text_content', 'source', 'timestamp', 'engagement_metrics'],
          }),
          hyperparameters: JSON.stringify({
            model_size: 'base',
            batch_size: 32,
            learning_rate: 2e-5,
            epochs: 3,
          }),
          lastTrained: new Date('2024-01-15T00:00:00Z'),
        },
      }),
    ]);

    console.log(`Created ${models.length} ML models`);

    // Create demo ML predictions
    const predictions = await Promise.all([
      // AAPL predictions
      db.mLPrediction.create({
        data: {
          instrumentId: instruments[0].id,
          modelId: models[0].id,
          modelType: 'price',
          predictionType: 'short_term',
          predictedValue: 155.50,
          confidence: 0.87,
          actualValue: 154.25,
          accuracy: 0.85,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          modelVersion: '1.0.0',
          features: JSON.stringify({
            current_price: 154.25,
            volume: 45000000,
            volatility: 0.025,
            rsi: 65.4,
            macd: 0.85,
          }),
        },
      }),
      db.mLPrediction.create({
        data: {
          instrumentId: instruments[0].id,
          modelId: models[1].id,
          modelType: 'volume',
          predictionType: 'medium_term',
          predictedValue: 52000000,
          confidence: 0.72,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          modelVersion: '1.0.0',
          features: JSON.stringify({
            avg_volume: 48000000,
            price_change: 0.025,
            volatility: 0.025,
            market_sentiment: 0.65,
          }),
        },
      }),
      db.mLPrediction.create({
        data: {
          instrumentId: instruments[0].id,
          modelId: models[2].id,
          modelType: 'volatility',
          predictionType: 'short_term',
          predictedValue: 0.035,
          confidence: 0.82,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          modelVersion: '1.0.0',
          features: JSON.stringify({
            historical_volatility: 0.025,
            volume: 45000000,
            price_range: 2.5,
            market_conditions: 'volatile',
          }),
        },
      }),
      // TSLA predictions
      db.mLPrediction.create({
        data: {
          instrumentId: instruments[1].id,
          modelId: models[0].id,
          modelType: 'price',
          predictionType: 'short_term',
          predictedValue: 242.30,
          confidence: 0.79,
          actualValue: 238.45,
          accuracy: 0.76,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          modelVersion: '1.0.0',
          features: JSON.stringify({
            current_price: 238.45,
            volume: 85000000,
            volatility: 0.045,
            rsi: 58.2,
            macd: -0.65,
          }),
        },
      }),
      // GOOGL predictions
      db.mLPrediction.create({
        data: {
          instrumentId: instruments[2].id,
          modelId: models[0].id,
          modelType: 'price',
          predictionType: 'medium_term',
          predictedValue: 142.50,
          confidence: 0.84,
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          modelVersion: '1.0.0',
          features: JSON.stringify({
            current_price: 138.21,
            volume: 28000000,
            volatility: 0.022,
            rsi: 72.1,
            macd: 1.25,
          }),
        },
      }),
    ]);

    console.log(`Created ${predictions.length} ML predictions`);

    // Create demo trading signals
    const signals = await Promise.all([
      // AAPL signals
      db.tradingSignal.create({
        data: {
          instrumentId: instruments[0].id,
          modelId: models[0].id,
          signalType: 'STRONG_BUY',
          strategy: 'combined',
          strength: 0.85,
          confidence: 0.82,
          priceTarget: 165.00,
          stopLoss: 148.50,
          timeframe: '1h',
          riskReward: 2.5,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          notes: 'Strong buy signal based on ML prediction and technical analysis',
        },
      }),
      db.tradingSignal.create({
        data: {
          instrumentId: instruments[0].id,
          modelId: models[1].id,
          signalType: 'BUY',
          strategy: 'ml_prediction',
          strength: 0.72,
          confidence: 0.75,
          priceTarget: 158.00,
          stopLoss: 150.00,
          timeframe: '4h',
          riskReward: 2.0,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
          notes: 'Buy signal based on volume prediction model',
        },
      }),
      // TSLA signals
      db.tradingSignal.create({
        data: {
          instrumentId: instruments[1].id,
          modelId: models[0].id,
          signalType: 'SELL',
          strategy: 'ml_prediction',
          strength: 0.65,
          confidence: 0.71,
          priceTarget: 142.00,
          stopLoss: 158.00,
          timeframe: '4h',
          riskReward: 1.8,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          notes: 'Sell signal based on price prediction model',
        },
      }),
      db.tradingSignal.create({
        data: {
          instrumentId: instruments[1].id,
          modelId: models[2].id,
          signalType: 'HOLD',
          strategy: 'technical_analysis',
          strength: 0.55,
          confidence: 0.68,
          timeframe: '1d',
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          notes: 'Hold signal due to high volatility uncertainty',
        },
      }),
      // GOOGL signals
      db.tradingSignal.create({
        data: {
          instrumentId: instruments[2].id,
          modelId: models[0].id,
          signalType: 'STRONG_BUY',
          strategy: 'combined',
          strength: 0.88,
          confidence: 0.85,
          priceTarget: 148.00,
          stopLoss: 135.00,
          timeframe: '1d',
          riskReward: 2.8,
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          notes: 'Strong buy signal with high confidence',
        },
      }),
    ]);

    console.log(`Created ${signals.length} trading signals`);

    // Create demo market sentiment data
    const sentiments = await Promise.all([
      // AAPL sentiment
      db.marketSentiment.create({
        data: {
          instrumentId: instruments[0].id,
          source: 'news',
          sentiment: 0.65,
          confidence: 0.89,
          volume: 150,
          metadata: JSON.stringify({
            keywords: ['innovation', 'growth', 'earnings'],
            sentiment_score: 0.65,
            articles_analyzed: 150,
          }),
        },
      }),
      db.marketSentiment.create({
        data: {
          instrumentId: instruments[0].id,
          source: 'social_media',
          sentiment: 0.72,
          confidence: 0.76,
          volume: 2500,
          metadata: JSON.stringify({
            platform: 'twitter',
            engagement_rate: 0.085,
            trending_hashtags: ['AAPL', 'tech', 'stocks'],
          }),
        },
      }),
      db.marketSentiment.create({
        data: {
          instrumentId: instruments[0].id,
          source: 'analyst_ratings',
          sentiment: 0.58,
          confidence: 0.92,
          metadata: JSON.stringify({
            analysts_count: 25,
            avg_rating: 4.2,
            price_targets: [160, 165, 170],
          }),
        },
      }),
      // TSLA sentiment
      db.marketSentiment.create({
        data: {
          instrumentId: instruments[1].id,
          source: 'news',
          sentiment: -0.25,
          confidence: 0.81,
          volume: 200,
          metadata: JSON.stringify({
            keywords: ['regulation', 'competition', 'delivery'],
            sentiment_score: -0.25,
            articles_analyzed: 200,
          }),
        },
      }),
      db.marketSentiment.create({
        data: {
          instrumentId: instruments[1].id,
          source: 'social_media',
          sentiment: 0.15,
          confidence: 0.68,
          volume: 4200,
          metadata: JSON.stringify({
            platform: 'reddit',
            engagement_rate: 0.125,
            trending_hashtags: ['TSLA', 'Elon', 'EV'],
          }),
        },
      }),
      // GOOGL sentiment
      db.marketSentiment.create({
        data: {
          instrumentId: instruments[2].id,
          source: 'news',
          sentiment: 0.48,
          confidence: 0.85,
          volume: 120,
          metadata: JSON.stringify({
            keywords: ['AI', 'cloud', 'advertising'],
            sentiment_score: 0.48,
            articles_analyzed: 120,
          }),
        },
      }),
    ]);

    console.log(`Created ${sentiments.length} market sentiment entries`);

    // Create demo pattern recognition data
    const patterns = await Promise.all([
      // AAPL patterns
      db.patternRecognition.create({
        data: {
          instrumentId: instruments[0].id,
          patternType: 'ascending_triangle',
          direction: 'bullish',
          confidence: 0.78,
          timeframe: '1d',
          startPrice: 148.50,
          endPrice: 154.25,
          targetPrice: 162.00,
          stopPrice: 147.00,
          status: 'CONFIRMED',
          completedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
      }),
      db.patternRecognition.create({
        data: {
          instrumentId: instruments[0].id,
          patternType: 'cup_and_handle',
          direction: 'bullish',
          confidence: 0.65,
          timeframe: '4h',
          startPrice: 150.00,
          endPrice: 154.25,
          targetPrice: 160.00,
          stopPrice: 148.00,
          status: 'FORMING',
        },
      }),
      // TSLA patterns
      db.patternRecognition.create({
        data: {
          instrumentId: instruments[1].id,
          patternType: 'head_and_shoulders',
          direction: 'bearish',
          confidence: 0.82,
          timeframe: '4h',
          startPrice: 258.00,
          endPrice: 238.45,
          targetPrice: 220.00,
          stopPrice: 265.00,
          status: 'CONFIRMED',
          completedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
      }),
      db.patternRecognition.create({
        data: {
          instrumentId: instruments[1].id,
          patternType: 'double_top',
          direction: 'bearish',
          confidence: 0.71,
          timeframe: '1h',
          startPrice: 245.00,
          endPrice: 238.45,
          targetPrice: 230.00,
          stopPrice: 250.00,
          status: 'FORMING',
        },
      }),
      // GOOGL patterns
      db.patternRecognition.create({
        data: {
          instrumentId: instruments[2].id,
          patternType: 'bull_flag',
          direction: 'bullish',
          confidence: 0.75,
          timeframe: '1d',
          startPrice: 132.00,
          endPrice: 138.21,
          targetPrice: 145.00,
          stopPrice: 130.00,
          status: 'CONFIRMED',
          completedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        },
      }),
    ]);

    console.log(`Created ${patterns.length} pattern recognition entries`);

    console.log('Demo data created successfully!');
    console.log('Summary:');
    console.log(`- Instruments: ${instruments.length}`);
    console.log(`- ML Models: ${models.length}`);
    console.log(`- ML Predictions: ${predictions.length}`);
    console.log(`- Trading Signals: ${signals.length}`);
    console.log(`- Market Sentiments: ${sentiments.length}`);
    console.log(`- Pattern Recognitions: ${patterns.length}`);

  } catch (error) {
    console.error('Error creating demo data:', error);
    throw error;
  }
}

// Export the function
export { createDemoData };

// Run if called directly
if (require.main === module) {
  createDemoData()
    .then(() => {
      console.log('Demo data creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Demo data creation failed:', error);
      process.exit(1);
    });
}