import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ShippingDownloadService {
    private getWorksheetColumns() {
        return [
            { header: '출하코드', key: 'shippingCode', width: 20, style: { numFmt: '@' } },
            { header: '출하일자', key: 'shippingDate', width: 15, style: { numFmt: '@' } },
            { header: '수주코드', key: 'orderCode', width: 20, style: { numFmt: '@' } },
            { header: '품목코드', key: 'productCode', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 30, style: { numFmt: '@' } },
            { header: '단위', key: 'unit', width: 15, style: { numFmt: '@' } },
            { header: '재고수량', key: 'inventoryQuantity', width: 12, style: { numFmt: '0' } },
            { header: '출하지시수량', key: 'shippingOrderQuantity', width: 15, style: { numFmt: '0' } },
            { header: '출하상태', key: 'shippingStatus', width: 15, style: { numFmt: '@' } },
            { header: '단가', key: 'unitPrice', width: 12, style: { numFmt: '0' } },
            { header: '공급가액', key: 'supplyPrice', width: 15, style: { numFmt: '0' } },
            { header: '부가세', key: 'vat', width: 12, style: { numFmt: '0' } },
            { header: '합계', key: 'total', width: 15, style: { numFmt: '0' } },
            { header: '사원코드', key: 'employeeCode', width: 15, style: { numFmt: '@' } },
            { header: '사원명', key: 'employeeName', width: 20, style: { numFmt: '@' } },
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

    async exportShippingInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('출하관리');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    shippingCode: row.shippingCode,
                    shippingDate: this.formatDate(row.shippingDate),
                    orderCode: row.orderCode || '',
                    productCode: row.productCode || '',
                    productName: row.productName || '',
                    unit: row.unit || '',
                    inventoryQuantity: row.inventoryQuantity || 0,
                    shippingOrderQuantity: row.shippingOrderQuantity || 0,
                    shippingStatus: row.shippingStatus || '',
                    unitPrice: this.safeParseInt(row.unitPrice, 0),
                    supplyPrice: this.safeParseInt(row.supplyPrice, 0),
                    vat: this.safeParseInt(row.vat, 0),
                    total: this.safeParseInt(row.total, 0),
                    employeeCode: row.employeeCode || '',
                    employeeName: row.employeeName || '',
                    remark: row.remark || '',
                });
            });
        }

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `출하관리_검색결과_${searchKeyword}` : '출하관리_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyShippingInfos(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('출하관리');
        
        worksheet.columns = this.getWorksheetColumns();
        this.applyHeaderStyle(worksheet);

        // 빈 데이터 행 추가 (검색 결과가 없음을 표시)
        worksheet.addRow({
            shippingCode: '검색 결과가 없습니다',
            shippingDate: '',
            orderCode: '',
            productCode: '',
            productName: '',
            unit: '',
            inventoryQuantity: 0,
            shippingOrderQuantity: 0,
            shippingStatus: '',
            unitPrice: 0,
            supplyPrice: 0,
            vat: 0,
            total: 0,
            employeeCode: '',
            employeeName: '',
            remark: '',
        });

        this.applyTextFormat(worksheet);

        const baseFileName = searchKeyword ? `출하관리_검색결과_${searchKeyword}` : '출하관리_전체목록';
        this.setResponseHeaders(res, baseFileName);
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    private formatDate(date: any): string {
        if (!date) return '';
        
        try {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '';
            
            return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        } catch (error) {
            return '';
        }
    }

    private safeParseInt(value: any, defaultValue: number = 0): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        const parsed = parseInt(value.toString(), 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
}
