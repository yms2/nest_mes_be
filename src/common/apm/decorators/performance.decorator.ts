import { APMService } from '../services/apm.service';

/**
 * 메서드 실행 시간을 측정하는 데코레이터
 */
export function MeasurePerformance(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operation = operationName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = new Date();
      let success = true;
      let error: string | undefined;

      try {
        const result = await method.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        // APM 서비스에 성능 메트릭 기록
        if (this.apmService && this.apmService instanceof APMService) {
          this.apmService.recordPerformance({
            operation,
            duration: 0, // APMService에서 계산됨
            startTime,
            success,
            error,
            metadata: {
              className: target.constructor.name,
              methodName: propertyName,
              argsCount: args.length,
            },
          });
        }
      }
    };

    return descriptor;
  };
}

/**
 * 데이터베이스 쿼리 성능을 측정하는 데코레이터
 */
export function MeasureDatabaseQuery(queryName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operation = queryName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = new Date();
      let success = true;
      let error: string | undefined;
      let query: string | undefined;

      try {
        const result = await method.apply(this, args);
        
        // TypeORM 쿼리 빌더인 경우 쿼리 문자열 추출 시도
        if (result && typeof result.getQuery === 'function') {
          query = result.getQuery();
        } else if (args[0] && typeof args[0] === 'string') {
          query = args[0];
        }

        return result;
      } catch (err) {
        success = false;
        error = err instanceof Error ? err.message : String(err);
        throw err;
      } finally {
        const duration = Date.now() - startTime.getTime();
        
        // APM 서비스에 데이터베이스 메트릭 기록
        if (this.apmService && this.apmService instanceof APMService) {
          this.apmService.recordDatabaseQuery({
            query: query || operation,
            duration,
            timestamp: new Date(),
            success,
            error,
            table: this.extractTableName(query),
          });
        }
      }
    };

    return descriptor;
  };
}

/**
 * 에러를 자동으로 추적하는 데코레이터
 */
export function TrackErrors() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operation = `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (err) {
        // APM 서비스에 에러 메트릭 기록
        if (this.apmService && this.apmService instanceof APMService) {
          this.apmService.recordError({
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            timestamp: new Date(),
            operation,
            metadata: {
              className: target.constructor.name,
              methodName: propertyName,
              args: args.map(arg => typeof arg === 'object' ? '[Object]' : String(arg)),
            },
          });
        }
        throw err;
      }
    };

    return descriptor;
  };
}

/**
 * 커스텀 메트릭을 기록하는 데코레이터
 */
export function RecordMetric(metricName: string, value?: number | (() => number)) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      // APM 서비스에 커스텀 메트릭 기록
      if (this.apmService && this.apmService instanceof APMService) {
        const metricValue = typeof value === 'function' ? value() : (value || 1);
        this.apmService.recordMetric(metricName, metricValue, {
          className: target.constructor.name,
          methodName: propertyName,
        });
      }
      
      return result;
    };

    return descriptor;
  };
}

/**
 * 테이블명 추출 헬퍼 함수
 */
function extractTableName(query: string | undefined): string | undefined {
  if (!query) return undefined;
  
  // 간단한 정규식으로 테이블명 추출
  const fromMatch = query.match(/FROM\s+`?(\w+)`?/i);
  if (fromMatch) return fromMatch[1];
  
  const insertMatch = query.match(/INSERT\s+INTO\s+`?(\w+)`?/i);
  if (insertMatch) return insertMatch[1];
  
  const updateMatch = query.match(/UPDATE\s+`?(\w+)`?/i);
  if (updateMatch) return updateMatch[1];
  
  const deleteMatch = query.match(/DELETE\s+FROM\s+`?(\w+)`?/i);
  if (deleteMatch) return deleteMatch[1];
  
  return undefined;
}
