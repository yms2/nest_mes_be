import { Injectable } from "@nestjs/common";
import { Response } from "express";
import * as ExcelJS from 'exceljs';

@Injectable()
export class EquipmentDownloadService {
    async exportEquipmentInfos(rows: any[], res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('설비정보');

        worksheet.columns = [
            { header: '설비명', key: 'equipmentName', width: 20, style: { numFmt: '@' } },
            { header: '설비모델', key: 'equipmentModel', width: 20, style: { numFmt: '@' } },
<<<<<<< HEAD
            { header: '설비위치', key: 'equipmentLocation', width: 20, style: { numFmt: '@' } },
            { header: '설비담당자', key: 'equipmentWorker', width: 20, style: { numFmt: '@' } },
            { header: '설비구매일', key: 'equipmentPurchaseDate', width: 20, style: { numFmt: '@' } },
            { header: '설비구매가격', key: 'equipmentPurchasePrice', width: 20, style: { numFmt: '@' } },
            { header: '설비비고', key: 'equipmentNote', width: 20, style: { numFmt: '@' } },
=======
            { header: '구매처', key: 'equipmentPurchasePlace', width: 20, style: { numFmt: '@' } },
            { header: '구매일', key: 'equipmentPurchaseDate', width: 20, style: { numFmt: '@' } },
            { header: '구매가격', key: 'equipmentPurchasePrice', width: 20, style: { numFmt: '@' } },
            { header: '설비이력', key: 'equipmentHistory', width: 20, style: { numFmt: '@' } },
            { header: '담당자', key: 'equipmentWorker', width: 20, style: { numFmt: '@' } },
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1'].forEach((addr) => {
            const cell = worksheet.getCell(addr);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        rows.forEach((r) => {
            worksheet.addRow({
                equipmentName: r.equipment_name || r.equipmentName,
                equipmentModel: r.equipment_model || r.equipmentModel,
<<<<<<< HEAD
                equipmentLocation: r.equipment_location || r.equipmentLocation,
                equipmentWorker: r.equipment_worker || r.equipmentWorker,
                equipmentPurchaseDate: r.equipment_purchase_date || r.equipmentPurchaseDate,
                equipmentPurchasePrice: r.equipment_purchase_price || r.equipmentPurchasePrice,
                equipmentNote: r.equipment_note || r.equipmentNote,
                createdAt: r.created_at || r.createdAt ? this.formatDate(r.created_at || r.createdAt) : '',
=======
                equipmentPurchasePlace: r.equipment_purchase_place || r.equipmentPurchasePlace,
                equipmentPurchaseDate: r.equipment_purchase_date || r.equipmentPurchaseDate,
                equipmentPurchasePrice: r.equipment_purchase_price || r.equipmentPurchasePrice,
                equipmentHistory: r.equipment_history || r.equipmentHistory,
                equipmentWorker: r.equipment_worker || r.equipmentWorker,
>>>>>>> 9e66e6afe7e3c0a0016fc36fdd22c9d24b00ec04
            });
        });

        const colCount = worksheet.columns.length;
        const lastColumn = worksheet.getRow(1).getCell(colCount);
        worksheet.autoFilter = { from: 'A1', to: lastColumn.address };

        const fileName = encodeURIComponent('설비정보.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        await workbook.xlsx.write(res);
        res.end();
    }

    private formatDate(date: Date | string) {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }
}