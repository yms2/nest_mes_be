import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()

export class ProductionPlanDownloadService {
    async exportProductionPlanInfos(
        rows: any[], 
        res: Response, 
        searchKeyword?: string
    ) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('생산계획');
        
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
        ]

        // 헤더 스타일링
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        if(rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    productionPlanCode: row.productionPlanCode,
                    productionPlanDate: row.productionPlanDate,
                    orderType: row.orderType,
                    projectCode: row.projectCode,
                    projectName: row.projectName,
                    customerCode: row.customerCode,
                    customerName: row.customerName,
                    productCode: row.productCode,
                    productName: row.productName,
                    productType: row.productType,
                    productSize: row.productSize,
                    productStock: row.productStock,
                    productionPlanQuantity: row.productionPlanQuantity,
                    expectedProductStock: row.expectedProductStock,
                    expectedStartDate: row.expectedStartDate,
                    expectedCompletionDate: row.expectedCompletionDate,
                    employeeCode: row.employeeCode,
                    employeeName: row.employeeName,
                    shortageQuantity: row.shortageQuantity,
                    remark: row.remark,
                });
            });
        }

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        const baseFileName = searchKeyword ? `생산계획_검색결과_${searchKeyword}` : '생산계획_전체목록';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyProductionPlanInfos(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('생산계획');
        
        worksheet.columns = [
            { header: '생산계획코드', key: 'productionPlanCode', width: 20, style: { numFmt: '@' } },
            { header: '생산계획일', key: 'productionPlanDate', width: 20, style: { numFmt: '@' } },
            { header: '신규,A/S 구분', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트코드', key: 'projectCode', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '고객코드', key: 'customerCode', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '품목코드', key: 'productCode', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '품목구분', key: 'productType', width: 20, style: { numFmt: '@' } },
            { header: '규격', key: 'productSize', width: 20, style: { numFmt: '@' } },
            { header: '재고수량', key: 'productStock', width: 20, style: { numFmt: '@' } },
            { header: '생산계획수량', key: 'productionPlanQuantity', width: 20, style: { numFmt: '@' } },
            { header: '예상 재고수량', key: 'expectedProductStock', width: 20, style: { numFmt: '@' } },
            { header: '예상 시작일', key: 'expectedStartDate', width: 20, style: { numFmt: '@' } },
            { header: '예상 완료일', key: 'expectedCompletionDate', width: 20, style: { numFmt: '@' } },
            { header: '담당자코드', key: 'employeeCode', width: 20, style: { numFmt: '@' } },
            { header: '담당자', key: 'employeeName', width: 20, style: { numFmt: '@' } },
            { header: '부족수량', key: 'shortageQuantity', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ]

        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        worksheet.addRow({
            productionPlanCode: '',
            productionPlanDate: '',
            orderType: '',
            projectCode: '',
            projectName: '',
            customerCode: '',
            customerName: '',
            productCode: '',
            productName: '',
            productType: '',
            productSize: '',
            productStock: '',
            productionPlanQuantity: '',
            expectedProductStock: '',
            expectedStartDate: '',
            expectedCompletionDate: '',
            employeeCode: '',
            employeeName: '',
            shortageQuantity: '',
            remark: '',
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });
        
        const baseFileName = searchKeyword ? `생산계획_검색결과_${searchKeyword}_빈데이터` : '생산계획_빈데이터';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}