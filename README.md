# 🏢 사업장 관리 시스템 (Business Management System)

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.24-green.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)
![JWT](https://img.shields.io/badge/JWT-Authentication-yellow.svg)

**NestJS 기반의 엔터프라이즈급 사업장 관리 백엔드 시스템**

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

사업장 정보와 거래처 정보를 체계적으로 관리하는 백엔드 시스템입니다. JWT 기반 인증, 상세한 로깅, 데이터 검증을 통해 안전하고 확장 가능한 API를 제공합니다.

### 주요 특징
- 🔐 **JWT 기반 인증 시스템**
- 📊 **상세한 활동 로깅**
- ✅ **강력한 데이터 검증**
- 🏗️ **모듈화된 아키텍처**
- 📚 **Swagger API 문서화**

## 🚀 주요 기능

### 사업장 관리
- ✅ 사업장 정보 생성/조회/수정/삭제
- ✅ 사업자번호 중복 검증
- ✅ 사업장 정보 검색 및 필터링
- ✅ 영구 삭제 및 복원 기능

### 거래처 관리
- ✅ 거래처 정보 CRUD
- ✅ 거래처 검색 및 필터링

### 인증 및 권한
- ✅ JWT 토큰 기반 인증
- ✅ 그룹별 권한 관리
- ✅ 비밀번호 변경 기능

### 로깅 시스템
- ✅ 사용자 활동 로그
- ✅ API 호출 로그
- ✅ 에러 로그

## 🛠️ 기술 스택

### Backend
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5.7.3
- **Database**: TypeORM + MySQL/PostgreSQL
- **Authentication**: JWT + Passport.js
- **Validation**: Class Validator
- **Documentation**: Swagger/OpenAPI

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest

## 📁 프로젝트 구조

```
src/
├── common/                          # 공통 모듈
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
│   │   │   ├── controllers/        # 컨트롤러 (CRUD 분리)
│   │   │   ├── services/           # 서비스 (기능별 분리)
│   │   │   ├── entities/           # 엔티티
│   │   │   ├── dto/                # 데이터 전송 객체
│   │   │   ├── utils/              # 유틸리티
│   │   │   └── constants/          # 상수
│   │   └── customer-info/          # 거래처 정보
│   ├── log/                        # 로깅 시스템
│   │   ├── Services/               # 로그 서비스
│   │   └── entities/               # 로그 엔티티
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
http://localhost:3000/api
```

## 📚 API 문서

### 인증
모든 API 호출 시 JWT 토큰이 필요합니다.

```bash
# 헤더에 토큰 포함
Authorization: Bearer <your-jwt-token>
```

### 주요 엔드포인트

#### 사업장 관리
- `POST /business-info` - 사업장 정보 생성
- `GET /business-info` - 사업장 정보 조회/검색
- `PUT /business-info/:businessNumber` - 사업장 정보 수정
- `DELETE /business-info/:businessNumber` - 사업장 정보 삭제
- `POST /business-info/:businessNumber/restore` - 사업장 정보 복원

#### 거래처 관리
- `POST /customer-info` - 거래처 정보 생성
- `GET /customer-info` - 거래처 정보 조회/검색
- `PUT /customer-info/:id` - 거래처 정보 수정
- `DELETE /customer-info/:id` - 거래처 정보 삭제

#### 인증
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `POST /auth/refresh` - 토큰 갱신
- `POST /auth/change-password` - 비밀번호 변경

## ⚙️ 환경 변수

```env
# 서버 설정
PORT=3000
NODE_ENV=development

# 데이터베이스
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=password
DATABASE_NAME=business_management

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h

# 로깅
LOG_LEVEL=debug
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
- **개발**: `npm run start:dev`
- **스테이징**: `npm run start:prod`
- **프로덕션**: `npm run start:prod`

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
- 📖 문서: [API Documentation](http://localhost:3000/api)

---

<div align="center">

**Made with ❤️ using NestJS**

</div>
