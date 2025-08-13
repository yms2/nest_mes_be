import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInfo } from '../../../product-info/product_sample/entities/product-info.entity';
import { BomInfo } from '../../entities/bom-info.entity';

@Injectable()
export class BomInfoUploadService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
  ) {}

  async uploadBomExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    let currentParentProductCode: string | null = null;

    const errors: { rowIndex: number; row: any; message: string }[] = [];

    for (const [index, row] of rows.entries()) {
      try {
        const upperName = typeof row['상위품목명'] === 'string' ? row['상위품목명'].trim() : '';
        const childName = typeof row['품목명'] === 'string' ? row['품목명'].trim() : '';

        if (upperName) {
          const parent = await this.productRepository.findOneBy({ productName: upperName });
          if (!parent) throw new Error(`상위 품목 [${upperName}] 이 없습니다.`);
          currentParentProductCode = parent.productCode;
        }

        if (!currentParentProductCode) {
          throw new Error('상위 품목이 지정되지 않았습니다.');
        }

        const child = await this.productRepository.findOneBy({ productName: childName });
        if (!child) throw new Error(`하위 품목 [${childName}] 이 없습니다.`);

        const quantity = Number(row['수량'] ?? 0);
        const unit = typeof row['단위'] === 'string' ? row['단위'].trim() : '';

        const existBom = await this.bomRepository.findOneBy({
          parentProductCode: currentParentProductCode,
          childProductCode: child.productCode,
        });

        if (existBom) {
          existBom.quantity = quantity;
          existBom.unit = unit;
          await this.bomRepository.save(existBom);
        } else {
          const bom = this.bomRepository.create({
            parentProductCode: currentParentProductCode,
            childProductCode: child.productCode,
            quantity,
            unit,
          });
          await this.bomRepository.save(bom);
        }
      } catch (err) {
        errors.push({
          rowIndex: index + 2, // 엑셀 기준으로 줄 번호 반환
          row,
          message: (err as Error).message,
        });
      }
    }

    return {
      message: 'BOM 업로드 완료',
      total: rows.length,
      success: rows.length - errors.length,
      failed: errors.length,
      errors,
    };
  }
}
