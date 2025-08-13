export interface UploadResponse {
  message: string;
  result: {
    successCount: number;
    failCount: number;
    totalCount: number;
    errors: Array<{
      row: number;
      businessNumber?: string;
      businessName?: string;
      error: string;
      details?: string;
    }>;
    summary: {
      created: number;
      updated: number;
      skipped: number;
    };
  };
}

export interface ValidationResponse {
  message: string;
  sessionId?: string; // 검증 세션 ID
  result: {
    totalCount: number;
    duplicateCount: number;
    newCount: number;
    errorCount: number;
    hasDuplicates: boolean; // 중복 데이터 존재 여부
    hasErrors: boolean; // 오류 데이터 존재 여부
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

export interface CombinedUploadResponse {
  message: string;
  mode: 'add' | 'overwrite';
  result: {
    validation: {
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
    };
    upload: {
      successCount: number;
      failCount: number;
      totalCount: number;
      summary: {
        created: number;
        updated: number;
        skipped: number;
      };
    };
  };
}
