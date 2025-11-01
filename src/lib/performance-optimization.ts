export interface PerformanceMetrics {
  timestamp: string;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  errorRate: number;
  throughput: number;
}

export interface OptimizationResult {
  type: 'memory' | 'cpu' | 'network' | 'database' | 'cache';
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  implemented: boolean;
  improvement: number;
}

export interface SystemHealth {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  components: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    api: 'healthy' | 'degraded' | 'unhealthy';
    ai: 'healthy' | 'degraded' | 'unhealthy';
    cache: 'healthy' | 'degraded' | 'unhealthy';
    network: 'healthy' | 'degraded' | 'unhealthy';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

export interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  timestamp: string;
  details?: string;
  error?: string;
}

export interface LoadTestResult {
  scenario: string;
  concurrentUsers: number;
  duration: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  throughput: number;
  timestamp: string;
}

export class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private optimizations: OptimizationResult[] = [];
  private testResults: TestResult[] = [];
  private loadTestResults: LoadTestResult[] = [];
  private thresholds = {
    responseTime: 1000, // ms
    memoryUsage: 80, // %
    cpuUsage: 70, // %
    errorRate: 0.01, // 1%
    throughput: 1000 // requests/sec
  };

  constructor() {
    this.initializeMetrics();
    this.initializeOptimizations();
    this.runPeriodicChecks();
  }

  private initializeMetrics() {
    // Initialize with some baseline metrics
    this.metrics = Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      responseTime: 200 + Math.random() * 300,
      memoryUsage: 45 + Math.random() * 20,
      cpuUsage: 30 + Math.random() * 25,
      activeConnections: 50 + Math.random() * 100,
      errorRate: Math.random() * 0.005,
      throughput: 800 + Math.random() * 400
    }));
  }

  private initializeOptimizations() {
    this.optimizations = [
      {
        type: 'memory',
        issue: 'High memory usage in market data processing',
        severity: 'medium',
        recommendation: 'Implement memory pooling and object reuse',
        implemented: true,
        improvement: 25
      },
      {
        type: 'cpu',
        issue: 'CPU spikes during correlation calculations',
        severity: 'high',
        recommendation: 'Optimize correlation algorithms with memoization',
        implemented: true,
        improvement: 40
      },
      {
        type: 'network',
        issue: 'Excessive API calls for market data',
        severity: 'medium',
        recommendation: 'Implement data caching and batch requests',
        implemented: true,
        improvement: 60
      },
      {
        type: 'database',
        issue: 'Slow query performance on large datasets',
        severity: 'high',
        recommendation: 'Add database indexes and optimize queries',
        implemented: false,
        improvement: 0
      },
      {
        type: 'cache',
        issue: 'Low cache hit ratio for frequently accessed data',
        severity: 'medium',
        recommendation: 'Implement multi-level caching strategy',
        implemented: true,
        improvement: 35
      }
    ];
  }

  private runPeriodicChecks() {
    // Run performance checks every 5 minutes
    setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
    }, 5 * 60 * 1000);

    // Run comprehensive tests every hour
    setInterval(() => {
      this.runPerformanceTests();
    }, 60 * 60 * 1000);
  }

  private collectMetrics() {
    const newMetric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      responseTime: 150 + Math.random() * 250,
      memoryUsage: 40 + Math.random() * 25,
      cpuUsage: 25 + Math.random() * 30,
      activeConnections: 40 + Math.random() * 120,
      errorRate: Math.random() * 0.008,
      throughput: 750 + Math.random() * 500
    };

    this.metrics.push(newMetric);

    // Keep only last 24 hours of metrics
    if (this.metrics.length > 288) { // 24 hours * 12 metrics per hour
      this.metrics = this.metrics.slice(-288);
    }
  }

  private analyzePerformance() {
    const latestMetrics = this.metrics.slice(-12); // Last hour
    const avgResponseTime = latestMetrics.reduce((sum, m) => sum + m.responseTime, 0) / latestMetrics.length;
    const avgMemoryUsage = latestMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / latestMetrics.length;
    const avgCpuUsage = latestMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / latestMetrics.length;
    const avgErrorRate = latestMetrics.reduce((sum, m) => sum + m.errorRate, 0) / latestMetrics.length;
    const avgThroughput = latestMetrics.reduce((sum, m) => sum + m.throughput, 0) / latestMetrics.length;

    // Check for performance issues
    if (avgResponseTime > this.thresholds.responseTime) {
      this.addOptimization({
        type: 'network',
        issue: 'High response time detected',
        severity: 'high',
        recommendation: 'Implement response time optimization and load balancing',
        implemented: false,
        improvement: 0
      });
    }

    if (avgMemoryUsage > this.thresholds.memoryUsage) {
      this.addOptimization({
        type: 'memory',
        issue: 'High memory usage detected',
        severity: 'high',
        recommendation: 'Implement memory optimization and garbage collection tuning',
        implemented: false,
        improvement: 0
      });
    }

    if (avgCpuUsage > this.thresholds.cpuUsage) {
      this.addOptimization({
        type: 'cpu',
        issue: 'High CPU usage detected',
        severity: 'high',
        recommendation: 'Implement CPU optimization and consider horizontal scaling',
        implemented: false,
        improvement: 0
      });
    }

    if (avgErrorRate > this.thresholds.errorRate) {
      this.addOptimization({
        type: 'network',
        issue: 'High error rate detected',
        severity: 'critical',
        recommendation: 'Implement error handling and circuit breakers',
        implemented: false,
        improvement: 0
      });
    }

    if (avgThroughput < this.thresholds.throughput) {
      this.addOptimization({
        type: 'network',
        issue: 'Low throughput detected',
        severity: 'medium',
        recommendation: 'Implement throughput optimization and connection pooling',
        implemented: false,
        improvement: 0
      });
    }
  }

  private addOptimization(optimization: OptimizationResult) {
    // Check if similar optimization already exists
    const exists = this.optimizations.some(opt => 
      opt.type === optimization.type && opt.issue === optimization.issue
    );

    if (!exists) {
      this.optimizations.push(optimization);
    }
  }

  public getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  public getOptimizations(): OptimizationResult[] {
    return this.optimizations;
  }

  public getSystemHealth(): SystemHealth {
    const latestMetrics = this.metrics.slice(-6); // Last 30 minutes
    const avgResponseTime = latestMetrics.reduce((sum, m) => sum + m.responseTime, 0) / latestMetrics.length;
    const avgMemoryUsage = latestMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / latestMetrics.length;
    const avgCpuUsage = latestMetrics.reduce((sum, m) => sum + m.cpuUsage, 0) / latestMetrics.length;
    const avgErrorRate = latestMetrics.reduce((sum, m) => sum + m.errorRate, 0) / latestMetrics.length;
    const avgThroughput = latestMetrics.reduce((sum, m) => sum + m.throughput, 0) / latestMetrics.length;

    // Calculate overall health score
    let healthScore = 100;
    healthScore -= Math.max(0, (avgResponseTime - this.thresholds.responseTime) / this.thresholds.responseTime * 20);
    healthScore -= Math.max(0, (avgMemoryUsage - this.thresholds.memoryUsage) / this.thresholds.memoryUsage * 20);
    healthScore -= Math.max(0, (avgCpuUsage - this.thresholds.cpuUsage) / this.thresholds.cpuUsage * 20);
    healthScore -= Math.max(0, (avgErrorRate - this.thresholds.errorRate) / this.thresholds.errorRate * 20);
    healthScore -= Math.max(0, (this.thresholds.throughput - avgThroughput) / this.thresholds.throughput * 20);

    let overall: SystemHealth['overall'] = 'excellent';
    if (healthScore < 40) overall = 'critical';
    else if (healthScore < 60) overall = 'poor';
    else if (healthScore < 80) overall = 'fair';
    else if (healthScore < 90) overall = 'good';

    return {
      overall,
      components: {
        database: avgMemoryUsage > 80 ? 'unhealthy' : avgMemoryUsage > 60 ? 'degraded' : 'healthy',
        api: avgResponseTime > 1000 ? 'unhealthy' : avgResponseTime > 500 ? 'degraded' : 'healthy',
        ai: avgCpuUsage > 80 ? 'unhealthy' : avgCpuUsage > 60 ? 'degraded' : 'healthy',
        cache: avgThroughput < 500 ? 'unhealthy' : avgThroughput < 800 ? 'degraded' : 'healthy',
        network: avgErrorRate > 0.02 ? 'unhealthy' : avgErrorRate > 0.01 ? 'degraded' : 'healthy'
      },
      metrics: {
        uptime: 99.9, // Mock uptime
        responseTime: avgResponseTime,
        errorRate: avgErrorRate,
        throughput: avgThroughput
      }
    };
  }

  public async runPerformanceTests() {
    const testTypes = ['unit', 'integration', 'e2e', 'performance', 'security'];
    
    for (const type of testTypes) {
      const test: TestResult = {
        id: `test-${type}-${Date.now()}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Test Suite`,
        type: type as TestResult['type'],
        status: 'running',
        duration: 0,
        timestamp: new Date().toISOString()
      };

      this.testResults.push(test);

      // Simulate test execution
      setTimeout(() => {
        const duration = 1000 + Math.random() * 4000;
        const passed = Math.random() > 0.1; // 90% pass rate

        test.status = passed ? 'passed' : 'failed';
        test.duration = duration;
        if (!passed) {
          test.error = 'Test failed due to performance degradation';
        }
      }, duration);
    }
  }

  public async runLoadTest(scenario: string, concurrentUsers: number, duration: number): Promise<LoadTestResult> {
    const result: LoadTestResult = {
      scenario,
      concurrentUsers,
      duration,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      maxResponseTime: 0,
      errorRate: 0,
      throughput: 0,
      timestamp: new Date().toISOString()
    };

    // Simulate load test execution
    setTimeout(() => {
      result.requestsPerSecond = concurrentUsers * (10 + Math.random() * 20);
      result.averageResponseTime = 100 + Math.random() * 400;
      result.maxResponseTime = result.averageResponseTime * (2 + Math.random());
      result.errorRate = Math.random() * 0.05;
      result.throughput = result.requestsPerSecond * (1 - result.errorRate);

      this.loadTestResults.push(result);
    }, duration * 1000);

    return result;
  }

  public getTestResults(): TestResult[] {
    return this.testResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getLoadTestResults(): LoadTestResult[] {
    return this.loadTestResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getPerformanceReport() {
    const health = this.getSystemHealth();
    const recentMetrics = this.metrics.slice(-24); // Last 2 hours
    const recentOptimizations = this.optimizations.filter(opt => !opt.implemented);
    const recentTests = this.testResults.slice(-10);

    return {
      health,
      metrics: recentMetrics,
      optimizations: recentOptimizations,
      tests: recentTests,
      summary: {
        totalTests: recentTests.length,
        passedTests: recentTests.filter(t => t.status === 'passed').length,
        failedTests: recentTests.filter(t => t.status === 'failed').length,
        criticalIssues: recentOptimizations.filter(o => o.severity === 'critical').length,
        recommendations: recentOptimizations.length
      }
    };
  }

  public optimizeSystem() {
    const optimizations = this.optimizations.filter(opt => !opt.implemented);
    
    optimizations.forEach(opt => {
      // Simulate optimization implementation
      setTimeout(() => {
        opt.implemented = true;
        opt.improvement = 20 + Math.random() * 30;
      }, 1000);
    });

    return optimizations.length;
  }
}

// Singleton instance
export const performanceOptimizer = new PerformanceOptimizer();