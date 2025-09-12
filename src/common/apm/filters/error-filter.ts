import { ErrorMetric } from '../interfaces/apm.interface';

/**
 * 개발 환경에서 불필요한 에러를 필터링하는 클래스
 */
export class ErrorFilter {
  private static readonly IGNORED_ERRORS = [
    // 자주 발생하는 개발 중 에러들 (무시)
    'Validation failed',
    // 'Unauthorized',  // 401 에러는 기록하도록 주석 처리
    // 'Forbidden',     // 403 에러는 기록하도록 주석 처리
    'Not Found',
    'Bad Request',
    '창고 정보를 찾을 수 없습니다',
    '견적 정보를 찾을 수 없습니다',
    '고객 정보를 찾을 수 없습니다',
  ];

  private static readonly IGNORED_PATHS = [
    // 자주 호출되는 경로들 (무시)
    '/',
    '/api/health',
    '/api/favicon.ico',
    '/api/robots.txt',
    '/api/apm/dashboard',  // APM 대시보드 자체 요청
    '/api/apm/stats',      // APM 통계 요청
    '/api/apm/performance', // APM 성능 요청
    '/api/apm/errors',     // APM 에러 요청
    '/api/apm/slow-queries', // APM 느린 쿼리 요청
    '/api/apm/clear',      // APM 초기화 요청
  ];

  /**
   * 에러를 기록할지 결정
   */
  static shouldRecordError(error: ErrorMetric): boolean {
    // 무시할 에러 메시지 확인
    if (this.IGNORED_ERRORS.some(ignored => 
      error.error.includes(ignored)
    )) {
      return false;
    }

    // 무시할 경로 확인
    if (error.operation && this.IGNORED_PATHS.some(ignored => 
      error.operation!.includes(ignored)
    )) {
      return false;
    }

    // 404 에러는 특정 경로만 무시 (개발 중에는 너무 많음)
    if (error.metadata?.statusCode === 404) {
      // API 경로가 아닌 경우만 무시 (정적 파일 등)
      if (!error.operation?.startsWith('/api/')) {
        return false;
      }
    }

    return true;
  }

  /**
   * 에러를 중요도별로 분류
   */
  static getErrorSeverity(error: ErrorMetric): 'low' | 'medium' | 'high' | 'critical' {
    // Critical: 서버 에러
    if (error.metadata?.statusCode >= 500) {
      return 'critical';
    }

    // High: 인증/권한 에러
    if (error.metadata?.statusCode === 401 || error.metadata?.statusCode === 403) {
      return 'high';
    }

    // Medium: 비즈니스 로직 에러
    if (error.metadata?.statusCode === 400) {
      return 'medium';
    }

    // Low: 기타 에러
    return 'low';
  }

  /**
   * 에러를 그룹화 (같은 에러는 하나로 합침)
   */
  static groupError(error: ErrorMetric): string {
    // 에러 메시지의 첫 번째 줄만 사용 (스택 트레이스 제외)
    const firstLine = error.error.split('\n')[0];
    
    // 경로 정보 제거 (동적 ID 등)
    const cleanPath = error.operation?.replace(/\/\d+/g, '/:id') || 'unknown';
    
    return `${cleanPath}: ${firstLine}`;
  }
}
