import { Injectable } from "@nestjs/common";
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { QualityInspection } from "../entities/quality-inspection.entity";

@Injectable()
export class QualityInspectionDownloadService {
    private getWorksheetColumns() {
        return [
            { header: '검사코드', key: 'inspectionCode', width: 15, style: { numFmt: '@' } },
            { header: '생산코드', key: 'productionCode', width: 15, style: { numFmt: '@' } },
            { header: '제품명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '검사수량', key: 'inspectionQuantity', width: 12, style: { numFmt: '0' } },
            { header: '품질기준코드', key: 'criteriaCode', width: 15, style: { numFmt: '@' } },
            { header: '품질기준명', key: 'criteriaName', width: 20, style: { numFmt: '@' } },
            { header: '품질기준타입', key: 'criteriaType', width: 15, style: { numFmt: '@' } },
            { header: '검사일', key: 'inspectionDate', width: 12, style: { numFmt: 'yyyy-mm-dd' } },
            { header: '검사자', key: 'inspector', width: 15, style: { numFmt: '@' } },
            { header: '검사결과', key: 'inspectionResult', width: 12, style: { numFmt: '@' } },
            { header: '검사상태', key: 'inspectionStatus', width: 12, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 30, style: { numFmt: '@' } },
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
                    if ([1, 2, 5, 6, 7, 9, 10, 11, 12].includes(colNumber)) {
                        cell.numFmt = '@'; // 텍스트 형식
                    } else if (colNumber === 3) {
                        cell.numFmt = '0'; // 숫자 형식
                    } else if (colNumber === 8) {
                        cell.numFmt = 'yyyy-mm-dd'; // 날짜 형식
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

    async exportQualityInspections(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품질검사정보');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    inspectionCode: row.inspectionCode,
                    productionCode: row.productionCode,
                    productName: row.productName,
                    inspectionQuantity: row.inspectionQuantity,
                    criteriaCode: row.criteriaCode,
                    criteriaName: row.criteriaName,
                    criteriaType: row.criteriaType,
                    inspectionDate: row.inspectionDate,
                    inspector: row.inspector,
                    inspectionResult: row.inspectionResult || '',
                    inspectionStatus: row.inspectionStatus,
                    remark: row.remark || '',
                });
            });
        }

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `품질검사정보_검색결과_${searchKeyword}` : '품질검사정보_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyQualityInspections(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품질검사정보');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);

        // 빈 데이터 행 추가 (검색 결과가 없음을 표시)
        worksheet.addRow({
            inspectionCode: '검색 결과가 없습니다',
            productionCode: '',
            productName: '',
            inspectionQuantity: '',
            criteriaCode: '',
            criteriaName: '',
            criteriaType: '',
            inspectionDate: '',
            inspector: '',
            inspectionResult: '',
            inspectionStatus: '',
            remark: '',
        });

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `품질검사정보_검색결과_${searchKeyword}` : '품질검사정보_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}
