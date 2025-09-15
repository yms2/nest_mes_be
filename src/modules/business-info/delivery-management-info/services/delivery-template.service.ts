import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryTemplateService {

    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('납품관리양식');

        worksheet.columns = [
            { header: '납품일자*', key: 'deliveryDate', width: 20, style: { numFmt: '@' } },
            { header: '거래처명*', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '품목명*', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명*', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '수주유형*', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '납품수량*', key: 'deliveryQuantity', width: 20, style: { numFmt: '@' } },
            { header: '납품상태', key: 'deliveryStatus', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        const requiredFields = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1']; // 납품일자*, 거래처명*, 품목명*, 프로젝트명*, 수주유형*, 납품수량*
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
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }
}