'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  AIAnalysisResult, 
  AIModel, 
  AITrainingJob, 
  AIInsight,
  enhancedAIIntegration 
} from '@/lib/enhanced-ai-integration';

interface EnhancedAIIntegrationProps {
  selectedMarket?: string;
  selectedRegion?: string;
}

export default function EnhancedAIIntegration({ 
  selectedMarket = 'nyse', 
  selectedRegion = 'americas' 
}: EnhancedAIIntegrationProps) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<AITrainingJob[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch models
        const modelsResponse = await fetch('/api/enhanced-ai-integration?action=models');
        const modelsData = await modelsResponse.json();
        
        if (modelsData.success) {
          setModels(modelsData.data);
        }
        
        // Fetch training jobs
        const trainingJobsResponse = await fetch('/api/enhanced-ai-integration?action=training-jobs');
        const trainingJobsData = await trainingJobsResponse.json();
        
        if (trainingJobsData.success) {
          setTrainingJobs(trainingJobsData.data);
        }
        
        // Fetch insights
        const insightsResponse = await fetch('/api/enhanced-ai-integration?action=insights');
        const insightsData = await insightsResponse.json();
        
        if (insightsData.success) {
          setInsights(insightsData.data);
        }
        
        setLastUpdate(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching enhanced AI integration data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAnalyzeMarket = async () => {
    try {
      setAnalyzing(true);
      
      const response = await fetch('/api/enhanced-ai-integration?action=analyze-market', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marketId: selectedMarket,
          region: selectedRegion
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMarketAnalysis(data.data);
        // Refresh insights
        const insightsResponse = await fetch('/api/enhanced-ai-integration?action=insights');
        const insightsData = await insightsResponse.json();
        if (insightsData.success) {
          setInsights(insightsData.data);
        }
      }
    } catch (error) {
      console.error('Error analyzing market:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTrainModel = async (modelId: string) => {
    try {
      const response = await fetch('/api/enhanced-ai-integration?action=train-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          dataset: 'market_data_2024',
          parameters: {
            epochs: 100,
            batchSize: 32,
            learningRate: 0.001,
            validationSplit: 0.2
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh training jobs
        const trainingJobsResponse = await fetch('/api/enhanced-ai-integration?action=training-jobs');
        const trainingJobsData = await trainingJobsResponse.json();
        if (trainingJobsData.success) {
          setTrainingJobs(trainingJobsData.data);
        }
      }
    } catch (error) {
      console.error('Error training model:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'training': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
        <h2 className="text-2xl font-bold">Enhanced AI Integration</h2>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleAnalyzeMarket} 
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzing ? 'Analyzing...' : `Analyze ${selectedMarket}`}
          </Button>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models">AI Models</TabsTrigger>
          <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(model.status)}`}></div>
                  </div>
                  <CardDescription className="text-xs">{model.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy:</span>
                      <span className="font-semibold">{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant="secondary">{model.status}</Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last trained: {new Date(model.lastTrained).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      Data size: {model.trainingDataSize.toLocaleString()}
                    </div>
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleTrainModel(model.id)}
                        disabled={model.status === 'training'}
                        className="w-full"
                      >
                        {model.status === 'training' ? 'Training...' : 'Train Model'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {marketAnalysis ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Market Analysis for {marketAnalysis.market}</CardTitle>
                  <CardDescription>AI-powered comprehensive market analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Short-term Prediction</h4>
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="font-medium capitalize">{marketAnalysis.predictions.shortTerm.direction}</div>
                        <div className={`text-sm ${getConfidenceColor(marketAnalysis.predictions.shortTerm.confidence)}`}>
                          Confidence: {(marketAnalysis.predictions.shortTerm.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">{marketAnalysis.predictions.shortTerm.timeframe}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Medium-term Prediction</h4>
                      <div className="p-3 bg-green-50 rounded">
                        <div className="font-medium capitalize">{marketAnalysis.predictions.mediumTerm.direction}</div>
                        <div className={`text-sm ${getConfidenceColor(marketAnalysis.predictions.mediumTerm.confidence)}`}>
                          Confidence: {(marketAnalysis.predictions.mediumTerm.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">{marketAnalysis.predictions.mediumTerm.timeframe}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Long-term Prediction</h4>
                      <div className="p-3 bg-purple-50 rounded">
                        <div className="font-medium capitalize">{marketAnalysis.predictions.longTerm.direction}</div>
                        <div className={`text-sm ${getConfidenceColor(marketAnalysis.predictions.longTerm.confidence)}`}>
                          Confidence: {(marketAnalysis.predictions.longTerm.confidence * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">{marketAnalysis.predictions.longTerm.timeframe}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                    <CardDescription>AI-generated risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Risk Level:</span>
                        <Badge variant="destructive" className={getRiskColor(marketAnalysis.riskFactors.level)}>
                          {marketAnalysis.riskFactors.level.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">Risk Factors:</h5>
                        <ul className="text-sm space-y-1">
                          {marketAnalysis.riskFactors.factors.map((factor, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-2">Mitigation Strategies:</h5>
                        <ul className="text-sm space-y-1">
                          {marketAnalysis.riskFactors.mitigation.map((strategy, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                              <span>{strategy}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Opportunities</CardTitle>
                    <CardDescription>AI-identified trading opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {marketAnalysis.opportunities.map((opportunity, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{opportunity.type}</span>
                            <Badge variant="secondary" className={getRiskColor(opportunity.riskLevel)}>
                              {opportunity.riskLevel}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span>Potential Return: {opportunity.potentialReturn.toFixed(1)}%</span>
                            <span className="text-gray-500">{opportunity.timeframe}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No market analysis available</p>
                  <Button onClick={handleAnalyzeMarket} disabled={analyzing}>
                    {analyzing ? 'Analyzing...' : 'Generate Analysis'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.slice(0, 9).map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                    <Badge variant="outline">{insight.type}</Badge>
                  </div>
                  <CardDescription className="text-xs">{insight.market}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={getConfidenceColor(insight.confidence)}>
                        Confidence: {(insight.confidence * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-500">
                        {new Date(insight.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="pt-2">
                      <h5 className="font-medium text-xs mb-1">Recommendations:</h5>
                      <ul className="text-xs space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {insights.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No AI insights available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Training Job</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`}></div>
                  </div>
                  <CardDescription className="text-xs">Model: {job.modelId}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant="secondary">{job.status}</Badge>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress:</span>
                        <span>{job.progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Started: {new Date(job.startTime).toLocaleString()}</div>
                      <div>Est. completion: {new Date(job.estimatedCompletion).toLocaleString()}</div>
                    </div>
                    <div className="text-xs">
                      <div>Dataset: {job.dataset}</div>
                      <div>Epochs: {job.parameters.epochs}</div>
                      <div>Batch size: {job.parameters.batchSize}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {trainingJobs.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No training jobs available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}