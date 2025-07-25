import { Injectable } from '@nestjs/common';
import { BusinessInfo } from '../../entities/business-info.entity';
import { BusinessExcelRow, ValidationResult } from './business-info-upload-validation.service';
import { BusinessUtils } from '../../utils/business.utils';

interface ValidationSession {
  id: string;
  data: {
    rows: BusinessExcelRow[];
    businessNumberMap: Map<string, BusinessInfo>;
    nextCodeNumber: number;
  };
  validationResult: ValidationResult;
  createdAt: Date;
}

@Injectable()
export class BusinessUploadSessionService {
  private validationSessions = new Map<string, ValidationSession>();

  createSession(
    rows: BusinessExcelRow[],
    businessNumberMap: Map<string, BusinessInfo>,
    validationResult: ValidationResult,
  ): string {
    const sessionId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // nextCodeNumber 계산 (기존 데이터에서)
    const existingBusinesses = Array.from(businessNumberMap.values());
    const latestBusinessCode =
      existingBusinesses.length > 0
        ? existingBusinesses[existingBusinesses.length - 1].businessCode
        : null;

    const nextCodeNumber = BusinessUtils.getNextCodeNumber(latestBusinessCode);

    this.validationSessions.set(sessionId, {
      id: sessionId,
      data: { rows, businessNumberMap, nextCodeNumber },
      validationResult,
      createdAt: new Date(),
    });

    return sessionId;
  }

  getSession(sessionId: string): ValidationSession | undefined {
    return this.validationSessions.get(sessionId);
  }

  deleteSession(sessionId: string): void {
    this.validationSessions.delete(sessionId);
  }

  // 세션 정리 (오래된 세션 삭제)
  cleanupOldSessions(maxAgeHours: number = 24): void {
    const now = new Date();
    const maxAge = maxAgeHours * 60 * 60 * 1000; // 시간을 밀리초로 변환

    for (const [sessionId, session] of this.validationSessions.entries()) {
      if (now.getTime() - session.createdAt.getTime() > maxAge) {
        this.validationSessions.delete(sessionId);
      }
    }
  }
}
