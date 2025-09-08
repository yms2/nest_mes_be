import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EstimateManagementDownloadService {
    async exportEstimateInfos(rows: any[], res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('견적관리');
        
        
        worksheet.columns = [
            { header: '견적일', key: 'estimateCode', width: 20, style: { numFmt: '@' } },
            { header: '견적명', key: 'estimateName', width: 20, style: { numFmt: '@' } },
            { header: '버전', key: 'estimateVersion', width: 20, style: { numFmt: '@' } },
            { header: '업체명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
        ];

        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
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

        rows.forEach((r) => {
            worksheet.addRow({
                estimateName: r.estimateName,
                estimateNumber: r.estimateNumber,
                estimateDate: r.estimateDate,
                estimateWorker: r.estimateWorker,
                estimateStatus: r.estimateStatus,
            });
        });
    }
}