import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DeliveryDownloadService {
    async exportDeliveryInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('납품관리');
    
        worksheet.columns = [
            { header: '납품일자', key: 'deliveryDate', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '프로젝트명', key: 'projectName', width: 20, style: { numFmt: '@' } },
            { header: '수주유형', key: 'orderType', width: 20, style: { numFmt: '@' } },
            { header: '납품수량', key: 'deliveryQuantity', width: 20, style: { numFmt: '@' } },
            { header: '납품상태', key: 'deliveryStatus', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'remark', width: 20, style: { numFmt: '@' } },
        ];

        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        })

        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    deliveryCode: row.deliveryCode,
                    deliveryDate: row.deliveryDate,
                    shippingCode: row.shippingCode,
                    customerCode: row.customerCode,
                    customerName: row.customerName,
                    productCode: row.productCode,
                    productName: row.productName,
                    projectCode: row.projectCode,
                    projectName: row.projectName,
                    orderType: row.orderType,
                    deliveryQuantity: row.deliveryQuantity,
                    deliveryStatus: row.deliveryStatus,
                    remark: row.remark,
                });
            })
        }

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });
        
        const baseFileName = searchKeyword ? `납품관리_검색결과_${searchKeyword}` : '납품관리_전체목록';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}