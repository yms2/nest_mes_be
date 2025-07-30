import { Injectable } from '@nestjs/common';
import { BusinessInfo } from '../../entities/business-info.entity';
import * as XLSX from 'xlsx';

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  validData: Partial<BusinessInfo>[];
  totalRows: number;
}

@Injectable()
export class BusinessUploadValidationService {
  /**
   * Excel 파일 검증
   */
  async validateExcelFile(fileBuffer: Buffer): Promise<ValidationResult> {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1) as any[][];
      const headerMapping = this.createHeaderMapping(headers);

      const validationResult = this.validateAndTransformData(dataRows, headerMapping);

      return {
        isValid: validationResult.errors.length === 0,
        errors: validationResult.errors,
        validData: validationResult.validData,
        totalRows: dataRows.length,
      };
    } catch (error) {
      console.error('Excel 검증 오류:', error);
      throw new Error('Excel 파일 검증 중 오류가 발생했습니다.');
    }
  }

  /**
   * 헤더 매핑 생성
   */
  private createHeaderMapping(headers: string[]): Record<string, number> {
    const mapping: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      const normalizedHeader = header?.toString().trim().toLowerCase();
      
      switch (normalizedHeader) {
        case '사업자번호':
        case '사업자등록번호':
        case 'business_number':
          mapping.businessNumber = index;
          break;
        case '사업장명':
        case 'business_name':
          mapping.businessName = index;
          break;
        case '대표자':
        case 'ceo':
        case 'business_ceo':
          mapping.businessCeo = index;
          break;
        case '법인번호':
        case 'corporate_registration_number':
          mapping.corporateRegistrationNumber = index;
          break;
        case '업태':
        case 'business_type':
          mapping.businessType = index;
          break;
        case '종목':
        case 'business_item':
          mapping.businessItem = index;
          break;
        case '전화번호':
        case 'business_tel':
          mapping.businessTel = index;
          break;
        case '휴대전화':
        case 'mobile':
        case 'business_mobile':
          mapping.businessMobile = index;
          break;
        case 'fax':
        case 'business_fax':
          mapping.businessFax = index;
          break;
        case '우편번호':
        case 'zipcode':
        case 'business_zipcode':
          mapping.businessZipcode = index;
          break;
        case '주소':
        case 'address':
        case 'business_address':
          mapping.businessAddress = index;
          break;
        case '상세주소':
        case 'address_detail':
        case 'business_address_detail':
          mapping.businessAddressDetail = index;
          break;
        case '이메일':
        case 'email':
        case 'business_ceo_email':
          mapping.businessCeoEmail = index;
          break;
      }
    });

    return mapping;
  }

  /**
   * 데이터 검증 및 변환
   */
  private validateAndTransformData(
    dataRows: any[][],
    headerMapping: Record<string, number>,
  ): {
    validData: Partial<BusinessInfo>[];
    errors: Array<{ row: number; field: string; message: string; data: any }>;
  } {
    const validData: Partial<BusinessInfo>[] = [];
    const errors: Array<{ row: number; field: string; message: string; data: any }> = [];

    dataRows.forEach((row, rowIndex) => {
      try {
        const businessData: Partial<BusinessInfo> = {};

        // 사업자번호 (필수)
        const businessNumber = row[headerMapping.businessNumber]?.toString().trim();
        if (!businessNumber) {
          errors.push({
            row: rowIndex + 2,
            field: '사업자번호',
            message: '사업자번호는 필수입니다.',
            data: row,
          });
          return;
        }

        if (!/^\d{10}$/.test(businessNumber)) {
          errors.push({
            row: rowIndex + 2,
            field: '사업자번호',
            message: '사업자번호는 10자리 숫자여야 합니다.',
            data: row,
          });
          return;
        }
        businessData.businessNumber = businessNumber;

        // 사업장명 (필수)
        const businessName = row[headerMapping.businessName]?.toString().trim();
        if (!businessName) {
          errors.push({
            row: rowIndex + 2,
            field: '사업장명',
            message: '사업장명은 필수입니다.',
            data: row,
          });
          return;
        }
        businessData.businessName = businessName;

        // 대표자 (필수)
        const businessCeo = row[headerMapping.businessCeo]?.toString().trim();
        if (!businessCeo) {
          errors.push({
            row: rowIndex + 2,
            field: '대표자',
            message: '대표자는 필수입니다.',
            data: row,
          });
          return;
        }
        businessData.businessCeo = businessCeo;

        // 선택적 필드들 검증
        this.validateOptionalFields(row, headerMapping, businessData);

        validData.push(businessData);
      } catch (error) {
        errors.push({
          row: rowIndex + 2,
          field: '일반',
          message: '데이터 처리 중 오류가 발생했습니다.',
          data: row,
        });
      }
    });

    return { validData, errors };
  }

  /**
   * 선택적 필드 검증
   */
  private validateOptionalFields(
    row: any[],
    headerMapping: Record<string, number>,
    businessData: Partial<BusinessInfo>,
  ): void {
    if (headerMapping.corporateRegistrationNumber !== undefined) {
      const corpNumber = row[headerMapping.corporateRegistrationNumber]?.toString().trim();
      if (corpNumber && /^\d{10}$/.test(corpNumber)) {
        businessData.corporateRegistrationNumber = corpNumber;
      }
    }

    if (headerMapping.businessType !== undefined) {
      const businessType = row[headerMapping.businessType]?.toString().trim();
      if (businessType) {
        businessData.businessType = businessType;
      }
    }

    if (headerMapping.businessItem !== undefined) {
      const businessItem = row[headerMapping.businessItem]?.toString().trim();
      if (businessItem) {
        businessData.businessItem = businessItem;
      }
    }

    if (headerMapping.businessTel !== undefined) {
      const businessTel = row[headerMapping.businessTel]?.toString().trim();
      if (businessTel && /^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/.test(businessTel)) {
        businessData.businessTel = businessTel;
      }
    }

    if (headerMapping.businessMobile !== undefined) {
      const businessMobile = row[headerMapping.businessMobile]?.toString().trim();
      if (businessMobile && /^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/.test(businessMobile)) {
        businessData.businessMobile = businessMobile;
      }
    }

    if (headerMapping.businessFax !== undefined) {
      const businessFax = row[headerMapping.businessFax]?.toString().trim();
      if (businessFax && /^(\d{10,11}|\d{2,3}-\d{3,4}-\d{4})$/.test(businessFax)) {
        businessData.businessFax = businessFax;
      }
    }

    if (headerMapping.businessZipcode !== undefined) {
      const businessZipcode = row[headerMapping.businessZipcode]?.toString().trim();
      if (businessZipcode && /^\d{5}$/.test(businessZipcode)) {
        businessData.businessZipcode = businessZipcode;
      }
    }

    if (headerMapping.businessAddress !== undefined) {
      const businessAddress = row[headerMapping.businessAddress]?.toString().trim();
      if (businessAddress) {
        businessData.businessAddress = businessAddress;
      }
    }

    if (headerMapping.businessAddressDetail !== undefined) {
      const businessAddressDetail = row[headerMapping.businessAddressDetail]?.toString().trim();
      if (businessAddressDetail) {
        businessData.businessAddressDetail = businessAddressDetail;
      }
    }

    if (headerMapping.businessCeoEmail !== undefined) {
      const businessCeoEmail = row[headerMapping.businessCeoEmail]?.toString().trim();
      if (businessCeoEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessCeoEmail)) {
        businessData.businessCeoEmail = businessCeoEmail;
      }
    }
  }
} 