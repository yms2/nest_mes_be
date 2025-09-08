import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EstimateManagementDownloadService {
    async exportEstimateInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('견적관리');
        
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
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 데이터 추가 (undefined 체크)
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    estimateName: row.estimateName || '',
                    estimateDate: row.estimateDate ? new Date(row.estimateDate).toISOString().split('T')[0] : '',
                    estimateVersion: row.estimateVersion || '',
                    customerName: row.customerName || '',
                    projectName: row.projectName || '',
                    productName: row.productName || '',
                    productQuantity: row.productQuantity || '',
                    estimateStatus: row.estimateStatus || '',
                    estimatePrice: row.estimatePrice || '',
                    employeeName: row.employeeName || '',
                    estimateRemark: row.estimateRemark || '',
                    termsOfPayment: row.termsOfPayment || '',
                });
            });
        }

        // 모든 셀을 텍스트 형식으로 설정
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        // 파일명 설정 (검색어가 있으면 포함)
        const baseFileName = searchKeyword ? `견적관리_검색결과_${searchKeyword}` : '견적관리_전체목록';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // 엑셀 파일 생성 및 응답
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}