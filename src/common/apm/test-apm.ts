// APM 테스트 스크립트
import { APMService } from './services/apm.service';

// APM 서비스 인스턴스 생성
const apmService = new APMService();

// 테스트 데이터 추가
console.log('APM 테스트 시작...');

// 성능 메트릭 추가
apmService.recordPerformance({
  operation: 'GET /api/test',
  duration: 150,
  startTime: new Date(),
  success: true,
  metadata: {
    method: 'GET',
    path: '/api/test',
    statusCode: 200,
  },
});

// 에러 메트릭 추가
apmService.recordError({
  error: 'Test error for APM',
  stack: 'Error: Test error\n    at testFunction()',
  timestamp: new Date(),
  operation: 'POST /api/test',
  metadata: {
    method: 'POST',
    path: '/api/test',
  },
});

// 데이터베이스 메트릭 추가
apmService.recordDatabaseQuery({
  query: 'SELECT * FROM test_table',
  duration: 250,
  timestamp: new Date(),
  success: true,
  table: 'test_table',
});

// 커스텀 메트릭 추가
apmService.recordMetric('test.metric', 100, {
  category: 'test',
  type: 'counter',
});

// 통계 조회
const stats = apmService.getStats();
console.log('APM 통계:', JSON.stringify(stats, null, 2));

// 성능 메트릭 조회
const performanceMetrics = apmService.getPerformanceMetrics(5);
console.log('성능 메트릭:', JSON.stringify(performanceMetrics, null, 2));

// 에러 메트릭 조회
const errorMetrics = apmService.getErrorMetrics(5);
console.log('에러 메트릭:', JSON.stringify(errorMetrics, null, 2));

console.log('APM 테스트 완료!');
