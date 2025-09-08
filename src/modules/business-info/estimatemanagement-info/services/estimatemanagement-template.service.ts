import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EstimateManagementTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('견적관리양식');

        worksheet.columns = [
            { header: '견적명', key: 'estimateName', width: 25, style: { numFmt: '@' } },
            { header: '견적일자', key: 'estimateDate', width: 15, style: { numFmt: '@' } },
            { header: '견적버전', key: 'estimateVersion', width: 12, style: { numFmt: '@' } },
            { header: '고객명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '제품명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '제품수량', key: 'productQuantity', width: 12, style: { numFmt: '@' } },
            { header: '견적상태', key: 'estimateStatus', width: 15, style: { numFmt: '@' } },
            { header: '견적가격', key: 'estimatePrice', width: 15, style: { numFmt: '@' } },
            { header: '담당자명', key: 'employeeName', width: 15, style: { numFmt: '@' } },
            { header: '견적비고', key: 'estimateRemark', width: 20, style: { numFmt: '@' } },
            { header: '결제조건', key: 'termsOfPayment', width: 15, style: { numFmt: '@' } },
        ];

        // 헤더 스타일링
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 필수 필드 표시 (빨간색 배경)
        const requiredFields = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1'];
        requiredFields.forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' },
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // 모든 셀을 텍스트 형식으로 설정
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        // 예시 데이터 추가 (2행)
        const exampleData = {
            estimateName: '샘플 견적서',
            estimateDate: '2025-01-01',
            estimateVersion: '1',
            customerName: '샘플고객',
            projectName: '샘플프로젝트',
            productName: '샘플제품',
            productQuantity: '100',
            estimateStatus: '진행중',
            estimatePrice: '1000000',
            employeeName: '홍길동',
            estimateRemark: '샘플 비고',
            termsOfPayment: '30일'
        };

        worksheet.addRow(exampleData);

        // 예시 행 스타일링 (회색 배경)
        const exampleRow = worksheet.getRow(2);
        exampleRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' },
            };
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }
}
