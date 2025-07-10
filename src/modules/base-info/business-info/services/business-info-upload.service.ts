import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInfo } from '../entities/business-info.entity';
import { CreateBusinessInfoDto } from '../dto/create-business-info.dto';
import { BusinessUtils } from '../utils/business.utils';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

interface BusinessExcelRow {
  사업자등록번호: string;
  사업장명: string;
  대표자명?: string;
  법인번호?: string;
  업태?: string;
  종목?: string;
  전화번호?: string;
  휴대전화?: string;
  FAX?: string;
  우편번호?: string;
  주소?: string;
  상세주소?: string;
  '대표자 이메일'?: string;
}

interface ProcessingResult {
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

interface ProcessedData {
  toCreate: BusinessInfo[];
  toUpdate: BusinessInfo[];
  errors: Array<{
    row: number;
    businessNumber?: string;
    businessName?: string;
    error: string;
    details?: string;
  }>;
  successCount: number;
  failCount: number;
}

@Injectable()
export class BusinessUploadService {
  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessRepository: Repository<BusinessInfo>,
  ) {}

  async processExcel(
    fileBuffer: Buffer,
    mode: 'add' | 'overwrite' = 'add',
  ): Promise<ProcessingResult> {
    const rows = this.parseExcelFile(fileBuffer);
    const { businessNumberMap, nextCodeNumber } = await this.loadExistingData();
    
    const processedData = await this.processRows(rows, businessNumberMap, nextCodeNumber, mode);
    await this.saveData(processedData);

    return this.createResponse(processedData, rows.length);
  }

  private parseExcelFile(fileBuffer: Buffer): BusinessExcelRow[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<BusinessExcelRow>(sheet);
  }

  private async loadExistingData(): Promise<{
    businessNumberMap: Map<string, BusinessInfo>;
    nextCodeNumber: number;
  }> {
    const existingBusinesses = await this.businessRepository.find({
      order: { businessCode: 'ASC' },
    });

    const businessNumberMap = new Map<string, BusinessInfo>();
    existingBusinesses.forEach(business => {
      businessNumberMap.set(business.businessNumber, business);
    });

    const latestBusinessCode = existingBusinesses.length > 0
      ? existingBusinesses[existingBusinesses.length - 1].businessCode
      : null;
    const nextCodeNumber = BusinessUtils.getNextCodeNumber(latestBusinessCode);

    return { businessNumberMap, nextCodeNumber };
  }

  private async processRows(
    rows: BusinessExcelRow[],
    businessNumberMap: Map<string, BusinessInfo>,
    nextCodeNumber: number,
    mode: 'add' | 'overwrite',
  ): Promise<ProcessedData> {
    const toCreate: BusinessInfo[] = [];
    const toUpdate: BusinessInfo[] = [];
    const errors: Array<{
      row: number;
      businessNumber?: string;
      businessName?: string;
      error: string;
      details?: string;
    }> = [];

    let successCount = 0;
    let failCount = 0;
    let currentCodeNumber = nextCodeNumber;

    for (let i = 0; i < rows.length; i++) {
      try {
        const result = await this.processRow(rows[i], businessNumberMap, currentCodeNumber, mode);
        
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



  private async processRow(
    row: BusinessExcelRow,
    businessNumberMap: Map<string, BusinessInfo>,
    codeNumber: number,
    mode: 'add' | 'overwrite',
  ): Promise<{ type: 'create' | 'update'; data: BusinessInfo }> {
    const dto = await this.createDtoFromRow(row);
    const existing = businessNumberMap.get(dto.businessNumber);

    if (existing) {
      if (mode === 'add') {
        throw new BadRequestException(
          `사업자등록번호 ${dto.businessNumber}는 이미 존재합니다.`,
        );
      }
      this.businessRepository.merge(existing, dto);
      return { type: 'update', data: existing };
    } else {
      const businessCode = BusinessUtils.generateBusinessCode(codeNumber);
      const newBusiness = this.businessRepository.create({
        businessCode,
        ...dto,
      });
      return { type: 'create', data: newBusiness };
    }
  }



  private async createDtoFromRow(row: BusinessExcelRow): Promise<CreateBusinessInfoDto> {
    const businessNumber = this.cleanBusinessNumber(row['사업자등록번호'] || '');
    const businessName = String(row['사업장명'] ?? '').trim();
    const businessCeo = String(row['대표자명'] ?? '').trim();

    this.validateRequiredFields(businessNumber, businessName, businessCeo);

    const dto = plainToInstance(CreateBusinessInfoDto, {
      businessNumber,
      businessName,
      businessCeo,
      corporateRegistrationNumber: this.cleanBusinessNumber(row['법인번호'] || '') || undefined,
      businessType: String(row['업태'] ?? '').trim() || undefined,
      businessItem: String(row['종목'] ?? '').trim() || undefined,
      businessTel: this.cleanPhoneNumber(row['전화번호'] || '') || undefined,
      businessMobile: this.cleanPhoneNumber(row['휴대전화'] || '') || undefined,
      businessFax: this.cleanPhoneNumber(row['FAX'] || '') || undefined,
      businessZipcode: String(row['우편번호'] ?? '').trim() || undefined,
      businessAddress: String(row['주소'] ?? '').trim() || undefined,
      businessAddressDetail: String(row['상세주소'] ?? '').trim() || undefined,
      businessCeoEmail: String(row['대표자 이메일'] ?? '').trim() || undefined,
    });

    await this.validateDto(dto);
    return dto;
  }

  private validateRequiredFields(businessNumber: string, businessName: string, businessCeo: string): void {
    if (!businessNumber) throw new BadRequestException('사업자등록번호가 누락되었습니다.');
    if (!businessName) throw new BadRequestException('사업장명이 누락되었습니다.');
    if (!businessCeo) throw new BadRequestException('대표자명이 누락되었습니다.');
  }

  private async validateDto(dto: CreateBusinessInfoDto): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(e => Object.values(e.constraints || {}).join(', '))
        .join(' / ');
      throw new BadRequestException(`유효성 검사 실패: ${errorMessages}`);
    }
  }

  private createErrorInfo(error: unknown, row: BusinessExcelRow, rowNumber: number) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = error instanceof Error ? error.stack : undefined;

    return {
      row: rowNumber,
      businessNumber: row['사업자등록번호'] || undefined,
      businessName: row['사업장명'] || undefined,
      error: errorMessage,
      details: errorDetails,
    };
  }

  private async saveData(processedData: ProcessedData): Promise<void> {
    try {
      if (processedData.toCreate.length > 0) {
        await this.businessRepository.save(processedData.toCreate);
      }
      if (processedData.toUpdate.length > 0) {
        await this.businessRepository.save(processedData.toUpdate);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`데이터 저장 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }

  private createResponse(processedData: ProcessedData, totalCount: number): ProcessingResult {
    return {
      message: '업로드가 완료되었습니다.',
      result: {
        successCount: processedData.successCount,
        failCount: processedData.failCount,
        totalCount,
        errors: processedData.errors,
        summary: {
          created: processedData.toCreate.length,
          updated: processedData.toUpdate.length,
          skipped: 0,
        },
      },
    };
  }

  private cleanBusinessNumber(value: string): string {
    if (!value) return '';
    return String(value).replace(/[^\d]/g, '');
  }

  private cleanPhoneNumber(value: string): string {
    if (!value) return '';
    return String(value).replace(/[^\d]/g, '');
  }
}
