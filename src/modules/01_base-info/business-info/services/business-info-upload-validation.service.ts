import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { BusinessInfo } from '../entities/business-info.entity';

export interface BusinessExcelRow {
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

export interface ValidationResult {
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

@Injectable()
export class BusinessUploadValidationService {
  parseExcelFile(fileBuffer: Buffer): BusinessExcelRow[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<BusinessExcelRow>(sheet);
  }

  validateRows(
    rows: BusinessExcelRow[],
    businessNumberMap: Map<string, BusinessInfo>,
  ): ValidationResult {
    const duplicates: Array<{
      row: number;
      businessNumber: string;
      businessName: string;
      existingBusinessName: string;
    }> = [];

    const errors: Array<{
      row: number;
      businessNumber?: string;
      businessName?: string;
      error: string;
    }> = [];

    const toCreate: Array<{
      businessNumber: string;
      businessName: string;
      businessCeo: string;
    }> = [];

    const toUpdate: Array<{
      businessNumber: string;
      businessName: string;
      businessCeo: string;
      existingBusinessName: string;
    }> = [];

    let duplicateCount = 0;
    let newCount = 0;
    let errorCount = 0;
    let hasDuplicates = false;
    let hasErrors = false;

    for (let i = 0; i < rows.length; i++) {
      try {
        const businessNumber = this.cleanBusinessNumber(rows[i]['사업자등록번호'] || '');
        const businessName = String(rows[i]['사업장명'] ?? '').trim();
        const businessCeo = String(rows[i]['대표자명'] ?? '').trim();

        // 필수 필드 검증
        if (!businessNumber) {
          errors.push({
            row: i + 1,
            businessNumber: rows[i]['사업자등록번호'] || undefined,
            businessName,
            error: '사업자등록번호가 누락되었습니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }
        if (!businessName) {
          errors.push({
            row: i + 1,
            businessNumber,
            businessName,
            error: '사업장명이 누락되었습니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }
        if (!businessCeo) {
          errors.push({
            row: i + 1,
            businessNumber,
            businessName,
            error: '대표자명이 누락되었습니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        // 중복 체크
        const existing = businessNumberMap.get(businessNumber);
        if (existing) {
          duplicateCount++;
          duplicates.push({
            row: i + 1,
            businessNumber,
            businessName,
            existingBusinessName: existing.businessName,
          });
          toUpdate.push({
            businessNumber,
            businessName,
            businessCeo,
            existingBusinessName: existing.businessName,
          });
          hasDuplicates = true;
        } else {
          newCount++;
          toCreate.push({
            businessNumber,
            businessName,
            businessCeo,
          });
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          row: i + 1,
          businessNumber: rows[i]['사업자등록번호'] || undefined,
          businessName: rows[i]['사업장명'] || undefined,
          error: errorMessage,
        });
        hasErrors = true;
      }
    }

    return {
      message: '검증이 완료되었습니다.',
      result: {
        totalCount: rows.length,
        duplicateCount,
        newCount,
        errorCount,
        hasDuplicates,
        hasErrors,
        duplicates,
        errors,
        preview: {
          toCreate,
          toUpdate,
        },
      },
    };
  }

  private cleanBusinessNumber(value: string): string {
    if (!value) return '';
    return String(value).replace(/[^\d]/g, '');
  }
}
