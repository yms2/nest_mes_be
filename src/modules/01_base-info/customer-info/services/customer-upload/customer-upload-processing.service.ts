import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInfo } from '../../entities/customer-info.entity';
import { CreateCustomerInfoDto } from '../../dto/customer-info-create.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CustomerExcelRow } from './customer-upload-validation.service';
import { CustomerUtils } from '../../utils/customer.utils';

// 처리된 데이터 타입
export interface ProcessedData {
    toCreate: CustomerInfo[];
    toUpdate: CustomerInfo[];
    errors: Array<{
        row: number;
        customerNumber?: string;
        customerName?: string;
        error: string;
        details?: string;
    }>;
    successCount: number;
    failCount: number;
}

// 처리 결과 타입
export interface ProcessingResult {
    message: string;
    result: {
        successCount: number;
        failCount: number;
        totalCount: number;
        errors: Array<{
            row: number;
            customerNumber?: string;
            customerName?: string;
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

// 처리 서비스
@Injectable()
export class CustomerUploadProcessingService {
    constructor(
        @InjectRepository(CustomerInfo)
        private readonly customerInfoRepository: Repository<CustomerInfo>,
    ) {}
 
    async loadExistingData(): Promise<{
        customerNumberMap: Map<string, CustomerInfo>;
        nextCodeNumber: number;
    }> {
        const existingCustomers = await this.customerInfoRepository.find({
            order: { customerCode: 'ASC' },
        });

        const customerNumberMap = new Map<string, CustomerInfo>();
        existingCustomers.forEach(customer => {
            customerNumberMap.set(customer.customerNumber, customer);
        })

        const latestCustomerCode =
            existingCustomers.length > 0
                ? existingCustomers[existingCustomers.length - 1].customerCode
                : null;
        const nextCodeNumber = CustomerUtils.getNextCodeNumber(latestCustomerCode);

        return { customerNumberMap, nextCodeNumber };
    }

    async processRows(
        rows: CustomerExcelRow[],
        customerNumberMap: Map<string, CustomerInfo>,
        nextCodeNumber: number,
        mode: 'add' | 'overwrite',
        userId: string, // 현재 로그인한 사용자 ID
    ): Promise<ProcessedData> {
        const toCreate: CustomerInfo[] = [];
        const toUpdate: CustomerInfo[] = [];
        const errors: Array<{
            row: number;
            customerNumber?: string;
            customerName?: string;
            error: string;
            details?: string;
        }> = [];

        let successCount = 0;
        let failCount = 0;
        let currentCodeNumber = nextCodeNumber;

        for (let i = 0; i < rows.length; i++) {
            try {
                const result = await this.processRow(rows[i], customerNumberMap, currentCodeNumber, mode, userId);

                if (result.type === 'create') {
                    toCreate.push(result.data);
                    currentCodeNumber++;
                } else if (result.type === 'update') {
                    toUpdate.push(result.data);
                }

                successCount++;
            } catch (error) {
                failCount++;
                errors.push(this.createErrorInfo(error, rows[i], i + 1));
            }
        }

        return { toCreate, toUpdate, errors, successCount, failCount };
    }

    async saveData(processedData: ProcessedData): Promise<void> {
        try {
            if (processedData.toCreate.length > 0) {
                await this.customerInfoRepository.save(processedData.toCreate);
            }
            if (processedData.toUpdate.length > 0) {
                await this.customerInfoRepository.save(processedData.toUpdate);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new BadRequestException(`데이터 저장 중 오류가 발생했습니다: ${errorMessage}`);
        }
    }

    createResponse(processedData: ProcessedData, totalCount: number): ProcessingResult {
        return {
            message: '업로드가 완료되었습니다.',
            result:{
                successCount: processedData.successCount,
                failCount: processedData.failCount,
                totalCount: totalCount,
                errors: processedData.errors,
                summary: {
                    created: processedData.toCreate.length,
                    updated: processedData.toUpdate.length,
                    skipped: 0,
                }
            }
        }
    }

    // 행 처리
    private async processRow(
        row: CustomerExcelRow,
        customerNumberMap: Map<string, CustomerInfo>,
        codeNumber: number,
        mode: 'add' | 'overwrite',
        userId: string, // 현재 로그인한 사용자 ID
    ): Promise<{ type: 'create' | 'update'; data: CustomerInfo }> {
        const dto = await this.createDtoFromRow(row);
        const existing = customerNumberMap.get(dto.customerNumber);

        if (existing) {
            if (mode === 'add') {
                throw new BadRequestException(`고객번호 ${dto.customerNumber}는 이미 존재합니다.`);
            }
            this.customerInfoRepository.merge(existing, {
                ...dto,
                updatedBy: userId, // 현재 로그인한 사용자 ID
            });
            return { type: 'update', data: existing };
        } else {
            const customerCode = CustomerUtils.generateCustomerCode(codeNumber);
            const newCustomer = this.customerInfoRepository.create({
                customerCode,
                ...dto,
                createdBy: userId, // 현재 로그인한 사용자 ID
            });
            return { type: 'create', data: newCustomer };
        }
    }

    // 행 데이터 생성
    private async createDtoFromRow(row: CustomerExcelRow): Promise<CreateCustomerInfoDto> {
        const customerNumber = this.cleanCustomerNumber(row['사업자등록번호'] || '');
        const customerName = String(row['거래처명'] ?? '').trim();
        const customerCeo = String(row['대표자명'] ?? '').trim();
        
        this.validateRequiredFields(customerNumber, customerName, customerCeo);

        const dto = plainToInstance(CreateCustomerInfoDto, {
            customerNumber,
            customerName,
            customerCeo,
            corporateRegistrationNumber: this.cleanCustomerNumber(row['법인번호'] || '') || undefined,
            customerType: String(row['거래구분'] ?? '').trim() || undefined,
            customerBusinessType: String(row['업태'] ?? '').trim() || undefined,
            customerBusinessItem: String(row['종목'] ?? '').trim() || undefined,
            customerTel: this.cleanPhoneNumber(row['전화번호'] || '') || undefined,
            customerMobile: this.cleanPhoneNumber(row['휴대전화'] || '') || undefined,
            customerFax: this.cleanPhoneNumber(row['FAX'] || '') || undefined,
            customerEmail: String(row['대표자 이메일'] ?? '').trim() || undefined,
            customerInvoiceEmail: String(row['계산서 이메일'] ?? '').trim() || undefined,
            customerZipcode: String(row['우편번호'] ?? '').trim() || undefined,
            customerAddress: String(row['주소'] ?? '').trim() || undefined,
            customerAddressDetail: String(row['상세주소'] ?? '').trim() || undefined,
        });

        await this.validateDto(dto);
        return dto;
    }

    // 필수 필드 검증
    private validateRequiredFields(
        customerNumber: string,
        customerName: string,
        customerCeo: string,
    ): void {
        if (!customerNumber) throw new BadRequestException('고객번호가 누락되었습니다.');
        if (!customerName) throw new BadRequestException('거래처명이 누락되었습니다.');
        if (!customerCeo) throw new BadRequestException('대표자명이 누락되었습니다.');
    }

    // 데이터 유효성 검증
    private async validateDto(dto: CreateCustomerInfoDto): Promise<void> {
        const errors = await validate(dto);
        if (errors.length > 0) {
            const errorMessages = errors
                .map(e => Object.values(e.constraints || {}).join(', '))
                .join(' / ');
            throw new BadRequestException(`유효성 검사 실패: ${errorMessages}`);
        }
    }

    // 에러 정보 생성
    private createErrorInfo(error: unknown, row: CustomerExcelRow, rowNumber: number) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorDetails = error instanceof Error ? error.stack : undefined;
        return {
            row: rowNumber,
            customerNumber: row['사업자등록번호'] || undefined,
            customerName: row['거래처명'] || undefined,
            error: errorMessage,
            details: errorDetails,
        };
    }

    // 거래처번호 정리
    private cleanCustomerNumber(value: string): string {
        if (!value) return '';
        return String(value).replace(/[^\d]/g, '');
    }

    // 전화번호 정리
    private cleanPhoneNumber(value: string): string {
        if (!value) return '';
        return String(value).replace(/[^\d]/g, '');
    }
}