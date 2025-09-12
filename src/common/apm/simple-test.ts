// 간단한 APM 테스트
import { APMService } from './services/apm.service';

const apm = new APMService();

console.log('=== APM 테스트 시작 ===');

// 1. 성능 메트릭 추가
apm.recordPerformance({
  operation: 'GET /api/estimate-management',
  duration: 200,
  startTime: new Date(Date.now() - 200),
  success: true,
  metadata: { method: 'GET', path: '/api/estimate-management' }
});

// 2. 에러 메트릭 추가
apm.recordError({
  error: 'Validation failed',
  timestamp: new Date(),
  operation: 'POST /api/estimate-management',
  metadata: { method: 'POST', path: '/api/estimate-management' }
});

// 3. 데이터베이스 메트릭 추가
apm.recordDatabaseQuery({
  query: 'SELECT * FROM estimate_management',
  duration: 150,
  timestamp: new Date(),
  success: true,
  table: 'estimate_management'
});

// 4. 통계 조회
const stats = apm.getStats();
console.log('📊 APM 통계:');
console.log(JSON.stringify(stats, null, 2));

// 5. 성능 메트릭 조회
const performance = apm.getPerformanceMetrics(3);
console.log('\n⚡ 성능 메트릭:');
console.log(JSON.stringify(performance, null, 2));

// 6. 에러 메트릭 조회
const errors = apm.getErrorMetrics(3);
console.log('\n❌ 에러 메트릭:');
console.log(JSON.stringify(errors, null, 2));

// 7. 느린 쿼리 조회
const slowQueries = apm.getSlowQueries(100);
console.log('\n🐌 느린 쿼리:');
console.log(JSON.stringify(slowQueries, null, 2));

console.log('\n=== APM 테스트 완료 ===');
