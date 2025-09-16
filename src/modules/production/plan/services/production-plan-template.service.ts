import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductionPlanTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('생산계획양식');

        worksheet.columns = [
            { header: '생산계획일', key: 'productionPlanDate', width: 20, style: { numFmt: '@' } },
            { header: '신규,A/S 구분', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '품목구분', key: 'productType', width: 20, style: { numFmt: '@' } },
            { header: '규격', key: 'productSize', width: 20, style: { numFmt: '@' } },
            { header: '재고수량', key: 'productStock', width: 20, style: { numFmt: '@' } },
            { header: '생산계획수량', key: 'productionPlanQuantity', width: 20, style: { numFmt: '@' } },
            { header: '예상 재고수량', key: 'expectedProductStock', width: 20, style: { numFmt: '@' } },
            { header: '부족수량', key: 'shortageQuantity', width: 20, style: { numFmt: '@' } },
            { header: '예상 시작일', key: 'expectedStartDate', width: 20, style: { numFmt: '@' } },
            { header: '예상 완료일', key: 'expectedCompletionDate', width: 20, style: { numFmt: '@' } },
            { header: '담당자', key: 'employeeName', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ];
    
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const requiredFields = ['A1', 'B1', 'D1', 'E1','I1'];
        requiredFields.forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' },
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        })

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }


}