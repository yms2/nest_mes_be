import { Injectable } from "@nestjs/common";
import * as ExcelJS from 'exceljs';

@Injectable()
export class QualityCriteriaTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품질기준정보양식');

        worksheet.columns = [
            { header: '품질기준명', key: 'criteriaName', width: 20, style: { numFmt: '@' } },
            { header: '품질기준타입', key: 'criteriaType', width: 20, style: { numFmt: '@' } },
            { header: '품질기준설명', key: 'criteriaDescription', width: 20, style: { numFmt: '@' } },
        ];
        
        // 헤더 스타일 적용
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        
        // 필수 필드 표시 (품질기준명, 품질기준타입)
        const requiredFields = ['A1', 'B1'];
        requiredFields.forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // 데이터 행 스타일 적용
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                row.eachCell((cell, colNumber) => {
                    if (colNumber === 1 || colNumber === 2 || colNumber === 3) {
                        cell.numFmt = '@'; // 텍스트 형식
                    }
                });
            }
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }
}