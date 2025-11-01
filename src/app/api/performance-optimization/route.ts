import { NextRequest, NextResponse } from 'next/server';
import { performanceOptimizer, PerformanceMetrics, OptimizationResult, SystemHealth, TestResult, LoadTestResult } from '@/lib/performance-optimization';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'metrics';

    switch (action) {
      case 'metrics':
        const metrics = performanceOptimizer.getMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString()
        });

      case 'optimizations':
        const optimizations = performanceOptimizer.getOptimizations();
        return NextResponse.json({
          success: true,
          data: optimizations,
          timestamp: new Date().toISOString()
        });

      case 'health':
        const health = performanceOptimizer.getSystemHealth();
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        });

      case 'tests':
        const tests = performanceOptimizer.getTestResults();
        return NextResponse.json({
          success: true,
          data: tests,
          timestamp: new Date().toISOString()
        });

      case 'load-tests':
        const loadTests = performanceOptimizer.getLoadTestResults();
        return NextResponse.json({
          success: true,
          data: loadTests,
          timestamp: new Date().toISOString()
        });

      case 'report':
        const report = performanceOptimizer.getPerformanceReport();
        return NextResponse.json({
          success: true,
          data: report,
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
    console.error('Performance optimization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get performance optimization data',
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
      case 'run-tests':
        await performanceOptimizer.runPerformanceTests();
        return NextResponse.json({
          success: true,
          message: 'Performance tests initiated',
          timestamp: new Date().toISOString()
        });

      case 'run-load-test':
        if (!body.scenario || !body.concurrentUsers || !body.duration) {
          return NextResponse.json({
            success: false,
            error: 'scenario, concurrentUsers, and duration are required',
            timestamp: new Date().toISOString()
          }, { status: 400 });
        }

        const loadTestResult = await performanceOptimizer.runLoadTest(
          body.scenario,
          body.concurrentUsers,
          body.duration
        );
        return NextResponse.json({
          success: true,
          data: loadTestResult,
          timestamp: new Date().toISOString()
        });

      case 'optimize-system':
        const optimizationsCount = performanceOptimizer.optimizeSystem();
        return NextResponse.json({
          success: true,
          message: `System optimization initiated for ${optimizationsCount} issues`,
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
    console.error('Performance optimization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process performance optimization request',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}