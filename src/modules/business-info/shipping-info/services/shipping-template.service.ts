import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ShippingTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('출하관리양식');
        worksheet.columns = [
            { header: '출하일자', key: 'shippingDate', width: 20 },
            { header: '품목명', key: 'productName', width: 30 },
            { header: '출하 지시 수량', key: 'shippingOrderQuantity', width: 20 },
            { header: '사원명', key: 'employeeName', width: 20 },
            { header: '비고', key: 'remark', width: 30 },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        })

        const requiredFields = ['A1', 'B1', 'C1'];
        requiredFields.forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' },
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // 숫자 컬럼에만 적절한 형식 적용
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // 헤더 행 제외
                row.eachCell((cell, colNumber) => {
                    // 재고 수량(F열), 출하 지시 수량(G열) 컬럼은 숫자 형식으로 설정
                    if (colNumber === 6 || colNumber === 7) { // F열(재고 수량), G열(출하 지시 수량)
                        cell.numFmt = '0';
                    } else {
                        cell.numFmt = '@'; // 텍스트 형식
                    }
                });
            }
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }
}