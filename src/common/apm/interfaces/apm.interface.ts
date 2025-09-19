export interface MetricData {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ErrorMetric {
  error: string;
  stack?: string;
  timestamp: Date;
  operation?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface DatabaseMetric {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  table?: string;
}

export interface APMStats {
  totalRequests: number;
  successRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  slowestOperation: string;
  errorRate: number;
  lastUpdated: Date;
}

export interface APMConfig {
  enabled: boolean;
  slowQueryThreshold: number; // ms
  slowOperationThreshold: number; // ms
  maxMetricsHistory: number;
  enableDatabaseMonitoring: boolean;
  enableErrorTracking: boolean;
}
