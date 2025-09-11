import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class InventoryDownloadService {
    private getWorksheetColumns() {
        return [
            { header: '재고명', key: 'inventoryName', width: 20, style: { numFmt: '@' } },
            { header: '품목구분', key: 'inventoryType', width: 15, style: { numFmt: '@' } },
            { header: '재고수량', key: 'inventoryQuantity', width: 12, style: { numFmt: '0' } },
            { header: '재고단위', key: 'inventoryUnit', width: 12, style: { numFmt: '@' } },
            { header: '재고위치', key: 'inventoryLocation', width: 15, style: { numFmt: '@' } },
            { header: '안전재고', key: 'safeInventory', width: 12, style: { numFmt: '0' } },
        ];
    }

    private applyHeaderStyle(worksheet: ExcelJS.Worksheet) {
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
    }

    private applyTextFormat(worksheet: ExcelJS.Worksheet) {
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                if (cell.value && typeof cell.value === 'string') {
                    cell.numFmt = '@';
                }
            });
        });
    }

    private setResponseHeaders(res: Response, fileName: string) {
        const encodedFileName = encodeURIComponent(`${fileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    async exportInventoryInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('재고현황');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    inventoryName: row.inventoryName,
                    inventoryType: row.inventoryType,
                    inventoryQuantity: row.inventoryQuantity,
                    inventoryUnit: row.inventoryUnit,
                    inventoryLocation: row.inventoryLocation,
                    safeInventory: row.safeInventory,
                });
            });
        }

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `재고현황_검색결과_${searchKeyword}` : '재고현황_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyInventoryInfos(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('재고현황');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);
        
        worksheet.addRow({
            inventoryName: '',
            inventoryType: '',
            inventoryQuantity: '',
            inventoryUnit: '',
            inventoryLocation: '',
            safeInventory: '',
        });
        
        this.applyTextFormat(worksheet);
        
        const baseFileName = searchKeyword ? `재고현황_검색결과_${searchKeyword}_빈데이터` : '재고현황_빈데이터';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}
