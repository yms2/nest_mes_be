import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EstimateManagementTemplateService {

    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('견적관리양식');

        worksheet.columns = [
            { header: '견적명', key: 'estimateName', width: 20, style: { numFmt: '@' } },
            { header: '견적번호', key: 'estimateNumber', width: 20, style: { numFmt: '@' } },
            { header: '견적일', key: 'estimateDate', width: 20, style: { numFmt: '@' } },
            { header: '견적담당자', key: 'estimateWorker', width: 20, style: { numFmt: '@' } },
            { header: '견적상태', key: 'estimateStatus', width: 20, style: { numFmt: '@' } },
        ];
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
    
        ['A1', 'B1', 'C1'].forEach((address) => {
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