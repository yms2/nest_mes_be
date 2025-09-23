import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ClaimDownloadService {
    /**
     * 클레임 데이터를 엑셀 파일로 다운로드합니다
     */
    async exportClaims(claims: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('AS 클레임 관리');

        // 컬럼 정의
        worksheet.columns = [
            { header: '클레임일자', key: 'claimDate', width: 15, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 25, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 25, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 25, style: { numFmt: '@' } },
            { header: '클레임수량', key: 'claimQuantity', width: 12, style: { numFmt: '0' } },
            { header: '클레임단가', key: 'claimPrice', width: 15, style: { numFmt: '#,##0' } },
            { header: '클레임사유', key: 'claimReason', width: 30, style: { numFmt: '@' } },
            { header: '클레임상태', key: 'claimStatus', width: 12, style: { numFmt: '@' } },
            { header: '담당자명', key: 'employeeName', width: 15, style: { numFmt: '@' } }, 
            { header: '예상완료일', key: 'expectedCompletionDate', width: 15, style: { numFmt: '@' } },
            { header: '처리완료일', key: 'completionDate', width: 15, style: { numFmt: '@' } },
            { header: '처리결과', key: 'resolution', width: 30, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 30, style: { numFmt: '@' } },        ];

        // 헤더 스타일 적용
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 필수 컬럼을 빨간색으로 표시
        ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'].forEach((addr) => {
            const cell = worksheet.getCell(addr);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // 데이터 행 추가
        if (claims && Array.isArray(claims)) {
            claims.forEach((claim) => {
                const row = worksheet.addRow({
                    claimCode: claim.claimCode || '',
                    claimDate: claim.claimDate ? new Date(claim.claimDate).toISOString().split('T')[0] : '',
                    customerCode: claim.customerCode || '',
                    customerName: claim.customerName || '',
                    projectCode: claim.projectCode || '',
                    projectName: claim.projectName || '',
                    productCode: claim.productCode || '',
                    productName: claim.productName || '',
                    claimQuantity: claim.claimQuantity || 0,
                    claimPrice: claim.claimPrice || 0,
                    claimReason: claim.claimReason || '',
                    claimStatus: claim.claimStatus || '',
                    employeeCode: claim.employeeCode || '',
                    employeeName: claim.employeeName || '',
                    expectedCompletionDate: claim.expectedCompletionDate ? new Date(claim.expectedCompletionDate).toISOString().split('T')[0] : '',
                    completionDate: claim.completionDate ? new Date(claim.completionDate).toISOString().split('T')[0] : '',
                    resolution: claim.resolution || '',
                    remark: claim.remark || '',
                    createdAt: claim.createdAt ? new Date(claim.createdAt).toISOString().split('T')[0] : '',
                    updatedAt: claim.updatedAt ? new Date(claim.updatedAt).toISOString().split('T')[0] : ''
                });

                // 데이터 행 스타일 적용
                row.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            });
        }

        // 파일명 생성
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const filename = `AS클레임관리_${searchKeyword ? `${searchKeyword}_` : ''}${timestamp}.xlsx`;

        // 응답 헤더 설정
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        });

        // 엑셀 파일 생성 및 전송
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(buffer);
    }

    /**
     * 클레임 등록용 엑셀 템플릿을 다운로드합니다
     */
    async downloadTemplate(res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('AS 클레임 등록 템플릿');

        // 컬럼 정의 (다운로드 데이터와 동일)
        worksheet.columns = [
            { header: '클레임일자*', key: 'claimDate', width: 15, style: { numFmt: '@' } },
            { header: '거래처명*', key: 'customerName', width: 25, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 25, style: { numFmt: '@' } },
            { header: '품목명*', key: 'productName', width: 25, style: { numFmt: '@' } },
            { header: '클레임수량*', key: 'claimQuantity', width: 12, style: { numFmt: '0' } },
            { header: '클레임단가*', key: 'claimPrice', width: 15, style: { numFmt: '#,##0' } },
            { header: '클레임사유*', key: 'claimReason', width: 30, style: { numFmt: '@' } },
            { header: '클레임상태', key: 'claimStatus', width: 12, style: { numFmt: '@' } },
            { header: '담당자명*', key: 'employeeName', width: 15, style: { numFmt: '@' } },
            { header: '예상완료일', key: 'expectedCompletionDate', width: 15, style: { numFmt: '@' } },
            { header: '처리완료일', key: 'completionDate', width: 15, style: { numFmt: '@' } },
            { header: '처리결과', key: 'resolution', width: 30, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 30, style: { numFmt: '@' } }
        ];

        // 헤더 스타일 적용
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 필수 컬럼을 빨간색으로 표시 (필수 필드만)
        ['A1', 'B1', 'D1', 'E1', 'F1', 'G1', 'I1'].forEach((addr) => {
            const cell = worksheet.getCell(addr);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // 예시 데이터 추가 (2행)
        const exampleData = {
            claimDate: '2025-01-15',
            customerName: '삼성전자',
            projectName: '스마트폰 개발',
            productName: '갤럭시 S25',
            claimQuantity: 10,
            claimPrice: 500000,
            claimReason: '화면 불량',
            claimStatus: '접수',
            employeeName: '김철수',
            expectedCompletionDate: '2025-01-20',
            completionDate: '',
            resolution: '',
            remark: '긴급 처리 요청'
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

        // 파일명 생성
        const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const filename = `AS클레임등록템플릿_${timestamp}.xlsx`;

        // 응답 헤더 설정
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        });

        // 엑셀 파일 생성 및 전송
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(buffer);
    }
}
