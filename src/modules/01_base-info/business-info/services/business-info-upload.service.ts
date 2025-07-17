import { Injectable, BadRequestException } from '@nestjs/common';
import { BusinessUploadValidationService } from './business-info-upload-validation.service';
import { BusinessUploadProcessingService } from './business-info-upload-processing.service';
import { BusinessUploadSessionService } from './business-info-upload-session.service';
import { ProcessingResult } from './business-info-upload-processing.service';
import { ValidationResult } from './business-info-upload-validation.service';

@Injectable()
export class BusinessUploadService {
  constructor(
    private readonly validationService: BusinessUploadValidationService,
    private readonly processingService: BusinessUploadProcessingService,
    private readonly sessionService: BusinessUploadSessionService,
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
    const sessionId = this.sessionService.createSession(rows, businessNumberMap, validationResult);

    return {
      ...validationResult,
      sessionId,
    };
  }

  async processValidatedData(
    sessionId: string,
    mode: 'add' | 'overwrite',
  ): Promise<ProcessingResult> {
    const session = this.sessionService.getSession(sessionId);
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

    this.sessionService.deleteSession(sessionId);

    return this.processingService.createResponse(processedData, rows.length);
  }
}
