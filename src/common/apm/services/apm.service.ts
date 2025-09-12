import { Injectable, Logger } from '@nestjs/common';
import { 
  MetricData, 
  PerformanceMetric, 
  ErrorMetric, 
  DatabaseMetric, 
  APMStats, 
  APMConfig 
} from '../interfaces/apm.interface';
import { ErrorFilter } from '../filters/error-filter';
import { getAPMConfig } from '../config/apm.config';

@Injectable()
export class APMService {
  private readonly logger = new Logger(APMService.name);
  
  private metrics: MetricData[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private errorMetrics: ErrorMetric[] = [];
  private databaseMetrics: DatabaseMetric[] = [];
  
  private config: APMConfig = getAPMConfig(); // 환경별 설정 사용

  constructor() {
    // 메트릭 정리 작업 (메모리 절약)
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60000); // 1분마다 실행
  }

  /**
   * 성능 메트릭 기록
   */
  recordPerformance(metric: Omit<PerformanceMetric, 'endTime'>): void {
    if (!this.config.enabled) return;

    const endTime = new Date();
    const duration = endTime.getTime() - metric.startTime.getTime();
    
    const performanceMetric: PerformanceMetric = {
      ...metric,
      endTime,
      duration,
    };

    this.performanceMetrics.push(performanceMetric);

    // 느린 작업 경고
    if (duration > this.config.slowOperationThreshold) {
      this.logger.warn(`Slow operation detected: ${metric.operation} took ${duration}ms`);
    }

    // 메트릭 히스토리 제한
    if (this.performanceMetrics.length > this.config.maxMetricsHistory) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.config.maxMetricsHistory);
    }
  }

  /**
   * 에러 메트릭 기록 (스마트 필터링 적용)
   */
  recordError(error: ErrorMetric): void {
    if (!this.config.enabled || !this.config.enableErrorTracking) return;

    // 에러 필터링 적용
    if (!ErrorFilter.shouldRecordError(error)) {
      return; // 무시할 에러는 기록하지 않음
    }

    // 에러 그룹화 (같은 에러는 하나로 합침)
    const groupedError = ErrorFilter.groupError(error);
    const existingError = this.errorMetrics.find(e => 
      ErrorFilter.groupError(e) === groupedError
    );

    if (existingError) {
      // 같은 에러가 이미 있으면 카운트만 증가
      existingError.metadata = {
        ...existingError.metadata,
        count: (existingError.metadata?.count || 1) + 1,
        lastOccurred: error.timestamp,
      };
    } else {
      // 새로운 에러는 추가
      this.errorMetrics.push({
        ...error,
        metadata: {
          ...error.metadata,
          count: 1,
          severity: ErrorFilter.getErrorSeverity(error),
        },
      });
    }

    // 중요한 에러만 로그 출력
    const severity = ErrorFilter.getErrorSeverity(error);
    if (severity === 'critical' || severity === 'high') {
      this.logger.error(`Error recorded: ${error.error}`, error.stack);
    }

    // 에러 히스토리 제한
    if (this.errorMetrics.length > this.config.maxMetricsHistory) {
      this.errorMetrics = this.errorMetrics.slice(-this.config.maxMetricsHistory);
    }
  }

  /**
   * 데이터베이스 메트릭 기록
   */
  recordDatabaseQuery(metric: DatabaseMetric): void {
    if (!this.config.enabled || !this.config.enableDatabaseMonitoring) return;

    this.databaseMetrics.push(metric);

    // 느린 쿼리 경고
    if (metric.duration > this.config.slowQueryThreshold) {
      this.logger.warn(`Slow query detected: ${metric.query} took ${metric.duration}ms`);
    }

    // DB 메트릭 히스토리 제한
    if (this.databaseMetrics.length > this.config.maxMetricsHistory) {
      this.databaseMetrics = this.databaseMetrics.slice(-this.config.maxMetricsHistory);
    }
  }

  /**
   * 커스텀 메트릭 기록
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.config.enabled) return;

    const metric: MetricData = {
      name,
      value,
      timestamp: new Date(),
      tags,
    };

    this.metrics.push(metric);

    // 메트릭 히스토리 제한
    if (this.metrics.length > this.config.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsHistory);
    }
  }

  /**
   * APM 통계 조회
   */
  getStats(): APMStats {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 최근 24시간 데이터 필터링
    const recentPerformanceMetrics = this.performanceMetrics.filter(
      m => m.startTime >= last24Hours
    );
    const recentErrorMetrics = this.errorMetrics.filter(
      m => m.timestamp >= last24Hours
    );

    const totalRequests = recentPerformanceMetrics.length;
    const successRequests = recentPerformanceMetrics.filter(m => m.success).length;
    const errorRequests = recentErrorMetrics.length;

    const averageResponseTime = totalRequests > 0 
      ? recentPerformanceMetrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests
      : 0;

    const slowestOperation = recentPerformanceMetrics.length > 0
      ? recentPerformanceMetrics.reduce((slowest, current) => 
          current.duration > slowest.duration ? current : slowest
        ).operation
      : 'N/A';

    const errorRate = totalRequests > 0 ? (errorRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      successRequests,
      errorRequests,
      averageResponseTime: Math.round(averageResponseTime),
      slowestOperation,
      errorRate: Math.round(errorRate * 100) / 100,
      lastUpdated: now,
    };
  }

  /**
   * 성능 메트릭 조회
   */
  getPerformanceMetrics(limit: number = 100): PerformanceMetric[] {
    return this.performanceMetrics
      .slice(-limit)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  /**
   * 에러 메트릭 조회
   */
  getErrorMetrics(limit: number = 100): ErrorMetric[] {
    return this.errorMetrics
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 데이터베이스 메트릭 조회
   */
  getDatabaseMetrics(limit: number = 100): DatabaseMetric[] {
    return this.databaseMetrics
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * 느린 쿼리 조회
   */
  getSlowQueries(threshold?: number): DatabaseMetric[] {
    const slowThreshold = threshold || this.config.slowQueryThreshold;
    return this.databaseMetrics
      .filter(m => m.duration > slowThreshold)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * 느린 작업 조회
   */
  getSlowOperations(threshold?: number): PerformanceMetric[] {
    const slowThreshold = threshold || this.config.slowOperationThreshold;
    return this.performanceMetrics
      .filter(m => m.duration > slowThreshold)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<APMConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.log('APM configuration updated');
  }

  /**
   * 메트릭 초기화
   */
  clearMetrics(): void {
    this.metrics = [];
    this.performanceMetrics = [];
    this.errorMetrics = [];
    this.databaseMetrics = [];
    this.logger.log('All metrics cleared');
  }

  /**
   * 오래된 메트릭 정리
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24시간 전

    this.performanceMetrics = this.performanceMetrics.filter(
      m => m.startTime >= cutoffTime
    );
    this.errorMetrics = this.errorMetrics.filter(
      m => m.timestamp >= cutoffTime
    );
    this.databaseMetrics = this.databaseMetrics.filter(
      m => m.timestamp >= cutoffTime
    );
    this.metrics = this.metrics.filter(
      m => m.timestamp >= cutoffTime
    );
  }
}
