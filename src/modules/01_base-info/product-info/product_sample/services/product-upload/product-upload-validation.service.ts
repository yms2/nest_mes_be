import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ProductInfo } from '../../entities/product-info.entity';

export interface ProductExcelRow {
  품목명: string;
  품목구분: string;
  분류: string;
  규격1?: string;
  규격2?: string;
  거래처코드?: string;
  발주단위?: string;
  재고단위?: string;
  수량당수량?: string;
  안전재고?: string;
  매입세금구분?: string;
  매입단가?: string;
  매출세금구분?: string;
  매출단가?: string;
  홈페이지?: string;
  비고?: string;
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
      productName: string;
      productType: string;
      existingProductName: string;
    }>;
    errors: Array<{
      row: number;
      productName?: string;
      productType?: string;
      error: string;
    }>;
    preview: {
      toCreate: Array<{
        productName: string;
        productType: string;
        productCategory: string;
      }>;
      toUpdate: Array<{
        productName: string;
        productType: string;
        productCategory: string;
        existingProductName: string;
      }>;
    };
  };
}

@Injectable()
export class ProductUploadValidationService {
  parseExcelFile(fileBuffer: Buffer): ProductExcelRow[] {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json<ProductExcelRow>(sheet);
  }

  validateRows(
    rows: ProductExcelRow[],
    productNameMap: Map<string, ProductInfo>,
  ): ValidationResult {
    const duplicates: Array<{
      row: number;
      productName: string;
      productType: string;
      existingProductName: string;
    }> = [];

    const errors: Array<{
      row: number;
      productName?: string;
      productType?: string;
      error: string;
    }> = [];

    const toCreate: Array<{
      productName: string;
      productType: string;
      productCategory: string;
    }> = [];

    const toUpdate: Array<{
      productName: string;
      productType: string;
      productCategory: string;
      existingProductName: string;
    }> = [];

    let duplicateCount = 0;
    let newCount = 0;
    let errorCount = 0;
    let hasDuplicates = false;
    let hasErrors = false;

    for (let i = 0; i < rows.length; i++) {
      try {
        const productName = String(rows[i]['품목명'] ?? '').trim();
        const productType = String(rows[i]['품목구분'] ?? '').trim();
        const productCategory = String(rows[i]['분류'] ?? '').trim();

        // 필수 필드 검증
        if (!productName) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '품목명이 누락되었습니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }
        if (!productType) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '품목구분이 누락되었습니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }
        if (!productCategory) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '분류가 누락되었습니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        // 길이 제한 검증
        if (productName.length > 20) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '품목명은 20자 이하여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        if (productType.length > 10) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '품목구분은 10자 이하여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        if (productCategory.length > 10) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '분류는 10자 이하여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        // 숫자 필드 검증
        const unitQuantity = rows[i]['수량당수량'];
        if (unitQuantity && isNaN(Number(unitQuantity))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '수량당수량은 숫자여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        const safeInventory = rows[i]['안전재고'];
        if (safeInventory && isNaN(Number(safeInventory))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '안전재고는 숫자여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        const productPrice = rows[i]['매입단가'];
        if (productPrice && isNaN(Number(productPrice))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '매입단가는 숫자여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        const productPriceSale = rows[i]['매출단가'];
        if (productPriceSale && isNaN(Number(productPriceSale))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '매출단가는 숫자여야 합니다.',
          });
          errorCount++;
          hasErrors = true;
          continue;
        }

        // 중복 체크
        const existing = productNameMap.get(productName);
        if (existing) {
          duplicateCount++;
          duplicates.push({
            row: i + 1,
            productName,
            productType,
            existingProductName: existing.productName,
          });
          toUpdate.push({
            productName,
            productType,
            productCategory,
            existingProductName: existing.productName,
          });
          hasDuplicates = true;
        } else {
          newCount++;
          toCreate.push({
            productName,
            productType,
            productCategory,
          });
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          row: i + 1,
          productName: rows[i]['품목명'] || undefined,
          productType: rows[i]['품목구분'] || undefined,
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
}
