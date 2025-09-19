# 납품관리 시스템 (Delivery Management System)

## 📋 개요
납품관리 시스템은 제품의 납품 등록, 수정, 삭제, 조회 및 엑셀 업로드/다운로드 기능을 제공합니다. 납품 등록 시 자동으로 재고가 차감되며, 수정/삭제 시에도 재고가 적절히 조정됩니다.

## 🏗️ 시스템 구조

### 엔티티 (Entities)
- **Delivery**: 납품 정보를 저장하는 메인 엔티티
- **Shipping**: 출하 정보 (납품과 연관)
- **CustomerInfo**: 거래처 정보 (코드 자동 매핑)
- **ProductInfo**: 품목 정보 (코드 자동 매핑)
- **OrderManagement**: 수주 정보 (프로젝트 코드 매핑)

### 서비스 (Services)
- **DeliveryCreateService**: 납품 생성 및 재고 차감
- **DeliveryUpdateService**: 납품 수정 및 재고 조정
- **DeliveryReadService**: 납품 조회 및 검색
- **DeliveryUploadService**: 엑셀 업로드 및 재고 차감
- **DeliveryDownloadService**: 엑셀 다운로드
- **DeliveryTemplateService**: 엑셀 템플릿 생성

### 컨트롤러 (Controllers)
- **DeliveryCreateController**: 납품 생성 API
- **DeliveryUpdateController**: 납품 수정/삭제 API
- **DeliveryReadController**: 납품 조회 API
- **DeliveryExcelController**: 엑셀 업로드/다운로드 API

## 🔄 비즈니스 로직

### 1. 납품 생성 (Create)
#### 1.1 출하코드로부터 납품 생성
```typescript
POST /api/delivery-info/from-shipping
```
- **입력**: 출하코드, 납품수량, 납품일자, 납품상태, 비고
- **처리 과정**:
  1. 출하 정보 조회
  2. 납품코드 자동 생성 (`DEL20250115001` 형식)
  3. 납품 데이터 생성 (출하 정보에서 자동 매핑)
  4. **재고 차감** (전체 재고 + LOT 재고)
  5. 납품 데이터 저장
  6. 로그 기록

#### 1.2 출하 없이 납품 생성
```typescript
POST /api/delivery-info/without-shipping
```
- **입력**: 거래처코드, 거래처명, 품목코드, 품목명, 프로젝트코드, 프로젝트명, 수주유형, 납품수량
- **처리 과정**:
  1. 납품코드 자동 생성
  2. 납품 데이터 생성
  3. **재고 차감** (전체 재고만)
  4. 납품 데이터 저장
  5. 로그 기록

### 2. 납품 수정 (Update)
```typescript
PUT /api/delivery-info/:deliveryCode
```
- **수량 변경 시 재고 처리** (롤백 후 재차감):
  1. **기존 재고 롤백**: 기존 차감된 수량만큼 재고 복구
  2. **새로운 재고 차감**: 새로운 수량만큼 재고 차감
  3. **LOT 재고 처리**: 출하코드가 있으면 LOT 재고도 동일하게 처리

### 3. 납품 삭제 (Delete)
```typescript
DELETE /api/delivery-info/:id
```
- **소프트 삭제** + **재고 롤백**:
  1. 기존 납품 정보 조회
  2. **재고 롤백**: 기존 차감된 수량만큼 재고 복구
  3. 소프트 삭제 실행 (`deletedAt` 필드 설정)
  4. 로그 기록

### 4. 엑셀 업로드 (Excel Upload)
```typescript
POST /api/delivery-info/upload-excel
```
- **필수 필드**: 납품일자, 거래처명, 품목명, 프로젝트명, 수주유형, 납품수량
- **선택 필드**: 납품상태, 비고
- **처리 과정**:
  1. 엑셀 파일 읽기 및 헤더 검증
  2. 거래처명 → 거래처코드 자동 매핑
  3. 품목명 → 품목코드 자동 매핑
  4. 프로젝트명 → 프로젝트코드 자동 매핑
  5. 납품코드 자동 생성
  6. 배치 저장
  7. **재고 차감** (각 납품별)
  8. 결과 반환 (성공/실패 건수)

### 5. 엑셀 다운로드 (Excel Download)
```typescript
GET /api/delivery-info/download-excel
```
- **다운로드 컬럼**: 납품코드, 납품일자, 거래처코드, 거래처명, 품목코드, 품목명, 프로젝트명, 수주유형, 납품수량, 납품상태, 비고
- **검색 옵션**: 키워드 검색, 필터링 지원

## 🔍 조회 기능

### 1. 전체 납품 조회
```typescript
GET /api/delivery-info/
```
- **페이징**: page, limit 파라미터
- **검색**: search 파라미터 (납품코드, 거래처명, 품목명, 프로젝트명, 수주유형)
- **필터링**: customerName, productName, projectName, startDate, endDate

### 2. 납품 등록 가능한 출하코드 조회
```typescript
POST /api/delivery-info/available-shipping-codes
```
- 납품 등록이 가능한 출하코드 목록을 조회
- 출하 상태가 '출하완료'인 출하코드들을 반환

## 📊 재고 관리 연동

### 재고 차감 프로세스
1. **전체 재고 차감**: `InventoryManagementService.changeInventoryQuantity()`
2. **LOT 재고 차감**: `InventoryLotService.decreaseLotInventory()` (출하코드가 있는 경우)
3. **재고 이력 기록**: 모든 재고 변경 사항이 로그에 기록됨

### 재고 복구 프로세스
1. **전체 재고 복구**: 기존 차감된 수량만큼 재고 증가
2. **LOT 재고 복구**: 해당 LOT의 재고도 동일하게 복구
3. **복구 이력 기록**: 롤백 사유와 함께 로그 기록

## 📝 로깅 시스템

### 로그 모듈
- **납품관리 생성**: 납품 등록 성공/실패
- **납품관리 수정**: 납품 수정 성공/실패
- **납품관리 삭제**: 납품 삭제 성공/실패
- **재고관리**: 재고 차감/복구 성공/실패
- **DELIVERY_UPLOAD**: 엑셀 업로드 성공/실패

### 로그 상세 정보
- **모듈명**: 어떤 기능에서 발생했는지
- **액션**: 구체적인 작업 내용
- **사용자**: 작업을 수행한 사용자
- **대상 ID**: 작업 대상의 식별자
- **상세 내용**: 작업의 구체적인 내용

## 🚀 API 엔드포인트

### 납품 생성
- `POST /api/delivery-info/from-shipping` - 출하코드로부터 납품 생성
- `POST /api/delivery-info/without-shipping` - 출하 없이 납품 생성
- `POST /api/delivery-info/available-shipping-codes` - 납품 등록 가능한 출하코드 목록 조회

### 납품 수정/삭제
- `PUT /api/delivery-info/:deliveryCode` - 납품 정보 수정
- `DELETE /api/delivery-info/:id` - 납품 삭제 (ID)

### 납품 조회
- `GET /api/delivery-info/` - 전체 납품 조회 (페이징, 검색, 필터링)

### 엑셀 기능
- `GET /api/delivery-info/download-template` - 업로드용 템플릿 다운로드
- `GET /api/delivery-info/download-excel` - 데이터 다운로드
- `POST /api/delivery-info/upload-excel` - 엑셀 업로드

## 🔧 설정 및 의존성

### 모듈 의존성
- **InventoryManagementModule**: 재고 관리 서비스
- **LogModule**: 로깅 서비스
- **TypeORM**: 데이터베이스 ORM

### 엔티티 등록
```typescript
TypeOrmModule.forFeature([
  Delivery, 
  Shipping, 
  CustomerInfo, 
  ProductInfo, 
  OrderManagement
])
```

## 📋 데이터 흐름

### 납품 생성 흐름
```
사용자 입력 → 납품 데이터 생성 → 재고 차감 → 데이터 저장 → 로그 기록
```

### 납품 수정 흐름
```
기존 데이터 조회 → 수량 변경 감지 → 재고 롤백 → 재고 재차감 → 데이터 수정 → 로그 기록
```

### 납품 삭제 흐름
```
기존 데이터 조회 → 재고 롤백 → 소프트 삭제 → 로그 기록
```

### 엑셀 업로드 흐름
```
엑셀 파일 읽기 → 헤더 검증 → 데이터 매핑 → 배치 저장 → 재고 차감 → 결과 반환
```

## ⚠️ 주의사항

1. **재고 부족**: LOT 재고가 부족한 경우 오류 발생
2. **중복 방지**: 납품코드는 자동 생성되므로 중복 없음
3. **소프트 삭제**: 삭제된 데이터는 `deletedAt` 필드로 관리
4. **트랜잭션**: 재고 차감과 데이터 저장은 별도 처리 (재고 차감 실패해도 납품은 성공)
5. **로깅**: 모든 작업은 상세 로그로 추적 가능

## 🔄 버전 히스토리

- **v1.0**: 기본 납품 CRUD 기능
- **v1.1**: 엑셀 업로드/다운로드 기능 추가
- **v1.2**: 재고 관리 연동 (차감/복구)
- **v1.3**: 롤백 후 재차감 방식으로 수정 로직 개선
- **v1.4**: 삭제 시 재고 롤백 기능 추가
