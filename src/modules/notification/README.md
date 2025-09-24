# 알림 관리 모듈 (Notification Module)

## 📋 개요
알림 관리 모듈은 시스템 내에서 발생하는 다양한 알림을 생성, 조회, 관리하는 기능을 제공합니다. 발주, 품질검사, 수주 등의 승인 프로세스와 연동되어 자동으로 알림을 생성하고 관리합니다.

## 🎯 주요 기능
- **알림 생성**: 다양한 타입의 알림 자동 생성
- **알림 조회**: 사용자 권한별 알림 목록 조회
- **알림 관리**: 읽음 처리, 승인/거부 처리
- **통합 승인 대기**: 모든 승인 대기 항목 통합 조회
- **실시간 알림**: 미읽은 알림 개수 조회

## 🔐 권한별 알림 타입

### 관리자 (ADMIN)
- `ORDER_CREATE` - 발주 등록 알림
- `ORDER_CREATE_FROM_ORDER` - 수주 기반 발주 등록 알림
- `APPROVAL_REQUEST` - 승인 요청 알림
- `SYSTEM_NOTIFICATION` - 시스템 알림
- `GENERAL_NOTICE` - 일반 공지

### 평직원 (USER)
- `APPROVAL_COMPLETE` - 승인 완료 알림
- `PERSONAL_NOTIFICATION` - 개인 알림
- `WORK_NOTIFICATION` - 업무 알림

## 📡 API 엔드포인트

### 1. 알림 생성 (Notification Create)

#### 1.1 일반 알림 생성
```http
POST /notification/create
Content-Type: application/json

{
  "notificationType": "GENERAL_NOTICE",
  "notificationTitle": "시스템 점검 안내",
  "notificationContent": "오늘 오후 6시부터 7시까지 시스템 점검이 예정되어 있습니다.",
  "sender": "시스템",
  "receiver": "all",
  "status": "UNREAD"
}
```

#### 1.2 승인 요청 알림 생성
```http
POST /notification/approval-request
Content-Type: application/json

{
  "moduleName": "수주관리",
  "targetId": "ORD001",
  "targetName": "수주 ORD001 - 프로젝트A",
  "targetUser": "admin",
  "approvalType": "수주",
  "sender": "user123"
}
```

#### 1.3 승인 완료 알림 생성
```http
POST /notification/approval-complete
Content-Type: application/json

{
  "moduleName": "수주관리",
  "targetId": "ORD001",
  "targetName": "수주 ORD001 - 프로젝트A",
  "targetUser": "user123",
  "approvalType": "수주",
  "approverName": "admin"
}
```

### 2. 알림 조회 (Notification Read)

#### 2.1 모든 알림 조회
```http
GET /notification/list
```

#### 2.2 읽지 않은 알림 조회
```http
GET /notification/unread
```

#### 2.3 특정 타입 알림 조회
```http
GET /notification/type/{notificationType}
```

#### 2.4 관리자용 알림 조회
```http
GET /notification/admin?page=1&limit=20
```

#### 2.5 평직원용 알림 조회
```http
GET /notification/user?targetUser=사용자명&page=1&limit=20
```

#### 2.6 미읽은 알림 개수 조회
```http
GET /notification/unread-count?targetUser=사용자명&userRole=ADMIN
```

**userRole 옵션:**
- `ADMIN` - 관리자용 알림 개수
- `USER` - 평직원용 알림 개수

### 3. 알림 관리

#### 3.1 알림 읽음 처리
```http
PATCH /notification/read/{id}
```

#### 3.2 모든 알림 읽음 처리
```http
PATCH /notification/read-all
```

#### 3.3 승인 대기 알림 조회
```http
GET /notification/pending
```

#### 3.4 알림 승인
```http
PATCH /notification/approve/{id}
Content-Type: application/json

{
  "approver": "관리자명"
}
```

#### 3.5 알림 거부
```http
PATCH /notification/reject/{id}
Content-Type: application/json

{
  "rejector": "거부자명",
  "reason": "거부 사유"
}
```

### 4. 통합 승인 관리 (Unified Approval)

#### 4.1 모든 승인 대기 항목 통합 조회
```http
GET /unified-approval/all-pending?page=1&limit=20
```

**응답 예시:**
```json
{
  "success": true,
  "message": "통합 승인 대기 목록을 성공적으로 조회했습니다.",
  "data": {
    "items": [
      {
        "id": 1,
        "type": "ORDER",
        "typeName": "발주",
        "code": "ORD001",
        "name": "볼펜 100개",
        "quantity": 100,
        "amount": 100000,
        "status": "대기",
        "createdBy": "user123",
        "createdAt": "2025-01-15T10:00:00Z",
        "details": {
          "customerName": "삼성전자",
          "projectName": "프로젝트A",
          "deliveryDate": "2025-01-20"
        }
      }
    ],
    "statistics": {
      "total": 15,
      "orders": 8,
      "inspections": 4,
      "orderManagement": 3,
      "byType": {
        "ORDER": 8,
        "INSPECTION": 4,
        "ORDER_MANAGEMENT": 3
      }
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### 4.2 타입별 승인 대기 항목 조회
```http
GET /unified-approval/pending-by-type?type=ORDER&page=1&limit=20
```

**지원하는 타입:**
- `ORDER` - 발주
- `INSPECTION` - 품질검사
- `ORDER_MANAGEMENT` - 수주

## 🔄 승인 프로세스 연동

### 발주 승인 프로세스
1. **발주 등록** → `APPROVAL_REQUEST` 알림 생성 (관리자용)
2. **발주 승인** → `APPROVAL_COMPLETE` 알림 생성 (평직원용)

### 품질검사 승인 프로세스
1. **품질검사 등록** → `APPROVAL_REQUEST` 알림 생성 (관리자용)
2. **품질검사 승인** → `APPROVAL_COMPLETE` 알림 생성 (평직원용) + 재고 반영

### 수주 승인 프로세스
1. **수주 등록** → `APPROVAL_REQUEST` 알림 생성 (관리자용)
2. **수주 승인** → `APPROVAL_COMPLETE` 알림 생성 (평직원용)

## 📊 알림 상태

| 상태 | 설명 |
|------|------|
| `UNREAD` | 읽지 않음 |
| `READ` | 읽음 |
| `APPROVED` | 승인됨 |
| `REJECTED` | 거부됨 |

## 🎨 사용 예시

### 관리자 대시보드
```javascript
// 모든 승인 대기 항목 조회
const response = await fetch('/unified-approval/all-pending?page=1&limit=20');
const data = await response.json();

// 통계 정보 표시
console.log(`총 ${data.data.statistics.total}개의 승인 대기 항목`);
console.log(`발주: ${data.data.statistics.orders}개`);
console.log(`품질검사: ${data.data.statistics.inspections}개`);
console.log(`수주: ${data.data.statistics.orderManagement}개`);
```

### 평직원 알림 확인
```javascript
// 미읽은 알림 개수 확인
const unreadCount = await fetch('/notification/unread-count?targetUser=user123&userRole=USER');
const count = await unreadCount.json();

// 알림 목록 조회
const notifications = await fetch('/notification/user?targetUser=user123&userRole=USER');
const notificationList = await notifications.json();
```

## 🔧 설정

### 환경 변수
```env
# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```

### 모듈 의존성
- `LogModule` - 로그 기록
- `TypeOrmModule` - 데이터베이스 연동
- `OrderInfo`, `QualityInspection`, `OrderManagement` 엔티티

## 📝 주의사항

1. **권한 확인**: 각 API는 사용자 권한에 따라 접근이 제한됩니다.
2. **알림 타입**: 알림 타입은 대문자로 작성해야 합니다.
3. **페이지네이션**: 대량의 데이터 조회 시 페이지네이션을 사용하세요.
4. **에러 처리**: API 호출 시 적절한 에러 처리를 구현하세요.

## 🚀 확장 가능성

- **실시간 알림**: WebSocket을 통한 실시간 알림 푸시
- **알림 템플릿**: 다양한 알림 템플릿 지원
- **알림 스케줄링**: 예약된 알림 발송
- **알림 통계**: 상세한 알림 통계 및 분석

---

**문서 버전**: 1.0.0  
**최종 업데이트**: 2025-01-15  
**작성자**: 개발팀
