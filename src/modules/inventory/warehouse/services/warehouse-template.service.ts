import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WarehouseTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('창고정보양식');

        worksheet.columns = [
            { header: '창고명', key: 'warehouseName', width: 20, style: { numFmt: '@' } },
            { header: '창고위치', key: 'warehouseLocation', width: 20, style: { numFmt: '@' } },
            { header: '창고비고', key: 'warehouseBigo', width: 20, style: { numFmt: '@' } },
        ]

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        })

        const requiredFields = ['A1'];
        requiredFields.forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' },
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        })

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }
}