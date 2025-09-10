import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductInfo } from '../../../product-info/product_sample/entities/product-info.entity';
import { BomInfo } from '../../entities/bom-info.entity';
import * as ExcelJS from 'exceljs';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class BomInfoExcelDownloadService {
  constructor(
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
    private readonly logService: logService,
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
  ) {}

  async downloadBomData(): Promise<Buffer> {
    try {
      const bomList = await this.bomRepository.find();

      const productCodes = [
        ...new Set(bomList.flatMap(b => [b.parentProductCode, b.childProductCode])),
      ];

      const products = await this.productRepository.find({
        where: { productCode: In(productCodes) },
        select: ['productCode', 'productName', 'productType'],
      });

      const productMap = new Map(
        products.map(p => [p.productCode, { name: p.productName, type: p.productType }]),
      );

      const header = [
        '상위품목명',
        '품목명',
        '수량',
        '단위',
        '',
        '반제품 상위품목명',
        '품목명',
        '수량',
        '단위',
      ];
      const rows: (string | number)[][] = [];

      let topIndex = 1;
      const topParents = Array.from(new Set(bomList.map(b => b.parentProductCode))).sort();

      const completeRows: (string | number)[][] = [];
      const semiRows: (string | number)[][] = [];

      for (const parentCode of topParents) {
        const productType = productMap.get(parentCode)?.type;
        const targetRows = productType === '완제품' ? completeRows : semiRows;
        this.processBom(bomList, productMap, parentCode, `${topIndex}`, targetRows, 1, new Set());
        topIndex++;
      }

      const maxLength = Math.max(completeRows.length, semiRows.length);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('BOM 다운로드 데이터');

      sheet.columns = Array(9).fill({ width: 20 });

      const headerRow = sheet.addRow(header);
      headerRow.eachCell(cell => {
        cell.font = { bold: true };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      for (let i = 0; i < maxLength; i++) {
        const complete = completeRows[i] ?? ['', '', '', ''];
        const semi = semiRows[i] ?? ['', '', '', ''];

        const row = sheet.addRow([...complete, '', ...semi]);

        row.eachCell((cell, colNumber) => {
          const cellValue = row.getCell(colNumber).value as string;
          const level = (cellValue?.toString().match(/-/g) || []).length;
          const fillColors = ['FFFFE0', 'E0FFFF', 'FFE0FF', 'E0FFE0'];
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColors[level % fillColors.length] },
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          };
        });
      }

      const arrayBuffer = await workbook.xlsx.writeBuffer();

      await this.logService.createDetailedLog({
        moduleName: 'BOM 다운로드',
        action: 'DOWNLOAD_SUCCESS',
        username: 'system',
        targetId: '',
        targetName: '',
        details: 'BOM 다운로드 성공',
      });

      return Buffer.from(arrayBuffer);
    } catch (error) {
      await this.logService
        .createDetailedLog({
          moduleName: 'BOM 다운로드',
          action: 'DOWNLOAD_FAIL',
          username: 'system',
          targetId: '',
          targetName: '',
          details: `BOM 다운로드 실패: ${error.message}`,
        })
        .catch(() => {});
      throw error;
    }
  }

  private processBom(
    bomList: BomInfo[],
    productMap: Map<string, { name: string; type: string }>,
    parentCode: string,
    codePrefix: string,
    rows: (string | number)[][],
    level: number = 1,
    visited: Set<string> = new Set(),
  ) {
    // 재귀 깊이 제한 (안전장치)
    if (level > 100) {
      console.warn(`BOM 처리 중 최대 깊이 제한에 도달했습니다: ${parentCode}`);
      return;
    }

    // 순환 참조 방지
    if (visited.has(parentCode)) {
      console.warn(`순환 참조가 감지되었습니다: ${parentCode}`);
      return;
    }

    // 현재 노드를 방문한 것으로 표시
    visited.add(parentCode);

    const childBoms = bomList
      .filter(b => b.parentProductCode === parentCode)
      .sort((a, b) => a.childProductCode.localeCompare(b.childProductCode));

    let childIndex = 1;

    for (const bom of childBoms) {
      const parentName = productMap.get(bom.parentProductCode)?.name ?? bom.parentProductCode;
      const childName = productMap.get(bom.childProductCode)?.name ?? bom.childProductCode;
      const bomCode = `${codePrefix}-${childIndex}`;

      rows.push([parentName, `${bomCode}-${childName}`, `${bom.quantity}`, bom.unit]);

      // 새로운 visited Set을 생성하여 각 분기에서 독립적으로 추적
      const newVisited = new Set(visited);
      this.processBom(bomList, productMap, bom.childProductCode, bomCode, rows, level + 1, newVisited);
      childIndex++;
    }
  }
}
