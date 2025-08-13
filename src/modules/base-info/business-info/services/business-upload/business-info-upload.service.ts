import { Injectable, BadRequestException } from '@nestjs/common';
import { BusinessUploadValidationService } from './business-info-upload-validation.service';
import { BusinessUploadProcessingService } from './business-info-upload-processing.service';
import { ProcessingResult } from './business-info-upload-processing.service';
import { ValidationResult, BusinessExcelRow } from './business-info-upload-validation.service';
import { BusinessInfo } from '../../entities/business-info.entity';
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
export class BusinessUploadService {
  private validationSessions = new Map<string, ValidationSession>();

  constructor(
    private readonly validationService: BusinessUploadValidationService,
    private readonly processingService: BusinessUploadProcessingService,
  ) {}

  async processExcel(
    fileBuffer: Buffer,
    mode: 'add' | 'overwrite' = 'add',
  ): Promise<ProcessingResult> {
    const rows = this.validationService.parseExcelFile(fileBuffer);
    const { businessNumberMap, nextCodeNumber } = await this.processingService.loadExistingData();

    const processedData = await this.processingService.processRows(
      rows,
      businessNumberMap,
      nextCodeNumber,
      mode,
    );
    await this.processingService.saveData(processedData);

    return this.processingService.createResponse(processedData, rows.length);
  }

  async validateExcel(fileBuffer: Buffer): Promise<ValidationResult & { sessionId: string }> {
    const rows = this.validationService.parseExcelFile(fileBuffer);
    const { businessNumberMap } = await this.processingService.loadExistingData();

    const validationResult = this.validationService.validateRows(rows, businessNumberMap);
    const sessionId = this.createSession(rows, businessNumberMap, validationResult);

    return {
      ...validationResult,
      sessionId,
    };
  }

  async processValidatedData(
    sessionId: string,
    mode: 'add' | 'overwrite',
  ): Promise<ProcessingResult> {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new BadRequestException('유효하지 않은 검증 세션입니다.');
    }

    const { rows, businessNumberMap, nextCodeNumber } = session.data;

    const processedData = await this.processingService.processRows(
      rows,
      businessNumberMap,
      nextCodeNumber,
      mode,
    );
    await this.processingService.saveData(processedData);

    this.deleteSession(sessionId);

    return this.processingService.createResponse(processedData, rows.length);
  }

  // 세션 관리 메서드들
  private createSession(
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

  private getSession(sessionId: string): ValidationSession | undefined {
    return this.validationSessions.get(sessionId);
  }

  private deleteSession(sessionId: string): void {
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
