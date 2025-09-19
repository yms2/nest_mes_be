import { APMConfig } from '../interfaces/apm.interface';

// 개발 환경용 APM 설정
export const developmentAPMConfig: APMConfig = {
  enabled: true,
  slowQueryThreshold: 500,        // 0.5초 (개발 중에는 더 민감하게)
  slowOperationThreshold: 1000,   // 1초 (개발 중에는 더 민감하게)
  maxMetricsHistory: 1000,        // 1,000개만 보관 (메모리 절약)
  enableDatabaseMonitoring: true,
  enableErrorTracking: true,
};

// 프로덕션 환경용 APM 설정
export const productionAPMConfig: APMConfig = {
  enabled: true,
  slowQueryThreshold: 2000,       // 2초 (프로덕션에서는 더 관대하게)
  slowOperationThreshold: 5000,   // 5초
  maxMetricsHistory: 10000,       // 10,000개 보관
  enableDatabaseMonitoring: true,
  enableErrorTracking: true,
};

// 테스트 환경용 APM 설정
export const testAPMConfig: APMConfig = {
  enabled: false,                  // 테스트 중에는 비활성화
  slowQueryThreshold: 1000,
  slowOperationThreshold: 2000,
  maxMetricsHistory: 100,
  enableDatabaseMonitoring: false,
  enableErrorTracking: false,
};

// 환경별 설정 가져오기
export function getAPMConfig(): APMConfig {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionAPMConfig;
    case 'test':
      return testAPMConfig;
    case 'development':
    default:
      return developmentAPMConfig;
  }
}
