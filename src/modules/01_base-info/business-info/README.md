# Business Info Upload API

## 개요
사업장 정보 엑셀 업로드 기능은 두 단계로 구성됩니다:

1. **검증 단계** (`/upload/validate`): 엑셀 파일을 분석하여 중복 데이터와 오류를 확인
2. **저장 단계** (`/upload`): 사용자 확인 후 실제 데이터 저장

## API 엔드포인트

### 1. 엑셀 검증 API (권장)
```http
POST /business-info/upload/validate
Content-Type: multipart/form-data

file: [엑셀 파일]
```

**사용 시나리오**: 안전한 업로드를 원할 때
- 중복 데이터 미리 확인
- 오류 데이터 미리 확인  
- 사용자 확인 후 저장

**응답 예시:**
```json
{
  "message": "검증이 완료되었습니다.",
  "sessionId": "validation_1234567890_abc123def",
  "result": {
    "totalCount": 100,
    "duplicateCount": 15,
    "newCount": 80,
    "errorCount": 5,
    "hasDuplicates": true,
    "hasErrors": true,
    "duplicates": [
      {
        "row": 3,
        "businessNumber": "1234567890",
        "businessName": "새로운회사명",
        "existingBusinessName": "기존회사명"
      }
    ],
    "errors": [
      {
        "row": 5,
        "businessNumber": "123456789",
        "businessName": "테스트회사",
        "error": "사업자등록번호는 10자리 숫자여야 합니다."
      }
    ],
    "preview": {
      "toCreate": [
        {
          "businessNumber": "1234567890",
          "businessName": "신규회사",
          "businessCeo": "홍길동"
        }
      ],
      "toUpdate": [
        {
          "businessNumber": "1234567890",
          "businessName": "업데이트회사",
          "businessCeo": "김철수",
          "existingBusinessName": "기존회사명"
        }
      ]
    }
  }
}
```

### 2. 검증된 데이터 저장 API (새로 추가)
```http
POST /business-info/upload/confirmed
Content-Type: application/json

{
  "validationId": "validation_1234567890_abc123def",
  "mode": "overwrite"
}
```

**사용 시나리오**: 검증 후 실제 저장
- 검증 API에서 받은 sessionId 사용
- 파일을 다시 업로드할 필요 없음
- 검증된 데이터를 바로 저장

### 3. 엑셀 업로드 API (직접 저장)
```http
POST /business-info/upload?mode=overwrite
Content-Type: multipart/form-data

file: [엑셀 파일]
```

**사용 시나리오**: 빠른 업로드가 필요할 때
- 검증 없이 바로 저장
- 중복 데이터 처리 방식 선택 가능

**응답 예시:**
```json
{
  "message": "검증이 완료되었습니다.",
  "result": {
    "totalCount": 100,
    "duplicateCount": 15,
    "newCount": 80,
    "errorCount": 5,
    "hasDuplicates": true,
    "hasErrors": true,
    "duplicates": [
      {
        "row": 3,
        "businessNumber": "1234567890",
        "businessName": "새로운회사명",
        "existingBusinessName": "기존회사명"
      }
    ],
    "errors": [
      {
        "row": 5,
        "businessNumber": "123456789",
        "businessName": "테스트회사",
        "error": "사업자등록번호는 10자리 숫자여야 합니다."
      }
    ],
    "preview": {
      "toCreate": [
        {
          "businessNumber": "1234567890",
          "businessName": "신규회사",
          "businessCeo": "홍길동"
        }
      ],
      "toUpdate": [
        {
          "businessNumber": "1234567890",
          "businessName": "업데이트회사",
          "businessCeo": "김철수",
          "existingBusinessName": "기존회사명"
        }
      ]
    }
  }
}
```

### 2. 엑셀 저장 API
```http
POST /business-info/upload?mode=overwrite
Content-Type: multipart/form-data

file: [엑셀 파일]
```

**Query Parameters:**
- `mode`: 업로드 모드
  - `add` (기본값): 신규 데이터만 등록
  - `overwrite`: 중복 시 덮어쓰기

**응답 예시:**
```json
{
  "message": "업로드가 완료되었습니다.",
  "result": {
    "successCount": 95,
    "failCount": 5,
    "totalCount": 100,
    "errors": [
      {
        "row": 5,
        "businessNumber": "123456789",
        "businessName": "테스트회사",
        "error": "사업자등록번호는 10자리 숫자여야 합니다.",
        "details": "Error stack trace..."
      }
    ],
    "summary": {
      "created": 80,
      "updated": 15,
      "skipped": 0
    }
  }
}
```

## 프론트엔드 구현 예시

### React + TypeScript 예시

```typescript
import React, { useState } from 'react';
import axios from 'axios';

interface ValidationResult {
  message: string;
  result: {
    totalCount: number;
    duplicateCount: number;
    newCount: number;
    errorCount: number;
    hasDuplicates: boolean;
    hasErrors: boolean;
    duplicates: Array<{
      row: number;
      businessNumber: string;
      businessName: string;
      existingBusinessName: string;
    }>;
    errors: Array<{
      row: number;
      businessNumber?: string;
      businessName?: string;
      error: string;
    }>;
    preview: {
      toCreate: Array<{
        businessNumber: string;
        businessName: string;
        businessCeo: string;
      }>;
      toUpdate: Array<{
        businessNumber: string;
        businessName: string;
        businessCeo: string;
        existingBusinessName: string;
      }>;
    };
  };
}

const BusinessUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'safe' | 'direct'>('safe'); // safe: 검증 후 저장, direct: 직접 저장

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFile(selectedFile);
      setValidationResult(null);
    } else {
      alert('엑셀 파일(.xlsx)을 선택해주세요.');
    }
  };

  const validateFile = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<ValidationResult>(
        '/api/business-info/upload/validate',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setValidationResult(response.data);
    } catch (error) {
      console.error('검증 실패:', error);
      alert('파일 검증에 실패했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const uploadFile = async (mode: 'add' | 'overwrite') => {
    if (!file || !validationResult?.sessionId) return;

    setIsUploading(true);
    try {
      const response = await axios.post(
        '/api/business-info/upload/confirmed',
        {
          validationId: validationResult.sessionId,
          mode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      alert('업로드가 완료되었습니다!');
      setFile(null);
      setValidationResult(null);
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const directUpload = async (mode: 'add' | 'overwrite') => {
    if (!file) return;

    const confirmed = window.confirm(
      '검증 없이 바로 업로드하시겠습니까?\n\n' +
      '⚠️ 중복 데이터나 오류 데이터가 있을 수 있습니다.'
    );

    if (!confirmed) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `/api/business-info/upload?mode=${mode}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('업로드가 완료되었습니다!');
      setFile(null);
      setValidationResult(null);
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="business-upload">
      <h2>사업장 정보 엑셀 업로드</h2>
      
      {/* 업로드 모드 선택 */}
      <div className="upload-mode">
        <h3>업로드 방식 선택</h3>
        <div className="mode-buttons">
          <button
            onClick={() => setUploadMode('safe')}
            className={uploadMode === 'safe' ? 'active' : ''}
          >
            🔒 안전한 업로드 (검증 후 저장)
          </button>
          <button
            onClick={() => setUploadMode('direct')}
            className={uploadMode === 'direct' ? 'active' : ''}
          >
            ⚡ 빠른 업로드 (직접 저장)
          </button>
        </div>
      </div>
      
      {/* 파일 선택 */}
      <div className="file-section">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          disabled={isValidating || isUploading}
        />
        
        {uploadMode === 'safe' ? (
          <button
            onClick={validateFile}
            disabled={!file || isValidating || isUploading}
          >
            {isValidating ? '검증 중...' : '파일 검증'}
          </button>
        ) : (
          <div className="direct-upload-buttons">
            <button
              onClick={() => directUpload('add')}
              disabled={!file || isUploading}
            >
              {isUploading ? '업로드 중...' : '신규만 등록'}
            </button>
            <button
              onClick={() => directUpload('overwrite')}
              disabled={!file || isUploading}
            >
              {isUploading ? '업로드 중...' : '중복 시 덮어쓰기'}
            </button>
          </div>
        )}
      </div>

      {/* 검증 결과 (안전한 업로드 모드에서만 표시) */}
      {uploadMode === 'safe' && validationResult && (
        <div className="validation-result">
          <h3>검증 결과</h3>
          <div className="summary">
            <p>총 {validationResult.result.totalCount}개 행</p>
            <p>신규: {validationResult.result.newCount}개</p>
            <p>중복: {validationResult.result.duplicateCount}개</p>
            <p>오류: {validationResult.result.errorCount}개</p>
          </div>

          {/* 중복 데이터가 있는 경우에만 표시 */}
          {validationResult.result.hasDuplicates && (
            <div className="duplicates">
              <h4>중복 데이터 ({validationResult.result.duplicateCount}개)</h4>
              <div className="duplicate-list">
                {validationResult.result.duplicates.map((dup, index) => (
                  <div key={index} className="duplicate-item">
                    <span>행 {dup.row}: {dup.businessNumber}</span>
                    <span>새 이름: {dup.businessName}</span>
                    <span>기존 이름: {dup.existingBusinessName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 오류 데이터가 있는 경우에만 표시 */}
          {validationResult.result.hasErrors && (
            <div className="errors">
              <h4>오류 데이터 ({validationResult.result.errorCount}개)</h4>
              <div className="error-list">
                {validationResult.result.errors.map((error, index) => (
                  <div key={index} className="error-item">
                    <span>행 {error.row}: {error.businessNumber || 'N/A'}</span>
                    <span>{error.businessName || 'N/A'}</span>
                    <span className="error-message">{error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 업로드 옵션 */}
          <div className="upload-options">
            <h4>업로드 옵션</h4>
            <div className="option-buttons">
              <button
                onClick={() => uploadFile('add')}
                disabled={isUploading}
                className="btn-add"
              >
                {isUploading ? '업로드 중...' : '신규만 등록'}
              </button>
              {/* 중복 데이터가 있는 경우에만 덮어쓰기 버튼 표시 */}
              {validationResult.result.hasDuplicates && (
                <button
                  onClick={() => uploadFile('overwrite')}
                  disabled={isUploading}
                  className="btn-overwrite"
                >
                  {isUploading ? '업로드 중...' : '중복 시 덮어쓰기'}
                </button>
              )}
            </div>
          </div>

          {/* 상태별 메시지 */}
          <div className="status-messages">
            {!validationResult.result.hasDuplicates && !validationResult.result.hasErrors && (
              <div className="success-message">
                ✅ 모든 데이터가 정상입니다. 바로 업로드할 수 있습니다.
              </div>
            )}
            {validationResult.result.hasDuplicates && !validationResult.result.hasErrors && (
              <div className="warning-message">
                ⚠️ 중복 데이터가 있습니다. 덮어쓰기 여부를 선택해주세요.
              </div>
            )}
            {validationResult.result.hasErrors && (
              <div className="error-message">
                ❌ 오류가 있는 데이터가 있습니다. 엑셀 파일을 수정 후 다시 업로드해주세요.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessUploadComponent;
```

## 엑셀 파일 형식

엑셀 파일은 다음 컬럼을 포함해야 합니다:

| 컬럼명 | 필수 | 설명 |
|--------|------|------|
| 사업자등록번호 | ✅ | 10자리 숫자 |
| 사업장명 | ✅ | 회사명 |
| 대표자명 | ✅ | 대표자 이름 |
| 법인번호 | ❌ | 법인등록번호 |
| 업태 | ❌ | 사업 형태 |
| 종목 | ❌ | 사업 종목 |
| 전화번호 | ❌ | 회사 전화번호 |
| 휴대전화 | ❌ | 휴대전화번호 |
| FAX | ❌ | 팩스번호 |
| 우편번호 | ❌ | 우편번호 |
| 주소 | ❌ | 기본 주소 |
| 상세주소 | ❌ | 상세 주소 |
| 대표자 이메일 | ❌ | 대표자 이메일 |

## 주의사항

1. **검증 단계**: 실제 저장 없이 미리보기만 제공
2. **저장 단계**: 사용자 확인 후 실제 데이터베이스에 저장
3. **중복 처리**: `mode` 파라미터로 중복 데이터 처리 방식 선택
4. **오류 처리**: 각 행별로 상세한 오류 정보 제공
5. **배치 처리**: 대용량 데이터도 효율적으로 처리 