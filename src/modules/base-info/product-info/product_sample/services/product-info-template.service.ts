import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductInfoTemplateService {

    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품목정보양식');

        worksheet.columns = [
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '품목구분', key: 'productType', width: 20, style: { numFmt: '@' } },
            { header: '분류', key: 'productCategory', width: 20, style: { numFmt: '@' } },
            { header: '규격1(kHz)', key: 'productSize1', width: 20, style: { numFmt: '@' } },
            { header: '규격2(재질, Type)', key: 'productSize2', width: 20, style: { numFmt: '@' } },
            { header: '거래처', key: 'customerCode', width: 20, style: { numFmt: '@' } },
            { header: '발주단위', key: 'productOrderUnit', width: 20, style: { numFmt: '@' } },
            { header: '재고단위', key: 'productInventoryUnit', width: 20, style: { numFmt: '@' } },
            { header: '수량당 수량', key: 'unitQuantity', width: 20, style: { numFmt: '@' } },
            { header: '안전재고', key: 'safeInventory', width: 20, style: { numFmt: '@' } },
            { header: '입고/과세', key: 'taxType', width: 20, style: { numFmt: '@' } },
            { header: '매입단가', key: 'productPrice', width: 20, style: { numFmt: '@' } },
            { header: '출고/과세', key: 'taxTypeSale', width: 20, style: { numFmt: '@' } },
            { header: '매출단가', key: 'productPriceSale', width: 20, style: { numFmt: '@' } },            
            { header: '홈페이지', key: 'productHomepage', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'productNote', width: 20, style: { numFmt: '@' } },
        ];
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

    // 필수 컬럼 표시 (A1, B1, C1만 빨간색)
    ['A1', 'B1'].forEach((address) => {
        const cell = worksheet.getCell(address);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' },
        };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      });
        
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }   
}