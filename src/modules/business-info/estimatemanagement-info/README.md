# 견적관리 (Estimate Management)

## 📋 개요

견적관리 모듈은 고객에게 제품 견적을 생성, 관리, 추적하는 시스템입니다. 견적의 생성부터 승인까지 전 과정을 체계적으로 관리하며, 세부품목별 상세 견적과 엑셀 업로드/다운로드 기능을 제공합니다.

### 주요 특징
- 🔍 **견적 생성 및 관리** - 견적 코드 자동 생성, 버전 관리
- 📊 **세부품목 관리** - 견적별 상세 품목 및 가격 관리
- 📈 **견적 상태 추적** - 견적중, 견적완료, 승인대기, 승인완료, 거절
- 📁 **엑셀 연동** - 견적 데이터 업로드/다운로드, 템플릿 제공
- 🔐 **권한 관리** - 견적 생성/수정/삭제 권한 제어
- 📝 **상세 로깅** - 모든 견적 관련 활동 추적

## 🚀 주요 기능

### 견적 관리
- ✅ **견적 생성** - 견적 기본 정보 및 세부품목 동시 등록
- ✅ **견적 조회** - 견적 목록, 상세 조회, 검색 및 필터링
- ✅ **견적 수정** - 견적 정보 및 세부품목 수정
- ✅ **견적 삭제** - 견적 삭제 및 복원 기능
- ✅ **견적 상태 관리** - 견적 진행 상태 변경

### 세부품목 관리
- ✅ **세부품목 등록** - 견적별 상세 품목 정보 등록
- ✅ **세부품목 수정** - 품목별 수량, 단가, 총가격 수정
- ✅ **세부품목 삭제** - 불필요한 품목 제거
- ✅ **자동 계산** - 수량 × 단가 = 총가격 자동 계산

### 엑셀 연동
- ✅ **견적 업로드** - 엑셀 파일로 견적 데이터 일괄 등록
- ✅ **견적 다운로드** - 견적 데이터를 엑셀 파일로 내보내기
- ✅ **템플릿 제공** - 견적 등록용 엑셀 템플릿 다운로드
- ✅ **데이터 검증** - 업로드 시 데이터 유효성 검사

## 📁 모듈 구조

```
estimatemanagement-info/
├── controllers/                    # 컨트롤러 (CRUD 분리)
│   ├── estimatemanagement.create.controller.ts    # 견적 생성
│   ├── estimatemanagement.read.controller.ts      # 견적 조회
│   ├── estimatemanagement.update.controller.ts    # 견적 수정
│   ├── estimatemanagement.delete.controller.ts    # 견적 삭제
│   └── excel/                      # 엑셀 관련 컨트롤러
│       └── estimatemanagement.excel.controller.ts
├── services/                       # 서비스 (기능별 분리)
│   ├── estimatemanagement-create.service.ts       # 견적 생성 로직
│   ├── estimatemanagement-read.service.ts         # 견적 조회 로직
│   ├── estimatemanagement-update.service.ts       # 견적 수정 로직
│   ├── estimatemanagement-delete.service.ts       # 견적 삭제 로직
│   ├── estimatemanagement-upload.service.ts       # 엑셀 업로드 로직
│   ├── estimatemanagement-download.service.ts     # 엑셀 다운로드 로직
│   └── estimatemanagement-template.service.ts     # 템플릿 생성 로직
├── entities/                       # 데이터베이스 엔티티
│   ├── estimatemanagement.entity.ts               # 견적 메인 엔티티
│   └── estimate-detail.entity.ts                 # 견적 세부품목 엔티티
├── dto/                           # 데이터 전송 객체
│   ├── estimatemanagement-create.dto.ts           # 견적 생성 DTO
│   ├── estimate-detail.dto.ts                    # 세부품목 DTO
│   └── delete-estimate.dto.ts                    # 견적 삭제 DTO
└── estimatemanagement.module.ts   # 모듈 정의
```

## 🛠️ 기술 스택

### Backend
- **Framework**: NestJS
- **Database**: TypeORM + MySQL
- **Validation**: Class Validator
- **Documentation**: Swagger/OpenAPI
- **File Processing**: ExcelJS

### Dependencies
- **TypeORM**: 데이터베이스 ORM
- **ExcelJS**: 엑셀 파일 처리
- **Class Validator**: 데이터 검증
- **Swagger**: API 문서화

## 📚 API 엔드포인트

### 견적 관리

#### 견적 생성
```http
POST /api/estimate-management/with-details
Content-Type: application/json
Authorization: Bearer <token>

{
  "estimate": {
    "estimateName": "2025년 1분기 스마트폰 견적",
    "estimateDate": "2025-08-25",
    "estimateVersion": 1,
    "customerCode": "CUST001",
    "customerName": "삼성전자",
    "projectCode": "PROJ001",
    "projectName": "스마트폰 개발",
    "productCode": "PROD001",
    "productName": "갤럭시 S25",
    "productQuantity": 1000,
    "estimateStatus": "견적중",
    "estimatePrice": 50000000,
    "employeeCode": "EMP001",
    "employeeName": "김철수",
    "estimateRemark": "긴급 견적"
  },
  "estimateDetails": [
    {
      "itemCode": "ITEM001",
      "itemName": "CPU 프로세서",
      "itemSpecification": "Intel Core i7-12700K",
      "unit": "개",
      "quantity": 10.00,
      "unitPrice": 150000.00,
      "totalPrice": 1500000.00
    }
  ]
}
```

#### 견적 조회
```http
GET /api/estimate-management?customerCode=CUST001&estimateStatus=견적중&page=1&limit=10
Authorization: Bearer <token>
```

#### 견적 수정
```http
PUT /api/estimate-management/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "estimateName": "수정된 견적명",
  "estimateStatus": "견적완료",
  "estimatePrice": 55000000
}
```

#### 견적 삭제
```http
DELETE /api/estimate-management/:id
Authorization: Bearer <token>
```

### 세부품목 관리

#### 세부품목 추가
```http
POST /api/estimate-management/:id/details
Content-Type: application/json
Authorization: Bearer <token>

{
  "estimateDetails": [
    {
      "itemCode": "ITEM002",
      "itemName": "메모리",
      "itemSpecification": "DDR5 16GB",
      "unit": "개",
      "quantity": 20.00,
      "unitPrice": 80000.00,
      "totalPrice": 1600000.00
    }
  ]
}
```

### 엑셀 연동

#### 견적 업로드
```http
POST /api/estimate-management/excel/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: [엑셀 파일]
```

#### 견적 다운로드
```http
GET /api/estimate-management/excel/download?customerCode=CUST001&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <token>
```

#### 템플릿 다운로드
```http
GET /api/estimate-management/excel/template
Authorization: Bearer <token>
```

## 📊 데이터 구조

### EstimateManagement Entity
```typescript
{
  id: number;                    // 견적 ID (자동 증가)
  estimateCode: string;          // 견적 코드 (자동 생성)
  estimateName: string;          // 견적명
  estimateDate: Date;            // 견적 날짜
  estimateVersion: number;       // 견적 버전
  customerCode: string;          // 고객 코드
  customerName: string;          // 고객명
  projectCode: string;           // 프로젝트 코드
  projectName: string;           // 프로젝트명
  productCode: string;           // 제품 코드
  productName: string;           // 제품명
  productQuantity: number;       // 제품 수량
  estimateStatus: string;        // 견적 상태
  estimatePrice: number;         // 견적 가격
  employeeCode: string;          // 직원 코드
  employeeName: string;          // 직원명
  estimateRemark?: string;       // 견적 비고
  ordermanagementCode?: string;  // 수주관리 코드
  termsOfPayment?: string;       // 결제 조건
  estimateDetails: EstimateDetail[]; // 세부품목 배열
}
```

### EstimateDetail Entity
```typescript
{
  id: number;                    // 세부품목 ID
  estimateId: number;            // 견적 ID
  detailCode?: string;           // 세부품목 코드
  itemCode: string;              // 품목 코드
  itemName: string;              // 품목명
  itemSpecification?: string;    // 품목 사양
  unit?: string;                 // 단위
  quantity: number;              // 수량
  unitPrice: number;             // 단가
  totalPrice: number;            // 총가격
}
```

## 🔄 견적 상태 관리

### 상태 흐름
```
견적중 → 견적완료 → 승인대기 → 승인완료
   ↓         ↓         ↓
  거절 ←──── 거절 ←──── 거절
```

### 상태별 설명
- **견적중**: 견적 작성 중
- **견적완료**: 견적 작성 완료
- **승인대기**: 고객 승인 대기 중
- **승인완료**: 고객 승인 완료
- **거절**: 견적 거절

## 📝 비즈니스 규칙

### 견적 코드 생성
- **형식**: `EST{YYYYMMDD}{XXXX}`
- **예시**: `EST20250825001`
- **규칙**: 일자별 순차 증가

### 견적 버전 관리
- **신규 견적**: 버전 1부터 시작
- **견적 수정**: 기존 견적 수정 시 버전 증가
- **견적 복사**: 새 견적 코드로 버전 1부터 시작

### 가격 계산
- **세부품목 총가격**: `수량 × 단가`
- **견적 총가격**: 모든 세부품목 총가격 합계
- **자동 계산**: 수량 또는 단가 변경 시 자동 재계산

### 권한 관리
- **견적 생성**: 모든 직원
- **견적 수정**: 작성자 또는 관리자
- **견적 삭제**: 관리자만 가능
- **견적 승인**: 관리자만 가능

## ⚠️ 주의사항

### 견적 생성 시
- **견적명**: 필수 입력, 최대 100자
- **고객 정보**: 고객 코드와 고객명 모두 필수
- **프로젝트 정보**: 프로젝트 코드와 프로젝트명 모두 필수
- **제품 정보**: 제품 코드와 제품명 모두 필수
- **견적 상태**: 유효한 상태값만 입력 가능

### 견적 수정 시
- **승인완료 상태**: 수정 불가
- **거절 상태**: 수정 불가
- **버전 관리**: 수정 시 버전 자동 증가

### 견적 삭제 시
- **승인완료 상태**: 삭제 불가
- **관련 데이터**: 세부품목도 함께 삭제
- **복원 가능**: 삭제된 견적은 복원 가능

### 엑셀 업로드 시
- **파일 형식**: .xlsx 파일만 지원
- **데이터 검증**: 업로드 전 데이터 유효성 검사
- **중복 처리**: 견적 코드 중복 시 오류 발생
- **템플릿 사용**: 제공된 템플릿 사용 권장

## 🔧 개발 가이드

### 새로운 견적 상태 추가
1. `EstimateManagement` 엔티티의 `estimateStatus` 컬럼 확인
2. DTO의 `@IsIn` 데코레이터에 새 상태 추가
3. 서비스 로직에서 새 상태 처리 추가

### 새로운 검색 필터 추가
1. `SearchEstimateDto`에 새 필드 추가
2. 서비스의 검색 로직에 새 필터 적용
3. 컨트롤러의 Swagger 문서 업데이트

### 엑셀 템플릿 수정
1. `EstimateTemplateService`의 `generateTemplate` 메서드 수정
2. 컬럼 헤더 및 예시 데이터 업데이트
3. 업로드 서비스의 파싱 로직도 함께 수정

## 📞 지원

견적관리 모듈에 대한 질문이나 이슈가 있으시면:

- 📧 이메일: [개발팀 이메일]
- 🐛 이슈: [GitHub Issues]
- 📖 문서: [API Documentation](http://localhost:5000/api)

---

<div align="center">

**Made with ❤️ using NestJS**

</div>
