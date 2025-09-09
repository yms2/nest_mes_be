import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class OrderManagementDownloadService {
    async exportOrderManagementInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('수주관리');

        worksheet.columns = [
            { header: '수주일', key: 'orderDate', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '수주구분', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '수량', key: 'quantity', width: 20, style: { numFmt: '@' } },
            { header: '단가', key: 'unitPrice', width: 20, style: { numFmt: '@' } },
            { header: '공급가액', key: 'supplyPrice', width: 20, style: { numFmt: '@' } },
            { header: '부가세', key: 'vat', width: 20, style: { numFmt: '@' } },
            { header: '합계', key: 'total', width: 20, style: { numFmt: '@' } },
            { header: '납품예정일', key: 'deliveryDate', width: 20, style: { numFmt: '@' } },
            { header: '참조견적', key: 'estimateCode', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ];

        // 헤더 스타일링
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    orderDate: row.orderDate,
                    customerName: row.customerName,
                    projectName: row.projectName,
                    productName: row.productName,
                    orderType: row.orderType,
                    quantity: row.quantity,
                    unitPrice: row.unitPrice,
                    supplyPrice: row.supplyPrice,
                    vat: row.vat,
                    total: row.total,
                    deliveryDate: row.deliveryDate,
                    estimateCode: row.estimateCode,
                    remark: row.remark,
                });
            });
        }

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        })

        const baseFileName = searchKeyword ? `수주관리_검색결과_${searchKeyword}` : '수주관리_전체목록';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // 엑셀 파일 생성 및 응답
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyOrderManagementInfos(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('수주관리');

        worksheet.columns = [
            { header: '수주일', key: 'orderDate', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '수주구분', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '수량', key: 'quantity', width: 20, style: { numFmt: '@' } },
            { header: '단가', key: 'unitPrice', width: 20, style: { numFmt: '@' } },
            { header: '공급가액', key: 'supplyPrice', width: 20, style: { numFmt: '@' } },
            { header: '부가세', key: 'vat', width: 20, style: { numFmt: '@' } },
            { header: '합계', key: 'total', width: 20, style: { numFmt: '@' } },
            { header: '납품예정일', key: 'deliveryDate', width: 20, style: { numFmt: '@' } },
            { header: '참조견적', key: 'estimateCode', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ];

        // 헤더 스타일링
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // 빈 데이터 메시지 추가
        worksheet.addRow({
            orderDate: searchKeyword ? `"${searchKeyword}" 검색 결과가 없습니다.` : '데이터가 없습니다.',
            customerName: '',
            projectName: '',
            productName: '',
            orderType: '',
            quantity: '',
            unitPrice: '',
            supplyPrice: '',
            vat: '',
            total: '',
            deliveryDate: '',
            estimateCode: '',
            remark: '',
        });

        // 모든 셀을 텍스트 형식으로 설정
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        // 파일명 설정
        const baseFileName = searchKeyword ? `수주관리_검색결과_${searchKeyword}_빈데이터` : '수주관리_빈데이터';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // 엑셀 파일 생성 및 응답
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}