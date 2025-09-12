import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WarehouseDownloadService {

    async exportWarehouseInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('창고관리');
        
        worksheet.columns = [
            { header: '창고코드', key: 'warehouseCode', width: 20, style: { numFmt: '@' } },
            { header: '창고명', key: 'warehouseName', width: 20, style: { numFmt: '@' } },
            { header: '창고위치', key: 'warehouseLocation', width: 20, style: { numFmt: '@' } },
            { header: '창고비고', key: 'warehouseBigo', width: 30, style: { numFmt: '@' } },
        ]

        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1'].forEach((addr) => {
            const cell = worksheet.getCell(addr);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    warehouseCode: row.warehouseCode || '',
                    warehouseName: row.warehouseName || '',
                    warehouseLocation: row.warehouseLocation || '',
                    warehouseBigo: row.warehouseBigo || '',
                });
            });
        }

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        const baseFileName = searchKeyword ? `창고관리_검색결과_${searchKeyword}` : '창고관리_전체목록';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }

    async exportEmptyWarehouseInfos(res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('창고관리');
        
        worksheet.columns = [
            { header: '창고코드', key: 'warehouseCode', width: 20, style: { numFmt: '@' } },
            { header: '창고명', key: 'warehouseName', width: 20, style: { numFmt: '@' } },
            { header: '창고위치', key: 'warehouseLocation', width: 20, style: { numFmt: '@' } },
            { header: '창고비고', key: 'warehouseBigo', width: 30, style: { numFmt: '@' } },
        ];
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1'].forEach((addr) => {
            const cell = worksheet.getCell(addr);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // 빈 데이터 행 추가 (검색 결과가 없음을 표시)
        worksheet.addRow({
            warehouseCode: '검색 결과가 없습니다',
            warehouseName: '',
            warehouseLocation: '',
            warehouseBigo: '',
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        const baseFileName = searchKeyword ? `창고관리_검색결과_${searchKeyword}` : '창고관리_전체목록';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
    }
}
