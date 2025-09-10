import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInfo } from '../../entities/product-info.entity';
import { ProductExcelRow } from './product-upload-validation.service';
import { ProductInfoCreateService } from '../product-info-create.service';

@Injectable()
export class ProductUploadProcessingService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    private readonly productInfoCreateService: ProductInfoCreateService,
  ) {}

  async processValidatedData(
    rows: ProductExcelRow[],
    mode: 'add' | 'overwrite',
    createdBy: string,
  ): Promise<{ totalCount: number; newCount: number; updateCount: number; errorCount: number; errors: any[] }> {
    let newCount = 0;
    let updateCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        const productName = String(row['품목명'] ?? '').trim();
        const productType = String(row['품목구분'] ?? '').trim();
        
        // 필수 필드 검증
        if (!productName) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '품목명이 누락되었습니다.',
          });
          errorCount++;
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
          continue;
        }

        const productCategory = String(row['분류'] ?? '').trim();
        if (productCategory.length > 10) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '분류는 10자 이하여야 합니다.',
          });
          errorCount++;
          continue;
        }

        // 숫자 필드 검증
        const unitQuantity = row['수량당수량'];
        if (unitQuantity && isNaN(Number(unitQuantity))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '수량당수량은 숫자여야 합니다.',
          });
          errorCount++;
          continue;
        }

        const safeInventory = row['안전재고'];
        if (safeInventory && isNaN(Number(safeInventory))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '안전재고는 숫자여야 합니다.',
          });
          errorCount++;
          continue;
        }

        const productPrice = row['매입단가'];
        if (productPrice && isNaN(Number(productPrice))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '매입단가는 숫자여야 합니다.',
          });
          errorCount++;
          continue;
        }

        const productPriceSale = row['매출단가'];
        if (productPriceSale && isNaN(Number(productPriceSale))) {
          errors.push({
            row: i + 1,
            productName,
            productType,
            error: '매출단가는 숫자여야 합니다.',
          });
          errorCount++;
          continue;
        }
        
        // 검증 통과한 경우에만 처리
        if (mode === 'add') {
          // 추가 모드: 중복되지 않는 경우만 추가
          const existingProduct = await this.productInfoRepository.findOne({
            where: { productName },
          });

          if (!existingProduct) {
            await this.createProduct(row, createdBy);
            newCount++;
          }
        } else {
          // 덮어쓰기 모드: 기존 데이터 업데이트 또는 새로 생성
          const existingProduct = await this.productInfoRepository.findOne({
            where: { productName },
          });

          if (existingProduct) {
            await this.updateProduct(existingProduct, row, createdBy);
            updateCount++;
          } else {
            await this.createProduct(row, createdBy);
            newCount++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({
          row: i + 1,
          productName: rows[i]['품목명'] || undefined,
          productType: rows[i]['품목구분'] || undefined,
          error: errorMessage,
        });
        errorCount++;
      }
    }

    return {
      totalCount: rows.length,
      newCount,
      updateCount,
      errorCount,
      errors,
    };
  }

  private async createProduct(row: ProductExcelRow, createdBy: string): Promise<ProductInfo> {
    // 품목코드 생성
    const productCode = await this.generateProductCode();
    
    const product = this.productInfoRepository.create({
      productCode,
      productName: String(row['품목명'] ?? '').trim(),
      productType: String(row['품목구분'] ?? '').trim(),
      productCategory: String(row['분류'] ?? '').trim(),
      productSize1: row['규격1'] || '',
      productSize2: row['규격2'] || '',
      customerCode: row['거래처코드'] || '',
      productOrderUnit: row['발주단위'] || '',
      productInventoryUnit: row['재고단위'] || '',
      unitQuantity: row['수량당수량'] || '',
      safeInventory: row['안전재고'] || '',
      taxType: row['매입세금구분'] || '',
      productPrice: row['매입단가'] || '',
      taxTypeSale: row['매출세금구분'] || '',
      productPriceSale: row['매출단가'] || '',
      productHomepage: row['홈페이지'] || '',
      productBigo: row['비고'] || '',
      createdBy,
    });

    return await this.productInfoRepository.save(product);
  }

  // 품목 코드 생성 (ProductInfoCreateService와 동일한 로직)
  private async generateProductCode(): Promise<string> {
    const [lastProduct] = await this.productInfoRepository.find({
      order: { productCode: 'DESC' },
      take: 1,
    });

    let nextNumber = 1;
    
    if (lastProduct?.productCode) {
      // PRD 접두사 제거 후 숫자 추출
      const numberPart = lastProduct.productCode.replace(/^PRD/i, '');
      const parsedNumber = parseInt(numberPart, 10);
      
      // 유효한 숫자인지 확인
      if (!isNaN(parsedNumber) && parsedNumber > 0) {
        nextNumber = parsedNumber + 1;
      }
    }

    return `PRD${nextNumber.toString().padStart(3, '0')}`;
  }

  private async updateProduct(
    existingProduct: ProductInfo,
    row: ProductExcelRow,
    updatedBy: string,
  ): Promise<ProductInfo> {
    existingProduct.productType = String(row['품목구분'] ?? '').trim();
    existingProduct.productCategory = String(row['분류'] ?? '').trim();
    existingProduct.productSize1 = row['규격1'] || '';
    existingProduct.productSize2 = row['규격2'] || '';
    existingProduct.customerCode = row['거래처코드'] || '';
    existingProduct.productOrderUnit = row['발주단위'] || '';
    existingProduct.productInventoryUnit = row['재고단위'] || '';
    existingProduct.unitQuantity = row['수량당수량'] || '';
    existingProduct.safeInventory = row['안전재고'] || '';
    existingProduct.taxType = row['매입세금구분'] || '';
    existingProduct.productPrice = row['매입단가'] || '';
    existingProduct.taxTypeSale = row['매출세금구분'] || '';
    existingProduct.productPriceSale = row['매출단가'] || '';
    existingProduct.productHomepage = row['홈페이지'] || '';
    existingProduct.productBigo = row['비고'] || '';
    existingProduct.updatedBy = updatedBy;

    return await this.productInfoRepository.save(existingProduct);
  }
}
