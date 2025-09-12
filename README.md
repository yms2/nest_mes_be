# 🏭 MES 백엔드 시스템 (Manufacturing Execution System)

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.24-green.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)
![JWT](https://img.shields.io/badge/JWT-Authentication-yellow.svg)
![APM](https://img.shields.io/badge/APM-Custom-purple.svg)

**NestJS 기반의 제조업 MES(제조실행시스템) 백엔드 API**

</div>

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [환경 변수](#-환경-변수)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)

## 🎯 프로젝트 개요

제조업을 위한 MES(제조실행시스템) 백엔드 API입니다. 생산 계획, 재고 관리, 품질 관리, 주문 관리 등 제조업 전반의 프로세스를 통합 관리하는 시스템입니다.

### 주요 특징
- 🔐 **JWT 기반 인증 시스템**
- 📊 **커스텀 APM 모니터링**
- ✅ **강력한 데이터 검증**
- 🏗️ **모듈화된 아키텍처**
- 📚 **Swagger API 문서화**
- 📈 **실시간 성능 모니터링**
- 📦 **Excel 업로드/다운로드**
- 🏷️ **바코드/QR코드 생성**

## 🚀 주요 기능

### 📋 기본 정보 관리
- ✅ **사업장 정보**: 사업장 등록/수정/삭제/복원
- ✅ **거래처 관리**: 고객사/공급사 정보 관리
- ✅ **직원 관리**: 직원 정보 및 권한 관리
- ✅ **제품 정보**: 제품 마스터 데이터 관리
- ✅ **BOM 관리**: 제품별 BOM(자재명세서) 관리
- ✅ **공정 관리**: 생산 공정 및 설비 정보

### 🏭 생산 관리
- ✅ **생산 계획**: 생산 일정 및 계획 관리
- ✅ **작업 지시**: 생산 작업 지시서 관리
- ✅ **일일 보고**: 생산 실적 및 일일 보고서
- ✅ **설비 관리**: 설비 등록/점검/수리 관리

### 📦 재고 관리
- ✅ **창고 관리**: 창고별 재고 현황 관리
- ✅ **입고 관리**: 자재/제품 입고 처리
- ✅ **출고 관리**: 자재/제품 출고 처리
- ✅ **재고 조정**: 재고 수량 조정 및 이력 관리

### 💼 영업 관리
- ✅ **견적 관리**: 견적서 작성/수정/승인
- ✅ **주문 관리**: 주문서 및 주문 이력 관리
- ✅ **배송 관리**: 출하 및 배송 관리
- ✅ **매출 관리**: 매출 현황 및 분석

### 🔍 품질 관리
- ✅ **품질 기준**: 품질 검사 기준 관리
- ✅ **불량 관리**: 불량품 등록 및 처리
- ✅ **클레임 관리**: 고객 클레임 처리
- ✅ **개선 관리**: 품질 개선 활동 관리

### 📊 모니터링 및 분석
- ✅ **APM 모니터링**: 실시간 성능 모니터링
- ✅ **대시보드**: 주요 지표 시각화
- ✅ **로그 관리**: 시스템 및 사용자 활동 로그
- ✅ **알림 시스템**: 이상 상황 자동 알림

### 🔐 인증 및 권한
- ✅ **JWT 인증**: 토큰 기반 인증 시스템
- ✅ **권한 관리**: 그룹별 세밀한 권한 제어
- ✅ **사용자 관리**: 사용자 등록/수정/삭제

## 🛠️ 기술 스택

### Backend
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: TypeORM + MySQL/PostgreSQL
- **Authentication**: JWT + Passport.js
- **Validation**: Class Validator + Class Transformer
- **Documentation**: Swagger/OpenAPI
- **File Processing**: ExcelJS, XLSX, Multer
- **Code Generation**: JSBarcode, QRCode, Canvas
- **Email**: Nodemailer

### Monitoring & Performance
- **APM**: 커스텀 APM 시스템
- **Logging**: Winston + 커스텀 로그 시스템
- **Performance**: 실시간 성능 모니터링
- **Error Tracking**: 자동 에러 추적 및 알림

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest
- **Build**: SWC (고속 컴파일러)

## 📁 프로젝트 구조

```
src/
├── common/                          # 공통 모듈
│   ├── apm/                        # APM 모니터링 시스템
│   │   ├── controllers/            # APM 대시보드 API
│   │   ├── services/               # APM 서비스
│   │   ├── middleware/             # APM 미들웨어
│   │   ├── decorators/             # APM 데코레이터
│   │   ├── filters/                # 에러 필터링
│   │   └── config/                 # APM 설정
│   ├── guards/                     # 인증 가드
│   ├── pipes/                      # 커스텀 파이프
│   ├── interfaces/                 # 공통 인터페이스
│   └── exceptions/                 # 커스텀 예외
├── modules/                        # 비즈니스 모듈
│   ├── auth/                       # 인증 모듈
│   │   ├── guards/                 # JWT 가드
│   │   ├── GroupPermission/        # 권한 관리
│   │   └── change-password/        # 비밀번호 변경
│   ├── base-info/                  # 기본 정보 관리
│   │   ├── business-info/          # 사업장 정보
│   │   ├── customer-info/          # 거래처 정보
│   │   ├── employee-info/          # 직원 정보
│   │   ├── product-info/           # 제품 정보
│   │   ├── bom-info/               # BOM 관리
│   │   ├── process-info/           # 공정 정보
│   │   ├── process-equipment/      # 공정 설비
│   │   ├── permission-info/        # 권한 정보
│   │   └── setting-info/           # 설정 정보
│   ├── business-info/              # 영업 관리
│   │   ├── estimatemanagement-info/ # 견적 관리
│   │   ├── order-info/             # 주문 관리
│   │   ├── ordermanagement-info/   # 주문 관리 상세
│   │   ├── shipping-info/          # 출하 관리
│   │   └── receiving-management/   # 입고 관리
│   ├── inventory/                  # 재고 관리
│   │   ├── warehouse/              # 창고 관리
│   │   ├── inventory-management/   # 재고 관리
│   │   └── inventory-logs/         # 재고 로그
│   ├── production/                 # 생산 관리
│   │   ├── plan/                   # 생산 계획
│   │   ├── instruction/            # 작업 지시
│   │   ├── daily-report/           # 일일 보고
│   │   ├── result/                 # 생산 실적
│   │   └── equipment-production/   # 설비 생산
│   ├── quality/                    # 품질 관리
│   │   ├── criteria/               # 품질 기준
│   │   ├── defect/                 # 불량 관리
│   │   ├── claim/                  # 클레임 관리
│   │   └── improvement/            # 개선 관리
│   ├── equipment/                  # 설비 관리
│   │   └── equipment_management/   # 설비 관리
│   ├── sales/                      # 매출 관리
│   │   ├── order/                  # 주문 관리
│   │   ├── delivery/               # 배송 관리
│   │   ├── shipment/               # 출하 관리
│   │   └── warehousing/            # 입고 관리
│   ├── dashboard/                  # 대시보드
│   ├── log/                        # 로깅 시스템
│   ├── notification/               # 알림 시스템
│   └── register/                   # 회원가입
└── main.ts                         # 애플리케이션 진입점
```

## 🚀 시작하기

### 1. 저장소 클론
```bash
git clone <repository-url>
cd nest_be
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 환경 변수 편집
nano .env
```

### 4. 데이터베이스 설정
```bash
# MySQL 또는 PostgreSQL 데이터베이스 생성
# .env 파일에서 데이터베이스 연결 정보 설정
```

### 5. 애플리케이션 실행

#### 개발 모드
```bash
npm run start:dev
```

#### 프로덕션 모드
```bash
npm run build
npm run start:prod
```

#### 디버그 모드
```bash
npm run start:debug
```

### 6. API 문서 확인
브라우저에서 다음 URL 접속:
```
http://localhost:5000/api-docs
```

## 📚 API 문서

### 인증
모든 API 호출 시 JWT 토큰이 필요합니다.

```bash
# 헤더에 토큰 포함
Authorization: Bearer <your-jwt-token>
```

### 주요 엔드포인트

#### 기본 정보 관리
- `POST /api/business-info` - 사업장 정보 생성
- `GET /api/business-info` - 사업장 정보 조회/검색
- `PUT /api/business-info/:businessNumber` - 사업장 정보 수정
- `DELETE /api/business-info/:businessNumber` - 사업장 정보 삭제
- `POST /api/customer-info` - 거래처 정보 생성
- `GET /api/customer-info` - 거래처 정보 조회/검색
- `POST /api/employee-info` - 직원 정보 생성
- `GET /api/employee-info` - 직원 정보 조회/검색

#### 재고 관리
- `POST /api/warehouse` - 창고 정보 생성
- `GET /api/warehouse` - 창고 정보 조회/검색
- `POST /api/warehouse/excel/upload` - 창고 정보 엑셀 업로드
- `GET /api/warehouse/excel/download` - 창고 정보 엑셀 다운로드
- `POST /api/inventory-management` - 재고 관리
- `GET /api/inventory-management` - 재고 현황 조회

#### 생산 관리
- `POST /api/production/plan` - 생산 계획 생성
- `GET /api/production/plan` - 생산 계획 조회
- `POST /api/production/instruction` - 작업 지시 생성
- `GET /api/production/daily-report` - 일일 보고서 조회

#### 영업 관리
- `POST /api/estimatemanagement-info` - 견적서 생성
- `GET /api/estimatemanagement-info` - 견적서 조회
- `POST /api/order-info` - 주문서 생성
- `GET /api/order-info` - 주문서 조회
- `POST /api/shipping-info` - 출하 정보 생성
- `GET /api/shipping-info` - 출하 정보 조회

#### APM 모니터링
- `GET /api/apm/stats` - APM 통계 조회
- `GET /api/apm/performance` - 성능 지표 조회
- `GET /api/apm/errors` - 에러 현황 조회
- `GET /api/apm/dashboard` - APM 대시보드

#### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `POST /api/auth/change-password` - 비밀번호 변경

## ⚙️ 환경 변수

```env
# 서버 설정
PORT=5000
NODE_ENV=development
USE_HTTPS=false

# 데이터베이스
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
DATABASE_NAME=mes_database

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# 로깅
LOG_LEVEL=debug

# APM 설정
APM_ENABLED=true
APM_MAX_METRICS_HISTORY=10000
APM_SLOW_QUERY_THRESHOLD=1000
APM_ERROR_SAMPLING_RATE=1.0

# 파일 업로드
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# 이메일 설정 (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🛠️ 개발 가이드

### 코드 스타일
```bash
# 코드 포맷팅
npm run format

# 린팅
npm run lint
```

### 테스트
```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

### 새로운 모듈 추가
1. `src/modules/` 하위에 새 디렉토리 생성
2. 모듈, 컨트롤러, 서비스 파일 생성
3. `app.module.ts`에 모듈 등록
4. README.md 파일 작성 (모듈별 문서화)

### APM 모니터링 사용법
```typescript
// 1. 데코레이터 사용
@MeasurePerformance('operation-name')
@TrackErrors('operation-name')
async someMethod() {
  // 비즈니스 로직
}

// 2. 서비스 직접 사용
constructor(private apmService: APMService) {}

async someMethod() {
  this.apmService.recordPerformance({
    operation: 'some-operation',
    duration: 100,
    startTime: new Date()
  });
}
```

### Excel 파일 처리
```typescript
// Excel 업로드 예시
@Post('excel/upload')
@UseInterceptors(FileInterceptor('file'))
async uploadExcel(@UploadedFile() file: Express.Multer.File) {
  // Excel 파일 처리 로직
}

// Excel 다운로드 예시
@Get('excel/download')
async downloadExcel(@Res() res: Response) {
  // Excel 파일 생성 및 다운로드
}
```

### 데이터베이스 마이그레이션
```bash
# 마이그레이션 생성
npm run migration:generate

# 마이그레이션 실행
npm run migration:run
```

## 🚀 배포

### Docker를 사용한 배포
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

```bash
# Docker 이미지 빌드
docker build -t business-management-api .

# Docker 컨테이너 실행
docker run -p 3000:3000 business-management-api
```

### 환경별 배포
- **개발**: `npm run start:dev` (포트 5000)
- **스테이징**: `npm run start:prod` (포트 5000)
- **프로덕션**: `npm run start:prod` (포트 5000)

### APM 모니터링 확인
배포 후 다음 URL에서 APM 대시보드 확인:
```
http://localhost:5000/api/apm/dashboard
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

프로젝트에 대한 질문이나 이슈가 있으시면:

- 📧 이메일: [dbalstjd789@daum.net]
- 🐛 이슈: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 문서: [API Documentation](http://localhost:5000/api-docs)
- 📊 모니터링: [APM Dashboard](http://localhost:5000/api/apm/dashboard)

---

<div align="center">

**Made with ❤️ using NestJS for Manufacturing Excellence**

</div>
