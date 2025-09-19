//다운로드 서비스

import { Injectable } from "@nestjs/common";
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class QualityCriteriaDownloadService {
    private getWorksheetColumns() {
        return [
            { header: '품질기준 코드', key: 'criteriaCode', width: 20, style: { numFmt: '@' } },
            { header: '품질기준 이름', key: 'criteriaName', width: 20, style: { numFmt: '@' } },
            { header: '품질기준 타입', key: 'criteriaType', width: 20, style: { numFmt: '@' } },
            { header: '품질기준 설명', key: 'criteriaDescription', width: 20, style: { numFmt: '@' } },
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
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // 헤더 행 제외
                row.eachCell((cell, colNumber) => {
                    // 숫자 컬럼들 (재고수량, 출하지시수량, 단가, 공급가액, 부가세, 합계)
                    if ([7, 8, 10, 11, 12, 13].includes(colNumber)) {
                        cell.numFmt = '0';
                    } else {
                        cell.numFmt = '@'; // 텍스트 형식
                    }
                });
            }
        });
    }

    private setResponseHeaders(res: Response, fileName: string) {
        const encodedFileName = encodeURIComponent(fileName);
        res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    async exportQualityCriteria(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품질기준정보');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    criteriaCode: row.criteriaCode,
                    criteriaName: row.criteriaName,
                    criteriaType: row.criteriaType,
                    criteriaDescription: row.criteriaDescription,
                });
            });
        }

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `품질기준정보_검색결과_${searchKeyword}` : '품질기준정보_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyQualityCriteria(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품질기준정보');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);

        // 빈 데이터 행 추가 (검색 결과가 없음을 표시)
        worksheet.addRow({
            criteriaCode: '검색 결과가 없습니다',
            criteriaName: '',
            criteriaType: '',
            criteriaDescription: '',
        });

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `품질기준정보_검색결과_${searchKeyword}` : '품질기준정보_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}
