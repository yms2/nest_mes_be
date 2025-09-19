import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { tap, catchError } from 'rxjs/operators';
import { APMService } from '../services/apm.service';

@Injectable()
export class APMMiddleware implements NestMiddleware {
  private readonly logger = new Logger(APMMiddleware.name);

  constructor(private readonly apmService: APMService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = new Date();
    
    // 더 명확한 경로 표시
    const fullPath = req.originalUrl || req.path;
    const operation = `${req.method} ${fullPath}`;
    
    // APM 대시보드 자체 요청은 필터링 (무한 루프 방지)
    if (req.path === '/api/apm/dashboard' || req.path === '/api/apm/stats') {
      return next();
    }
    
    // 요청 정보 추출
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const userId = (req as any).user?.id || 'Anonymous';

    // 응답 완료 시 성능 메트릭 기록
    res.on('finish', () => {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      const success = res.statusCode < 400;

      this.apmService.recordPerformance({
        operation,
        duration,
        startTime,
        success,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          userAgent,
          ip,
          userId,
          queryParams: req.query,
          bodySize: req.get('Content-Length') ? parseInt(req.get('Content-Length')!) : 0,
        },
      });

      // 느린 요청 경고
      if (duration > 5000) { // 5초 이상
        this.logger.warn(`Slow request detected: ${operation} took ${duration}ms`);
      }

      // 에러 요청 로깅 및 에러 메트릭 기록
      if (res.statusCode >= 400) {
        this.logger.error(`Error request: ${operation} returned ${res.statusCode}`);
        
        // 에러 메트릭 기록
        this.apmService.recordError({
          error: `HTTP ${res.statusCode} Error`,
          stack: `Status: ${res.statusCode}, Path: ${req.path}`,
          timestamp: new Date(),
          operation,
          userId,
          metadata: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            userAgent,
            ip,
            queryParams: req.query,
          },
        });
      }
    });

    // 에러 발생 시 에러 메트릭 기록
    res.on('error', (error: Error) => {
      this.apmService.recordError({
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
        operation,
        userId,
        metadata: {
          method: req.method,
          path: req.path,
          userAgent,
          ip,
        },
      });
    });

    next();
  }
}

/**
 * HTTP 요청 성능을 측정하는 인터셉터
 */
@Injectable()
export class APMInterceptor {
  constructor(private readonly apmService: APMService) {}

  intercept(context: any, next: any) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const startTime = new Date();
    const operation = `${request.method} ${request.path}`;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime.getTime();
        const success = response.statusCode < 400;

        this.apmService.recordPerformance({
          operation,
          duration,
          startTime,
          success,
          metadata: {
            method: request.method,
            path: request.path,
            statusCode: response.statusCode,
          },
        });
      }),
      catchError((error) => {
        this.apmService.recordError({
          error: error.message,
          stack: error.stack,
          timestamp: new Date(),
          operation,
          metadata: {
            method: request.method,
            path: request.path,
          },
        });
        throw error;
      })
    );
  }
}

/**
 * 데이터베이스 쿼리 성능을 측정하는 인터셉터
 */
@Injectable()
export class DatabaseAPMInterceptor {
  constructor(private readonly apmService: APMService) {}

  intercept(context: any, next: any) {
    const startTime = new Date();
    const operation = 'Database Query';

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime.getTime();
        
        this.apmService.recordDatabaseQuery({
          query: this.extractQuery(result),
          duration,
          timestamp: new Date(),
          success: true,
          table: this.extractTableName(result),
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime.getTime();
        
        this.apmService.recordDatabaseQuery({
          query: 'Unknown Query',
          duration,
          timestamp: new Date(),
          success: false,
          error: error.message,
        });
        
        throw error;
      })
    );
  }

  private extractQuery(result: any): string {
    if (result && typeof result.getQuery === 'function') {
      return result.getQuery();
    }
    return 'Unknown Query';
  }

  private extractTableName(result: any): string | undefined {
    if (result && result.metadata && result.metadata.tableName) {
      return result.metadata.tableName;
    }
    return undefined;
  }
}
