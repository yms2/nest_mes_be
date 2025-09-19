# 생산 계획 모듈 (Production Plan Module)

생산 계획을 수립하고 관리하는 모듈입니다. 수주 기반 자동 생성과 직접 등록 두 가지 방식을 지원합니다.

## 📋 기능 개요

### 1. 수주 기반 생산 계획 (Order-based Production Planning)
- 수주 정보를 기반으로 BOM을 자동 전개
- 재고 부족 품목을 자동 식별
- 프론트엔드에서 품목 선택 후 생산 계획 생성

### 2. 직접 생산 계획 (Direct Production Planning)
- 수주와 관계없이 직접 생산 계획 등록
- 품목별 개별 생산 계획 수립
- 재고 상황과 무관한 자유로운 생산 계획

## 🏗️ 모듈 구조

```
src/modules/production/plan/
├── entities/
│   └── production-plan.entity.ts          # 생산 계획 엔티티
├── services/
│   ├── bom-explosion.service.ts           # BOM 전개 서비스
│   ├── production-plan-create.service.ts  # 수주 기반 생산 계획 생성
│   ├── production-plan-read.service.ts    # 생산 계획 조회
│   ├── production-plan-download.service.ts # 생산 계획 엑셀 다운로드
│   ├── production-upload.service.ts       # 생산 계획 엑셀 업로드
│   ├── production-plan-template.service.ts # 생산 계획 템플릿 생성
│   └── direct-production-plan-create.service.ts  # 직접 생산 계획 생성
├── controllers/
│   ├── production-plan.controller.ts      # 수주 기반 생산 계획 API
│   ├── production-plan-excel.controller.ts # 생산 계획 엑셀 다운로드 API
│   ├── production-template.controller.ts  # 생산 계획 템플릿 API
│   ├── bom-explosion.controller.ts        # BOM 전개 API
│   └── direct-production-plan.controller.ts  # 직접 생산 계획 API
├── dto/
│   ├── create-production-plan.dto.ts      # 수주 기반 생성 DTO
│   ├── create-direct-production-plan.dto.ts  # 직접 생성 DTO
│   └── query-production-plan.dto.ts       # 조회 DTO
├── utils/
│   └── production-plan-code-generator.util.ts # 생산 계획 코드 생성 유틸
└── production-plan.module.ts              # 모듈 설정
```

## 🚀 API 엔드포인트

### 수주 기반 생산 계획

#### BOM 전개
- `GET /bom-explosion/order/:orderCode` - 수주 기반 BOM 전개
- `GET /bom-explosion/product/:productCode?quantity=100` - 품목 기반 BOM 전개

#### 생산 계획 관리
- `POST /production-plan` - 수주 기반 생산 계획 생성
- `GET /production-plan` - 생산 계획 목록 조회
- `PUT /production-plan/:id` - 생산 계획 수정
- `DELETE /production-plan/:id` - 생산 계획 삭제

### 직접 생산 계획

#### 직접 생산 계획 관리
- `POST /direct-production-plan` - 직접 생산 계획 생성
- `GET /direct-production-plan` - 직접 생산 계획 목록 조회

### 엑셀 관리

#### 생산 계획 엑셀 다운로드
- `GET /production-plan/download-excel` - 생산 계획 엑셀 다운로드
  - 쿼리 파라미터: `keyword`, `page`, `limit`, `productionPlanDate`, `orderType`, `projectName`, `productName`, `employeeName`

#### 생산 계획 템플릿
- `GET /production-plan-template` - 생산 계획 엑셀 템플릿 다운로드

## 💡 사용 시나리오

### 시나리오 1: 수주 기반 생산 계획

1. **수주 접수** → 수주 정보 등록
2. **BOM 전개** → `GET /bom-explosion/selectable/:orderCode`
3. **품목 선택** → 프론트엔드에서 체크박스로 선택
4. **생산 계획 생성** → `POST /production-plan`

```json
// 1단계: 선택 가능한 품목 조회
GET /bom-explosion/selectable/ORD20250101001

// 2단계: 생산 계획 생성
POST /production-plan
{
  "orderCode": "ORD20250101001",
  "selectedProductCodes": ["PRD002", "PRD003"],
  "productionPlanDate": "2025-01-15",
  "expectedStartDate": "2025-01-20",
  "expectedCompletionDate": "2025-01-25",
  "employeeCode": "EMP001",
  "employeeName": "홍길동"
}
```

### 시나리오 2: 직접 생산 계획

1. **품목 선택** → 생산하고자 하는 품목 코드 입력
2. **생산 계획 등록** → `POST /direct-production-plan`

```json
// 직접 생산 계획 생성
POST /direct-production-plan
{
  "productCode": "PRD001",
  "productionPlanQuantity": 100,
  "productionPlanDate": "2025-01-15",
  "expectedStartDate": "2025-01-20",
  "expectedCompletionDate": "2025-01-25",
  "employeeCode": "EMP001",
  "employeeName": "홍길동",
  "orderType": "재고보충",
  "projectCode": "PRJ001",
  "customerCode": "CUS001",
  "remark": "재고 보충을 위한 생산"
}
```

## 🔧 주요 기능

### BOM 전개 (BOM Explosion)
- **재귀적 전개**: 루트 제품부터 모든 하위 품목까지 자동 전개
- **수량 계산**: `부모 수량 × BOM 수량 = 하위 필요 수량`
- **재고 확인**: 현재 재고와 필요 수량 비교
- **순환 참조 방지**: 무한 루프 방지

### 생산 계획 생성
- **자동 코드 생성**: `PP + YYMMDD + 001` 형식
- **재고 상태 분류**: 부족/충분 품목 자동 분류
- **선택적 생산**: 프론트엔드에서 원하는 품목만 선택
- **예상 재고 계산**: `현재 재고 + 생산 수량`

### 엑셀 관리
- **엑셀 다운로드**: 검색 조건에 맞는 생산 계획을 엑셀로 다운로드
- **엑셀 업로드**: 엑셀 파일을 통한 대량 생산 계획 등록
- **템플릿 제공**: 업로드용 엑셀 템플릿 다운로드
- **데이터 검증**: 업로드 시 필수 필드 및 비즈니스 로직 검증

### 데이터 검증
- **품목 존재 확인**: 등록된 품목만 생산 계획 생성 가능
- **수량 검증**: 1개 이상의 수량만 허용
- **날짜 검증**: 시작일 ≤ 완료일 검증
- **필수 필드 검증**: 품목 코드, 수량, 담당자 등 필수 입력

## 📊 데이터 모델

### ProductionPlan 엔티티
```typescript
{
  id: number;                          // 고유 ID
  productionPlanCode: string;          // 생산 계획 코드 (자동 생성)
  productionPlanDate: Date;            // 생산 계획 일자
  orderType: string;                   // 주문 유형 (신규/AS/직접등록)
  projectCode: string;                 // 프로젝트 코드
  projectName: string;                 // 프로젝트 이름
  customerCode: string;                // 고객 코드
  customerName: string;                // 고객 이름
  productCode: string;                 // 품목 코드
  productName: string;                 // 품목 이름
  productType: string;                 // 품목 구분
  productSize: string;                 // 규격
  productStock: number;                // 현재 재고
  productionPlanQuantity: number;      // 생산 계획 수량
  expectedProductStock: number;        // 예상 재고 수량
  expectedStartDate: Date;             // 예상 시작일
  expectedCompletionDate: Date;        // 예상 완료일
  employeeCode: string;                // 담당자 코드
  employeeName: string;                // 담당자 이름
  shortageQuantity: number;            // 부족 수량
  remark: string;                      // 비고
}
```

## 🔍 필터링 및 검색

### 조회 조건
- **수주 코드**: 특정 수주의 생산 계획
- **프로젝트 코드**: 프로젝트별 생산 계획
- **고객 코드**: 고객별 생산 계획
- **품목 코드**: 품목별 생산 계획
- **담당자 코드**: 담당자별 생산 계획
- **날짜 범위**: 생산 계획일, 예상 시작일, 완료일 기준

### 정렬 옵션
- **생산 계획일**: 최신순/오래된순
- **품목 코드**: 알파벳순
- **생성일**: 최신순/오래된순

## 🚨 주의사항

1. **품목 코드 검증**: 등록되지 않은 품목 코드는 사용할 수 없습니다.
2. **수량 제한**: 생산 계획 수량은 1개 이상이어야 합니다.
3. **날짜 검증**: 예상 시작일은 완료일보다 이전이어야 합니다.
4. **권한 관리**: 생산 계획 생성/수정/삭제는 적절한 권한이 필요합니다.
5. **데이터 무결성**: 삭제된 품목의 생산 계획은 별도 처리가 필요합니다.

## 📋 엑셀 업로드 양식

### 필수 컬럼 (순서대로)
1. **생산계획일** - 생산 계획 일자 (필수)
2. **신규,A/S 구분** - 주문 유형
3. **프로젝트명** - 프로젝트 이름
4. **거래처명** - 고객 이름 (필수)
5. **품목명** - 품목 이름 (필수)
6. **품목구분** - 품목 유형
7. **규격** - 품목 규격
8. **재고수량** - 현재 재고
9. **수량** - 생산 계획 수량 (필수)
10. **생산계획수량** - 생산 계획 수량 (중복)
11. **예상 재고수량** - 예상 재고
12. **부족수량** - 부족 수량
13. **예상 시작일** - 예상 시작일
14. **예상 완료일** - 예상 완료일
15. **담당자** - 담당자 이름
16. **비고** - 비고

### 업로드 시 자동 처리
- **생산계획코드**: 자동 생성 (`PP + YYMMDD + 001`)
- **프로젝트코드**: 자동 생성 (`PROJ + 001`)
- **고객코드**: 거래처명으로 자동 조회
- **품목코드**: 품목명으로 자동 조회
- **담당자코드**: 자동 생성

## 🔄 향후 개선 계획

1. **생산 진행 상황 추적**: 생산 시작/완료 상태 관리
2. **자동 재고 업데이트**: 생산 완료 시 재고 자동 반영
3. **생산 일정 최적화**: 자원 배치 및 일정 최적화
4. **알림 시스템**: 생산 계획 관련 알림 기능
5. **리포트 기능**: 생산 계획 현황 및 분석 리포트
