import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderManagementTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('수주관리양식');

        worksheet.columns = [
            { header: '수주일', key: 'orderDate', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트버전', key: 'projectVersion', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '수주구분', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '수량', key: 'quantity', width: 20, style: { numFmt: '@' } },
            { header: '단가', key: 'unitPrice', width: 20, style: { numFmt: '@' } },
            { header: '공급가액', key: 'supplyPrice', width: 20, style: { numFmt: '@' } },
            { header: '부가세', key: 'vat', width: 20, style: { numFmt: '@' } },
            { header: '합계', key: 'total', width: 20, style: { numFmt: '@' } },
            { header: '납품예정일', key: 'deliveryDate', width: 20, style: { numFmt: '@' } },
            { header: '참조견적', key: 'estimateCode', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const requiredFields = ['A1', 'B1', 'C1', 'D1'];
        requiredFields.forEach((address) => {
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