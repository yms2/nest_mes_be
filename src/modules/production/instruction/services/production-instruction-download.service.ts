import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductionInstructionDownloadService {
    async exportProductionInstructionInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('생산 지시');
        
        // 컬럼 정의
        worksheet.columns = [
            { header: '품목명', key: 'productName', width: 20 },
            { header: '품목구분', key: 'productType', width: 12 },
            { header: '품목규격', key: 'productSize', width: 15 },
            { header: '생산계획수량', key: 'productionPlanQuantity', width: 12 },
            { header: '생산지시수량', key: 'productionInstructionQuantity', width: 12 },
            { header: '생산시작일', key: 'productionStartDate', width: 12 },
            { header: '생산완료일', key: 'productionCompletionDate', width: 12 },
            { header: '담당자명', key: 'employeeName', width: 12 },
            { header: '프로젝트명', key: 'projectName', width: 20 },
            { header: '고객명', key: 'customerName', width: 20 },
            { header: '비고', key: 'remark', width: 20 },
        ];

        // 데이터 추가
        rows.forEach((row) => {
            const productionPlanInfo = row.productionPlanInfo || {};
            worksheet.addRow({
                productionInstructionCode: row.productionInstructionCode,
                productionPlanCode: row.productionPlanCode,
                productCode: productionPlanInfo.productCode || '',
                productName: productionPlanInfo.productName || '',
                productType: productionPlanInfo.productType || '',
                productSize: productionPlanInfo.productSize || '',
                productionPlanQuantity: productionPlanInfo.productionPlanQuantity || 0,
                productionInstructionQuantity: row.productionInstructionQuantity,
                productionStartDate: this.formatDate(row.productionStartDate),
                productionCompletionDate: this.formatDate(row.productionCompletionDate),
                employeeCode: row.employeeCode,
                employeeName: row.employeeName,
                projectCode: productionPlanInfo.projectCode || '',
                projectName: productionPlanInfo.projectName || '',
                customerCode: productionPlanInfo.customerCode || '',
                customerName: productionPlanInfo.customerName || '',
                remark: row.remark || '',
                createdAt: this.formatDate(row.createdAt),
            });
        });

        // 헤더 스타일 적용
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 파일명 생성
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const filename = `생산지시_${timestamp}.xlsx`;

        // 응답 헤더 설정
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

        // 파일 다운로드
        await workbook.xlsx.write(res);
        res.end();
    }

    private formatDate(date: any): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }
}