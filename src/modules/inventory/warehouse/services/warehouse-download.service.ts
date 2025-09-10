import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WarehouseDownloadService {
    async exportWarehouseInfos(rows: any[], res: Response, searchKeyword?: string) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('창고관리');
        
        worksheet.columns = [
            { header: '창고명', key: 'warehouseName', width: 20, style: { numFmt: '@' } },
            { header: '창고위치', key: 'warehouseLocation', width: 20, style: { numFmt: '@' } },
            { header: '창고비고', key: 'warehouseBigo', width: 20, style: { numFmt: '@' } },
        ];
        
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        
        if (rows && Array.isArray(rows)) {
            rows.forEach((row) => {
                worksheet.addRow({
                    warehouseName: row.warehouseName,
                    warehouseLocation: row.warehouseLocation,
                    warehouseBigo: row.warehouseBigo,
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
            { header: '창고명', key: 'warehouseName', width: 20, style: { numFmt: '@' } },
            { header: '창고위치', key: 'warehouseLocation', width: 20, style: { numFmt: '@' } },
            { header: '창고비고', key: 'warehouseBigo', width: 20, style: { numFmt: '@' } },
        ];
        
        
        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        
        
        worksheet.addRow({
            warehouseName: searchKeyword ? `"${searchKeyword}" 검색 결과가 없습니다.` : '데이터가 없습니다.',
            warehouseLocation: '',
            warehouseBigo: '',
        });
        
        
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });
        
        // 파일명 설정
        const baseFileName = searchKeyword ? `창고관리_검색결과_${searchKeyword}_빈데이터` : '창고관리_빈데이터';
        const fileName = encodeURIComponent(`${baseFileName}.xlsx`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        // 엑셀 파일 생성 및 응답
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(Buffer.from(buffer));
        
    }

}