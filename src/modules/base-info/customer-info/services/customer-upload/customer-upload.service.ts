import { Injectable, BadRequestException } from '@nestjs/common';
import { CustomerUploadValidationService } from './customer-upload-validation.service';
import { CustomerUploadProcessingService } from './customer-upload-processing.service';
import { ProcessingResult } from './customer-upload-processing.service';
import { ValidationResult, CustomerExcelRow } from './customer-upload-validation.service';
import { CustomerInfo } from '../../entities/customer-info.entity';
import { CustomerUtils } from '../../utils/customer.utils';

interface ValidationSession {
    id: string;
    data: {
        rows: CustomerExcelRow[];
        customerNumberMap: Map<string, CustomerInfo>;
        nextCodeNumber: number;
    };
    validationResult: ValidationResult;
    createdBy: string;
    createdAt: Date;
}

// 서비스
@Injectable()
export class CustomerUploadService {
    private validationSessions = new Map<string, ValidationSession>();

    constructor(
        private readonly validationService: CustomerUploadValidationService,
        private readonly processingService: CustomerUploadProcessingService,
    ) {}

    // 거래처 엑셀 처리
    async processExcel(
        fileBuffer: Buffer,
        mode: 'add' | 'overwrite' = 'add',
        userId: string = 'system', // 현재 로그인한 사용자 ID (기본값: system)
    ): Promise<ProcessingResult> {
        const rows = this.validationService.parseExcelFile(fileBuffer);
        const { customerNumberMap, nextCodeNumber } = await this.processingService.loadExistingData();

        const processedData = await this.processingService.processRows(
            rows,
            customerNumberMap,
            nextCodeNumber,
            mode,
            userId,
        );
        await this.processingService.saveData(processedData);
        return this.processingService.createResponse(processedData, rows.length);
    }

    // 거래처 엑셀 검증
    async validateExcel(fileBuffer: Buffer): Promise<ValidationResult & { sessionId: string }> {
        const rows = this.validationService.parseExcelFile(fileBuffer);
        const { customerNumberMap } = await this.processingService.loadExistingData();
        const validationResult = this.validationService.validateRows(rows, customerNumberMap);
        const sessionId = this.createSession(rows, customerNumberMap, validationResult);
        return { ...validationResult, sessionId };
    }

    // 검증된 데이터 저장
    async processValidatedData(
        sessionId: string,
        mode: 'add' | 'overwrite',
        createBy: string = 'system', // 현재 로그인한 사용자 ID (기본값: system)
    ): Promise<ProcessingResult> {
        const session = this.getSession(sessionId);
        if (!session) {
            throw new BadRequestException('유효하지 않은 세션입니다.');
        }

        const { rows, customerNumberMap, nextCodeNumber } = session.data;

        const processedData = await this.processingService.processRows(
            rows,
            customerNumberMap,
            nextCodeNumber,
            mode,
            createBy,
        );
        await this.processingService.saveData(processedData);

        this.deleteSession(sessionId);

        return this.processingService.createResponse(processedData, rows.length);
    }

    // 세션 생성
    private createSession(
        rows: CustomerExcelRow[],
        customerNumberMap: Map<string, CustomerInfo>,
        validationResult: ValidationResult,
        createBy: string = 'system', // 현재 로그인한 사용자 ID (기본값: system)
    ): string {
        const sessionId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const existingCustomers = Array.from(customerNumberMap.values());
        const latestCustomerCode =
            existingCustomers.length > 0
                ? existingCustomers[existingCustomers.length - 1].customerCode
                : null;
        const nextCodeNumber = CustomerUtils.getNextCodeNumber(latestCustomerCode);

        this.validationSessions.set(sessionId, {
            id: sessionId,
            data: { rows, customerNumberMap, nextCodeNumber },
            validationResult,
            createdBy: createBy,
            createdAt: new Date(),
        });

        return sessionId;
    }

    // 세션 조회
    private getSession(sessionId: string): ValidationSession | undefined {
        return this.validationSessions.get(sessionId);
    }

    // 세션 삭제
    private deleteSession(sessionId: string): void {
        this.validationSessions.delete(sessionId);
    }

    // 오래된 세션 정리
    cleanupOldSessions(maxAgeHours: number = 24): void {
        const now = new Date();
        const maxAge = maxAgeHours * 60 * 60 * 1000;

        for (const [sessionId, session] of this.validationSessions.entries()) {
            if (now.getTime() - session.createdAt.getTime() > maxAge) {
                this.validationSessions.delete(sessionId);
            }
        }
    }
}