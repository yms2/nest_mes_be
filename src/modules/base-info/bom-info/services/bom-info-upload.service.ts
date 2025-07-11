import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductInfo } from '../../product-info/entities/product-info.entity';
import { BomInfo } from '../entities/bom-info.entity';

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

    for (const row of rows) {
      const upperName = (row['상위품목명'] || '').trim();
      const childName = (row['품목명'] || '').trim();

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

      const existBom = await this.bomRepository.findOneBy({
        parentProductCode: currentParentProductCode,
        childProductCode: child.productCode,
      });

      if (existBom) {
        existBom.quantity = row['수량'];
        existBom.unit = row['단위'];
        await this.bomRepository.save(existBom);
      } else {
        const bom = this.bomRepository.create({
          parentProductCode: currentParentProductCode,
          childProductCode: child.productCode,
          quantity: row['수량'],
          unit: row['단위'],
        });
        await this.bomRepository.save(bom);
      }
    }

    return { message: 'BOM 업로드 완료' };
  }
}