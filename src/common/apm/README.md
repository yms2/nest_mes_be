# APM (Application Performance Monitoring) 시스템

## 📋 개요

애플리케이션의 성능을 실시간으로 모니터링하고 분석하는 시스템입니다. 
New Relic, DataDog 같은 상용 APM 도구의 기능을 간단하게 구현한 커스텀 APM입니다.

## 🚀 주요 기능

### 성능 모니터링
- ✅ **API 응답 시간** 측정
- ✅ **데이터베이스 쿼리** 성능 측정
- ✅ **느린 작업** 감지 및 경고
- ✅ **에러 추적** 및 로깅

### 메트릭 수집
- ✅ **성능 메트릭** 자동 수집
- ✅ **에러 메트릭** 자동 수집
- ✅ **데이터베이스 메트릭** 자동 수집
- ✅ **커스텀 메트릭** 수동 수집

### 대시보드
- ✅ **실시간 통계** 조회
- ✅ **성능 메트릭** 조회
- ✅ **에러 목록** 조회
- ✅ **느린 쿼리** 조회

## 📁 구조

```
src/common/apm/
├── interfaces/
│   └── apm.interface.ts          # APM 인터페이스 정의
├── services/
│   └── apm.service.ts            # APM 핵심 서비스
├── decorators/
│   └── performance.decorator.ts  # 성능 측정 데코레이터
├── middleware/
│   └── apm.middleware.ts         # APM 미들웨어
├── controllers/
│   └── apm.controller.ts         # APM 대시보드 컨트롤러
├── apm.module.ts                 # APM 모듈
└── README.md                     # 이 파일
```

## 🛠️ 사용 방법

### 1. APM 모듈 등록

```typescript
// app.module.ts
import { APMModule } from './common/apm/apm.module';

@Module({
  imports: [
    APMModule, // APM 모듈 추가
    // ... 다른 모듈들
  ],
})
export class AppModule {}
```

### 2. 미들웨어 적용

```typescript
// app.module.ts
import { APMMiddleware } from './common/apm/middleware/apm.middleware';

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(APMMiddleware)
      .forRoutes('*'); // 모든 라우트에 적용
  }
}
```

### 3. 데코레이터 사용

```typescript
import { MeasurePerformance, TrackErrors, RecordMetric } from '@/common/apm/decorators/performance.decorator';

@Injectable()
export class MyService {
  constructor(private apmService: APMService) {}

  // 성능 측정
  @MeasurePerformance('createUser')
  @TrackErrors()
  async createUser(userData: CreateUserDto) {
    // 비즈니스 로직
    return await this.userRepository.save(userData);
  }

  // 커스텀 메트릭
  @RecordMetric('user.created')
  async saveUser(user: User) {
    return await this.userRepository.save(user);
  }
}
```

### 4. 수동 메트릭 기록

```typescript
@Injectable()
export class MyService {
  constructor(private apmService: APMService) {}

  async processData() {
    const startTime = new Date();
    
    try {
      // 비즈니스 로직
      const result = await this.doWork();
      
      // 성공 메트릭 기록
      this.apmService.recordPerformance({
        operation: 'processData',
        duration: 0, // APMService에서 계산
        startTime,
        success: true,
      });
      
      return result;
    } catch (error) {
      // 에러 메트릭 기록
      this.apmService.recordError({
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
        operation: 'processData',
      });
      
      throw error;
    }
  }
}
```

## 📊 API 엔드포인트

### 통계 조회
```http
GET /api/apm/stats
Authorization: Bearer <token>
```

### 성능 메트릭 조회
```http
GET /api/apm/performance?limit=100
Authorization: Bearer <token>
```

### 에러 메트릭 조회
```http
GET /api/apm/errors?limit=100
Authorization: Bearer <token>
```

### 데이터베이스 메트릭 조회
```http
GET /api/apm/database?limit=100
Authorization: Bearer <token>
```

### 느린 쿼리 조회
```http
GET /api/apm/slow-queries?threshold=1000
Authorization: Bearer <token>
```

### 느린 작업 조회
```http
GET /api/apm/slow-operations?threshold=2000
Authorization: Bearer <token>
```

### APM 대시보드
```http
GET /api/apm/dashboard
Authorization: Bearer <token>
```

## 🔧 설정

### APM 설정 변경
```typescript
// APM 설정 업데이트
this.apmService.updateConfig({
  enabled: true,
  slowQueryThreshold: 1000,      // 1초
  slowOperationThreshold: 2000,  // 2초
  maxMetricsHistory: 10000,      // 최대 10,000개 메트릭 보관
  enableDatabaseMonitoring: true,
  enableErrorTracking: true,
});
```

## 📈 모니터링 지표

### 성능 지표
- **응답 시간**: API 호출 소요 시간
- **처리량**: 초당 요청 수 (TPS)
- **에러율**: 실패한 요청 비율
- **느린 작업**: 임계값을 초과하는 작업

### 데이터베이스 지표
- **쿼리 성능**: 데이터베이스 쿼리 소요 시간
- **느린 쿼리**: 임계값을 초과하는 쿼리
- **연결 상태**: 데이터베이스 연결 상태

### 에러 지표
- **에러 발생률**: 시간당 에러 발생 수
- **에러 유형**: 에러 종류별 분류
- **에러 스택**: 상세한 에러 정보

## ⚠️ 주의사항

### 메모리 사용량
- 메트릭은 메모리에 저장되므로 `maxMetricsHistory` 설정 주의
- 24시간마다 자동으로 오래된 메트릭 정리
- 필요시 `clearMetrics()` API로 수동 정리

### 성능 영향
- APM 자체도 성능에 영향을 줄 수 있음
- 프로덕션에서는 `enabled: false`로 비활성화 가능
- 중요한 작업에는 신중하게 적용

### 보안
- APM 대시보드는 인증이 필요함
- 민감한 데이터는 메트릭에 포함하지 않음
- 에러 스택에는 개인정보 포함 주의

## 🚀 확장 가능성

### 추가 가능한 기능
1. **알림 시스템**: 임계값 초과 시 알림
2. **데이터베이스 저장**: 메트릭을 DB에 영구 저장
3. **실시간 대시보드**: WebSocket을 통한 실시간 업데이트
4. **메트릭 내보내기**: CSV, JSON 형태로 데이터 내보내기
5. **사용자 정의 대시보드**: 사용자가 원하는 지표만 표시

### 외부 도구 연동
1. **Grafana**: 시각화 도구와 연동
2. **Prometheus**: 메트릭 수집 도구와 연동
3. **Elasticsearch**: 로그 분석 도구와 연동
4. **Slack/Discord**: 알림 도구와 연동

## 📞 지원

APM 시스템에 대한 질문이나 이슈가 있으시면:

- 📧 이메일: [개발팀 이메일]
- 🐛 이슈: [GitHub Issues]
- 📖 문서: [API Documentation](http://localhost:5000/api)

---

<div align="center">

**Made with ❤️ using NestJS**

</div>
