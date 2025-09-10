import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { CustomerInfo } from '../../entities/customer-info.entity';

export interface CustomerExcelRow {
    거래처명: string;
    사업자등록번호: string;
    대표자명: string;
    법인번호?: string;
    거래구분?: string;
    업태?: string;
    종목?: string;
    전화번호?: string;
    휴대전화?: string;
    FAX?: string;
    '대표자 이메일'?: string;
    '계산서 이메일'?: string;
    우편번호?: string;
    주소?: string;
    상세주소?: string;
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
      customerName: string;
      customerNumber: string;
      existingCustomerName: string;
    }>;
    errors: Array<{
      row: number;
      customerName?: string;
      customerNumber?: string;
      error: string;
    }>;
    preview: {
      toCreate: Array<{
        customerName: string;
        customerNumber: string;
        customerCeo: string;
      }>;
      toUpdate: Array<{
        customerName: string;
        customerNumber: string;
        customerCeo: string;
        existingCustomerName: string;
      }>;
    };
  };
}

@Injectable()
export class CustomerUploadValidationService {
    parseExcelFile(fileBuffer: Buffer): CustomerExcelRow[] {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json<CustomerExcelRow>(sheet);
    }

    validateRows(
        rows: CustomerExcelRow[],
        customerNumberMap: Map<string, CustomerInfo>,
    ): ValidationResult {
        const duplicates: Array<{
            row: number;
            customerName: string;
            customerNumber: string;
            existingCustomerName: string;
        }> = [];

        const errors: Array<{
            row: number;
            customerName?: string;
            customerNumber?: string;
            error: string;
        }> = [];

        const toCreate: Array<{
            customerName: string;
            customerNumber: string;
            customerCeo: string;
        }> = [];

        const toUpdate: Array<{
            customerName: string;
            customerNumber: string;
            customerCeo: string;
            existingCustomerName: string;
        }> = [];

        let duplicateCount = 0;
        let newCount = 0;
        let errorCount = 0;
        let hasDuplicates = false;
        let hasErrors = false;
        
        for (let i = 0; i < rows.length; i++) {
            try {
                const customerNumber = this.cleanCustomerNumber(rows[i]['사업자등록번호'] || '');
                const customerName = String(rows[i]['거래처명'] ?? '').trim();
                const customerCeo = String(rows[i]['대표자명'] ?? '').trim();

                // 필수 필드 검증
                if (!customerNumber) {
                    errors.push({
                        row: i + 1,
                        customerNumber: rows[i]['사업자등록번호'] || undefined,
                        customerName,
                        error: '사업자등록번호가 누락되었습니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }

                if (!customerName) {
                    errors.push({
                        row: i + 1,
                        customerNumber,
                        customerName,
                        error: '거래처명이 누락되었습니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }
                if (!customerCeo) {
                    errors.push({
                        row: i + 1,
                        customerNumber,
                        customerName,
                        error: '대표자명이 누락되었습니다.',
                    });
                    errorCount++;
                    hasErrors = true;
                    continue;
                }

                // 중복 체크
                const existing = customerNumberMap.get(customerNumber);
                if (existing) {
                    duplicateCount++;
                    duplicates.push({
                        row: i + 1,
                        customerName,
                        customerNumber,
                        existingCustomerName: existing.customerName,
                    });
                    toUpdate.push({
                        customerName,
                        customerNumber,
                        customerCeo,
                        existingCustomerName: existing.customerName,
                    });
                } else {
                    newCount++;
                    toCreate.push({
                        customerName,
                        customerNumber,
                        customerCeo,
                    });
                }
            } catch (error) {
                errorCount++;
                const errorMessage = error instanceof Error ? error.message : String(error);
                errors.push({
                    row: i + 1,
                    customerNumber: rows[i]['사업자등록번호'] || undefined,
                    customerName: rows[i]['거래처명'] || undefined,
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

    private cleanCustomerNumber(value: string): string {
        if (!value) return '';
        return String(value).replace(/[^\d]/g, '');
    }
}
