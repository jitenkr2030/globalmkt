'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  PerformanceMetrics, 
  OptimizationResult, 
  SystemHealth, 
  TestResult,
  LoadTestResult,
  performanceOptimizer 
} from '@/lib/performance-optimization';

export default function PerformanceOptimization() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loadTestResults, setLoadTestResults] = useState<LoadTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch metrics
        const metricsResponse = await fetch('/api/performance-optimization?action=metrics');
        const metricsData = await metricsResponse.json();
        
        if (metricsData.success) {
          setMetrics(metricsData.data);
        }
        
        // Fetch optimizations
        const optimizationsResponse = await fetch('/api/performance-optimization?action=optimizations');
        const optimizationsData = await optimizationsResponse.json();
        
        if (optimizationsData.success) {
          setOptimizations(optimizationsData.data);
        }
        
        // Fetch health
        const healthResponse = await fetch('/api/performance-optimization?action=health');
        const healthData = await healthResponse.json();
        
        if (healthData.success) {
          setHealth(healthData.data);
        }
        
        // Fetch test results
        const testsResponse = await fetch('/api/performance-optimization?action=tests');
        const testsData = await testsResponse.json();
        
        if (testsData.success) {
          setTestResults(testsData.data);
        }
        
        // Fetch load test results
        const loadTestsResponse = await fetch('/api/performance-optimization?action=load-tests');
        const loadTestsData = await loadTestsResponse.json();
        
        if (loadTestsData.success) {
          setLoadTestResults(loadTestsData.data);
        }
        
        setLastUpdate(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching performance optimization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRunTests = async () => {
    try {
      setTesting(true);
      
      const response = await fetch('/api/performance-optimization?action=run-tests', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh test results after a delay
        setTimeout(async () => {
          const testsResponse = await fetch('/api/performance-optimization?action=tests');
          const testsData = await testsResponse.json();
          if (testsData.success) {
            setTestResults(testsData.data);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleRunLoadTest = async () => {
    try {
      const response = await fetch('/api/performance-optimization?action=run-load-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: 'Market Data Load Test',
          concurrentUsers: 100,
          duration: 30
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh load test results after a delay
        setTimeout(async () => {
          const loadTestsResponse = await fetch('/api/performance-optimization?action=load-tests');
          const loadTestsData = await loadTestsResponse.json();
          if (loadTestsData.success) {
            setLoadTestResults(loadTestsData.data);
          }
        }, 35000);
      }
    } catch (error) {
      console.error('Error running load test:', error);
    }
  };

  const handleOptimizeSystem = async () => {
    try {
      setOptimizing(true);
      
      const response = await fetch('/api/performance-optimization?action=optimize-system', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh optimizations after a delay
        setTimeout(async () => {
          const optimizationsResponse = await fetch('/api/performance-optimization?action=optimizations');
          const optimizationsData = await optimizationsResponse.json();
          if (optimizationsData.success) {
            setOptimizations(optimizationsData.data);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error optimizing system:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthBgColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'fair': return 'bg-yellow-100';
      case 'poor': return 'bg-orange-100';
      case 'critical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      case 'skipped': return 'bg-gray-500';
      default: return 'bg-gray-500';
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
        <h2 className="text-2xl font-bold">Performance Optimization & Testing</h2>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleRunTests} 
            disabled={testing}
            variant="outline"
          >
            {testing ? 'Running Tests...' : 'Run Tests'}
          </Button>
          <Button 
            onClick={handleRunLoadTest}
            variant="outline"
          >
            Run Load Test
          </Button>
          <Button 
            onClick={handleOptimizeSystem} 
            disabled={optimizing}
            className="bg-green-600 hover:bg-green-700"
          >
            {optimizing ? 'Optimizing...' : 'Optimize System'}
          </Button>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {health && (
        <Card>
          <CardHeader>
            <CardTitle>System Health Overview</CardTitle>
            <CardDescription>Overall system health status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${getHealthBgColor(health.overall)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Overall Health</span>
                  <Badge variant="outline" className={getHealthColor(health.overall)}>
                    {health.overall.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Uptime: {health.metrics.uptime.toFixed(1)}%
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Response Time</span>
                  <span className="text-sm font-medium">{health.metrics.responseTime.toFixed(0)}ms</span>
                </div>
                <Progress value={Math.min(100, (health.metrics.responseTime / 1000) * 100)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">Target: &lt;1000ms</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Error Rate</span>
                  <span className="text-sm font-medium">{(health.metrics.errorRate * 100).toFixed(2)}%</span>
                </div>
                <Progress value={Math.min(100, health.metrics.errorRate * 10000)} className="h-2" />
                <div className="text-xs text-gray-500 mt-1">Target: &lt;1%</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Database</span>
                  <Badge variant="outline" className={getHealthColor(health.components.database)}>
                    {health.components.database}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">Storage & Query Performance</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">API</span>
                  <Badge variant="outline" className={getHealthColor(health.components.api)}>
                    {health.components.api}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">REST API & GraphQL</div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">AI Services</span>
                  <Badge variant="outline" className={getHealthColor(health.components.ai)}>
                    {health.components.ai}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">ML Models & Inference</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="tests">Test Results</TabsTrigger>
          <TabsTrigger value="load-tests">Load Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0 ? metrics[metrics.length - 1].responseTime.toFixed(0) : 0}ms
                </div>
                <div className="text-xs text-gray-500">
                  Average: {metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length).toFixed(0) : 0}ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0 ? metrics[metrics.length - 1].memoryUsage.toFixed(1) : 0}%
                </div>
                <Progress value={metrics.length > 0 ? metrics[metrics.length - 1].memoryUsage : 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0 ? metrics[metrics.length - 1].cpuUsage.toFixed(1) : 0}%
                </div>
                <Progress value={metrics.length > 0 ? metrics[metrics.length - 1].cpuUsage : 0} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0 ? metrics[metrics.length - 1].activeConnections.toFixed(0) : 0}
                </div>
                <div className="text-xs text-gray-500">
                  Peak: {metrics.length > 0 ? Math.max(...metrics.map(m => m.activeConnections)).toFixed(0) : 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0 ? (metrics[metrics.length - 1].errorRate * 100).toFixed(3) : 0}%
                </div>
                <div className="text-xs text-gray-500">
                  Target: &lt;0.01%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0 ? metrics[metrics.length - 1].throughput.toFixed(0) : 0}
                </div>
                <div className="text-xs text-gray-500">
                  requests/sec
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizations.map((opt, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium capitalize">{opt.type} Optimization</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getSeverityColor(opt.severity)}>
                        {opt.severity}
                      </Badge>
                      <Badge variant={opt.implemented ? "default" : "secondary"}>
                        {opt.implemented ? "Implemented" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Issue:</h5>
                      <p className="text-sm text-gray-600">{opt.issue}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-1">Recommendation:</h5>
                      <p className="text-sm text-gray-600">{opt.recommendation}</p>
                    </div>
                    {opt.implemented && opt.improvement > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Improvement:</span>
                        <span className="font-semibold text-green-600">+{opt.improvement.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {optimizations.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No optimizations available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testResults.slice(0, 9).map((test) => (
              <Card key={test.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{test.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(test.status)}`}></div>
                  </div>
                  <CardDescription className="text-xs capitalize">{test.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant="outline">{test.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Duration:</span>
                      <span>{test.duration.toFixed(0)}ms</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(test.timestamp).toLocaleString()}
                    </div>
                    {test.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {test.error}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {testResults.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No test results available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="load-tests" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadTestResults.map((test, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{test.scenario}</CardTitle>
                  <CardDescription className="text-xs">
                    {test.concurrentUsers} concurrent users for {test.duration}s
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Requests/sec:</span>
                        <div className="font-semibold">{test.requestsPerSecond.toFixed(0)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Response:</span>
                        <div className="font-semibold">{test.averageResponseTime.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Response:</span>
                        <div className="font-semibold">{test.maxResponseTime.toFixed(0)}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Error Rate:</span>
                        <div className="font-semibold">{(test.errorRate * 100).toFixed(2)}%</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Throughput:</span>
                        <span className="font-semibold">{test.throughput.toFixed(0)} req/s</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(test.timestamp).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {loadTestResults.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <p className="text-gray-500">No load test results available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}