'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  DollarSign,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Search
} from 'lucide-react';

interface MLPrediction {
  id: string;
  modelType: string;
  predictionType: string;
  predictedValue: number;
  confidence: number;
  actualValue?: number;
  accuracy?: number;
  timestamp: string;
  expiresAt: string;
  modelVersion: string;
  instrument: {
    symbol: string;
    name: string;
    currentPrice?: number;
  };
  model?: {
    name: string;
    type: string;
    accuracy?: number;
  };
}

interface TradingSignal {
  id: string;
  signalType: 'BUY' | 'SELL' | 'HOLD' | 'STRONG_BUY' | 'STRONG_SELL';
  strategy: string;
  strength: number;
  confidence: number;
  priceTarget?: number;
  stopLoss?: number;
  timeframe: string;
  riskReward?: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  instrument: {
    symbol: string;
    name: string;
  };
  orders: any[];
}

interface MarketSentiment {
  id: string;
  source: string;
  sentiment: number;
  confidence: number;
  volume?: number;
  timestamp: string;
  instrument: {
    symbol: string;
    name: string;
  };
}

interface PatternRecognition {
  id: string;
  patternType: string;
  direction: 'bullish' | 'bearish';
  confidence: number;
  timeframe: string;
  startPrice: number;
  endPrice: number;
  targetPrice?: number;
  stopPrice?: number;
  status: 'FORMING' | 'CONFIRMED' | 'FAILED' | 'COMPLETED';
  createdAt: string;
  instrument: {
    symbol: string;
    name: string;
  };
}

export default function MLPredictiveAnalytics() {
  const [predictions, setPredictions] = useState<MLPrediction[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [sentiments, setSentiments] = useState<MarketSentiment[]>([]);
  const [patterns, setPatterns] = useState<PatternRecognition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstrument, setSelectedInstrument] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('predictions');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPredictions: MLPrediction[] = [
      {
        id: '1',
        modelType: 'price',
        predictionType: 'short_term',
        predictedValue: 155.50,
        confidence: 0.87,
        timestamp: '2024-01-15T10:30:00Z',
        expiresAt: '2024-01-15T11:30:00Z',
        modelVersion: '1.0.0',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          currentPrice: 154.25
        },
        model: {
          name: 'price_short_term_predictor',
          type: 'neural_network',
          accuracy: 0.85
        }
      },
      {
        id: '2',
        modelType: 'volume',
        predictionType: 'medium_term',
        predictedValue: 52000000,
        confidence: 0.72,
        timestamp: '2024-01-15T09:15:00Z',
        expiresAt: '2024-01-16T09:15:00Z',
        modelVersion: '1.0.0',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        },
        model: {
          name: 'volume_medium_term_predictor',
          type: 'random_forest',
          accuracy: 0.78
        }
      }
    ];

    const mockSignals: TradingSignal[] = [
      {
        id: '1',
        signalType: 'STRONG_BUY',
        strategy: 'combined',
        strength: 0.85,
        confidence: 0.82,
        priceTarget: 165.00,
        stopLoss: 148.50,
        timeframe: '1h',
        riskReward: 2.5,
        status: 'ACTIVE',
        createdAt: '2024-01-15T10:00:00Z',
        expiresAt: '2024-01-15T14:00:00Z',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        },
        orders: []
      },
      {
        id: '2',
        signalType: 'SELL',
        strategy: 'ml_prediction',
        strength: 0.65,
        confidence: 0.71,
        priceTarget: 142.00,
        stopLoss: 158.00,
        timeframe: '4h',
        riskReward: 1.8,
        status: 'ACTIVE',
        createdAt: '2024-01-15T08:30:00Z',
        expiresAt: '2024-01-15T12:30:00Z',
        instrument: {
          symbol: 'TSLA',
          name: 'Tesla Inc.'
        },
        orders: []
      }
    ];

    const mockSentiments: MarketSentiment[] = [
      {
        id: '1',
        source: 'news',
        sentiment: 0.65,
        confidence: 0.89,
        volume: 150,
        timestamp: '2024-01-15T10:45:00Z',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        }
      },
      {
        id: '2',
        source: 'social_media',
        sentiment: 0.72,
        confidence: 0.76,
        volume: 2500,
        timestamp: '2024-01-15T10:30:00Z',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        }
      },
      {
        id: '3',
        source: 'analyst_ratings',
        sentiment: 0.58,
        confidence: 0.92,
        timestamp: '2024-01-15T09:00:00Z',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        }
      }
    ];

    const mockPatterns: PatternRecognition[] = [
      {
        id: '1',
        patternType: 'ascending_triangle',
        direction: 'bullish',
        confidence: 0.78,
        timeframe: '1d',
        startPrice: 148.50,
        endPrice: 154.25,
        targetPrice: 162.00,
        stopPrice: 147.00,
        status: 'CONFIRMED',
        createdAt: '2024-01-15T08:00:00Z',
        instrument: {
          symbol: 'AAPL',
          name: 'Apple Inc.'
        }
      },
      {
        id: '2',
        patternType: 'head_and_shoulders',
        direction: 'bearish',
        confidence: 0.65,
        timeframe: '4h',
        startPrice: 158.00,
        endPrice: 152.50,
        targetPrice: 145.00,
        stopPrice: 160.00,
        status: 'FORMING',
        createdAt: '2024-01-15T06:00:00Z',
        instrument: {
          symbol: 'TSLA',
          name: 'Tesla Inc.'
        }
      }
    ];

    setPredictions(mockPredictions);
    setSignals(mockSignals);
    setSentiments(mockSentiments);
    setPatterns(mockPatterns);
    setLoading(false);
  }, []);

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'STRONG_BUY': return 'bg-green-100 text-green-800 border-green-200';
      case 'BUY': return 'bg-green-50 text-green-700 border-green-200';
      case 'HOLD': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'SELL': return 'bg-red-50 text-red-700 border-red-200';
      case 'STRONG_SELL': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return 'text-green-600';
    if (sentiment < -0.3) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return <ThumbsUp className="h-4 w-4" />;
    if (sentiment < -0.3) return <ThumbsDown className="h-4 w-4" />;
    return <MessageSquare className="h-4 w-4" />;
  };

  const getPatternStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'FORMING': return 'bg-blue-100 text-blue-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generatePrediction = async (instrumentId: string, modelType: string, predictionType: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call the ML prediction API
      console.log(`Generating ${modelType} prediction for ${instrumentId}`);
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSignal = async (instrumentId: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would call the trading signal API
      console.log(`Generating trading signal for ${instrumentId}`);
    } catch (error) {
      console.error('Error generating signal:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSentiment = async (instrumentId: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // In a real implementation, this would call the sentiment analysis API
      console.log(`Analyzing sentiment for ${instrumentId}`);
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recognizePatterns = async (instrumentId: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // In a real implementation, this would call the pattern recognition API
      console.log(`Recognizing patterns for ${instrumentId}`);
    } catch (error) {
      console.error('Error recognizing patterns:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate aggregated metrics
  const avgPredictionConfidence = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length 
    : 0;

  const avgSignalStrength = signals.length > 0 
    ? signals.reduce((sum, s) => sum + s.strength, 0) / signals.length 
    : 0;

  const aggregatedSentiment = sentiments.length > 0 
    ? sentiments.reduce((sum, s) => sum + s.sentiment * s.confidence, 0) / sentiments.reduce((sum, s) => sum + s.confidence, 0) 
    : 0;

  const avgPatternConfidence = patterns.length > 0 
    ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">ML Predictions</span>
            </div>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <div className="text-sm text-muted-foreground">
              Avg Confidence: {(avgPredictionConfidence * 100).toFixed(1)}%
            </div>
            <Progress value={avgPredictionConfidence * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Trading Signals</span>
            </div>
            <div className="text-2xl font-bold">{signals.filter(s => s.status === 'ACTIVE').length}</div>
            <div className="text-sm text-muted-foreground">
              Avg Strength: {(avgSignalStrength * 100).toFixed(1)}%
            </div>
            <Progress value={avgSignalStrength * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Market Sentiment</span>
            </div>
            <div className={`text-2xl font-bold ${getSentimentColor(aggregatedSentiment)}`}>
              {aggregatedSentiment > 0 ? '+' : ''}{(aggregatedSentiment * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {sentiments.length} sources analyzed
            </div>
            <Progress value={Math.abs(aggregatedSentiment) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Patterns</span>
            </div>
            <div className="text-2xl font-bold">{patterns.filter(p => p.status === 'CONFIRMED').length}</div>
            <div className="text-sm text-muted-foreground">
              Avg Confidence: {(avgPatternConfidence * 100).toFixed(1)}%
            </div>
            <Progress value={avgPatternConfidence * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="sentiment">Market Sentiment</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Machine Learning Predictions</h3>
            <div className="flex space-x-2">
              <Button 
                onClick={() => generatePrediction(selectedInstrument, 'price', 'short_term')}
                disabled={isAnalyzing}
                size="sm"
              >
                {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                Generate Price Prediction
              </Button>
              <Button 
                onClick={() => generatePrediction(selectedInstrument, 'volume', 'medium_term')}
                disabled={isAnalyzing}
                variant="outline"
                size="sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Volume Prediction
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {prediction.instrument.symbol.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{prediction.instrument.symbol}</div>
                          <div className="text-sm text-muted-foreground">{prediction.instrument.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {prediction.modelType}
                        </Badge>
                        <Badge variant="secondary">
                          {prediction.predictionType}
                        </Badge>
                        <Badge variant={prediction.confidence > 0.7 ? 'default' : 'outline'}>
                          {(prediction.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {prediction.modelType === 'price' ? '$' : ''}
                          {prediction.predictedValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(prediction.expiresAt).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {prediction.modelType === 'price' && prediction.instrument.currentPrice && (
                          <div className={`text-sm ${prediction.predictedValue > prediction.instrument.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                            {prediction.predictedValue > prediction.instrument.currentPrice ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {((prediction.predictedValue - prediction.instrument.currentPrice) / prediction.instrument.currentPrice * 100).toFixed(2)}%
                          </div>
                        )}
                        <Progress value={prediction.confidence * 100} className="w-16 h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Model: {prediction.model?.name}</span>
                      <span>Version: {prediction.modelVersion}</span>
                      {prediction.model?.accuracy && (
                        <span>Accuracy: {(prediction.model.accuracy * 100).toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI Trading Signals</h3>
            <Button 
              onClick={() => generateSignal(selectedInstrument)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Target className="h-4 w-4 mr-2" />}
              Generate Trading Signal
            </Button>
          </div>

          <div className="grid gap-4">
            {signals.map((signal) => (
              <Card key={signal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {signal.instrument.symbol.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{signal.instrument.symbol}</div>
                          <div className="text-sm text-muted-foreground">{signal.instrument.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getSignalColor(signal.signalType)}>
                          {signal.signalType}
                        </Badge>
                        <Badge variant="outline">
                          {signal.strategy}
                        </Badge>
                        <Badge variant="secondary">
                          {signal.timeframe}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          Strength: {(signal.strength * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(signal.confidence * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {signal.priceTarget && signal.stopLoss && (
                          <div className="text-sm text-right">
                            <div className="text-green-600">Target: ${signal.priceTarget}</div>
                            <div className="text-red-600">Stop: ${signal.stopLoss}</div>
                          </div>
                        )}
                        {signal.riskReward && (
                          <Badge variant="outline">
                            R/R {signal.riskReward}:1
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Signal Strength</span>
                      </div>
                      <Progress value={signal.strength * 100} className="mt-2 h-2" />
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">AI Confidence</span>
                      </div>
                      <Progress value={signal.confidence * 100} className="mt-2 h-2" />
                    </div>
                    
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Expires</span>
                      </div>
                      <div className="text-sm mt-1">
                        {new Date(signal.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Market Sentiment Analysis</h3>
            <Button 
              onClick={() => analyzeSentiment(selectedInstrument)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
              Analyze Sentiment
            </Button>
          </div>

          <div className="grid gap-4">
            {sentiments.map((sentiment) => (
              <Card key={sentiment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {sentiment.instrument.symbol.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{sentiment.instrument.symbol}</div>
                          <div className="text-sm text-muted-foreground">{sentiment.instrument.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {sentiment.source}
                        </Badge>
                        {sentiment.volume && (
                          <Badge variant="secondary">
                            Volume: {sentiment.volume.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getSentimentColor(sentiment.sentiment)}`}>
                          {sentiment.sentiment > 0 ? '+' : ''}{(sentiment.sentiment * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(sentiment.confidence * 100).toFixed(0)}%
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(sentiment.sentiment)}
                        <Progress value={Math.abs(sentiment.sentiment) * 100} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Source: {sentiment.source}</span>
                      <span>{new Date(sentiment.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Technical Pattern Recognition</h3>
            <Button 
              onClick={() => recognizePatterns(selectedInstrument)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Recognize Patterns
            </Button>
          </div>

          <div className="grid gap-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {pattern.instrument.symbol.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{pattern.instrument.symbol}</div>
                          <div className="text-sm text-muted-foreground">{pattern.instrument.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {pattern.patternType.replace('_', ' ')}
                        </Badge>
                        <Badge className={pattern.direction === 'bullish' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {pattern.direction}
                        </Badge>
                        <Badge className={getPatternStatusColor(pattern.status)}>
                          {pattern.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold">
                          {(pattern.confidence * 100).toFixed(0)}% confidence
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {pattern.timeframe} timeframe
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {pattern.targetPrice && (
                          <div className="text-sm text-right">
                            <div className="text-green-600">Target: ${pattern.targetPrice}</div>
                            <div className="text-red-600">Stop: ${pattern.stopPrice}</div>
                          </div>
                        )}
                        <Progress value={pattern.confidence * 100} className="w-16 h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Pattern Formation</div>
                      <div className="text-xs text-muted-foreground">
                        Start: ${pattern.startPrice} → End: ${pattern.endPrice}
                      </div>
                      <Progress value={pattern.confidence * 100} className="mt-2 h-2" />
                    </div>
                    
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium mb-1">Potential Outcome</div>
                      <div className="text-xs text-muted-foreground">
                        {pattern.direction === 'bullish' ? 'Bullish breakout expected' : 'Bearish breakdown expected'}
                      </div>
                      <div className="text-xs mt-1">
                        Created: {new Date(pattern.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}