import { Injectable } from "@nestjs/common";
import * as ExcelJS from 'exceljs';

@Injectable()
export class EquipmentTemplateService {

    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('설비정보양식');

        worksheet.columns = [
            { header: '설비명', key: 'equipmentName', width: 20, style: { numFmt: '@' } },
            { header: '설비모델', key: 'equipmentModel', width: 20, style: { numFmt: '@' } },
            { header: '구매처', key: 'equipmentPurchasePlace', width: 20, style: { numFmt: '@' } },
            { header: '구매일', key: 'equipmentPurchaseDate', width: 20, style: { numFmt: '@' } },
            { header: '구매가격', key: 'equipmentPurchasePrice', width: 20, style: { numFmt: '@' } },
            { header: '설비이력', key: 'equipmentHistory', width: 20, style: { numFmt: '@' } },
            { header: '담당자', key: 'equipmentWorker', width: 20, style: { numFmt: '@' } },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1'].forEach((address) => {
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