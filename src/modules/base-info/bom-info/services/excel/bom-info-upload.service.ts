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
        
        // 자동으로 레벨 계산
        const level = await this.calculateBomLevel(currentParentProductCode);

        const existBom = await this.bomRepository.findOneBy({
          parentProductCode: currentParentProductCode,
          childProductCode: child.productCode,
        });

        if (existBom) {
          existBom.quantity = quantity;
          existBom.unit = unit;
          existBom.level = level; // 자동 계산된 레벨로 업데이트
          await this.bomRepository.save(existBom);
        } else {
          const bom = this.bomRepository.create({
            parentProductCode: currentParentProductCode,
            childProductCode: child.productCode,
            quantity,
            unit,
            level, // 자동 계산된 레벨
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
      message: 'BOM 업로드 완료 (레벨 자동 계산됨)',
      total: rows.length,
      success: rows.length - errors.length,
      failed: errors.length,
      errors,
    };
  }

  /**
   * BOM 레벨을 자동으로 계산합니다.
   * @param parentProductCode 상위품목 코드
   * @returns 계산된 BOM 레벨
   */
  private async calculateBomLevel(parentProductCode: string): Promise<number> {
    // 상위품목이 다른 BOM의 하위품목인지 확인
    const parentAsChild = await this.bomRepository.findOne({
      where: { childProductCode: parentProductCode },
      order: { level: 'DESC' }, // 가장 높은 레벨을 찾기 위해 내림차순 정렬
    });

    if (parentAsChild) {
      // 상위품목이 다른 BOM의 하위품목인 경우, 그 레벨 + 1
      return parentAsChild.level + 1;
    } else {
      // 상위품목이 최상위인 경우 레벨 1
      return 1;
    }
  }

  /**
   * 엑셀 템플릿 다운로드를 위한 샘플 데이터 생성 (레벨 컬럼 제거)
   */
  getExcelTemplate() {
    const sampleData = [
      {
        '상위품목명': '최종제품A',
        '품목명': '부품B',
        '수량': 2,
        '단위': '개'
      },
      {
        '상위품목명': '부품B',
        '품목명': '소재C',
        '수량': 5,
        '단위': 'kg'
      },
      {
        '상위품목명': '부품B',
        '품목명': '소재D',
        '수량': 3,
        '단위': '개'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM_Template');

    // 컬럼 너비 자동 조정 (레벨 컬럼 제거)
    const columnWidths = [
      { wch: 15 }, // 상위품목명
      { wch: 15 }, // 품목명
      { wch: 10 }, // 수량
      { wch: 10 }  // 단위
    ];
    worksheet['!cols'] = columnWidths;

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
