import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProductDownloadService {
    async exportProductInfos(rows: any[], res: Response) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('품목정보');

        worksheet.columns = [
            { header: '품목명', key: 'productName', width: 20, style: { numFmt: '@' } },
            { header: '품목구분', key: 'productType', width: 20, style: { numFmt: '@' } },
            { header: '분류', key: 'productCategory', width: 20, style: { numFmt: '@' } },
            { header: '규격1(kHz)', key: 'productSize1', width: 20, style: { numFmt: '@' } },
            { header: '규격2(재질, Type)', key: 'productSize2', width: 20, style: { numFmt: '@' } },
            { header: '거래처코드', key: 'customerCode', width: 20, style: { numFmt: '@' } },
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '발주단위', key: 'productOrderUnit', width: 20, style: { numFmt: '@' } },
            { header: '재고단위', key: 'productInventoryUnit', width: 20, style: { numFmt: '@' } },
            { header: '수량당 수량', key: 'unitQuantity', width: 20, style: { numFmt: '@' } },
            { header: '안전재고', key: 'safeInventory', width: 20, style: { numFmt: '@' } },
            { header: '입고/과세', key: 'taxType', width: 20, style: { numFmt: '@' } },
            { header: '매입단가', key: 'productPrice', width: 20, style: { numFmt: '@' } },
            { header: '출고/과세', key: 'taxTypeSale', width: 20, style: { numFmt: '@' } },
            { header: '매출단가', key: 'productPriceSale', width: 20, style: { numFmt: '@' } },
            { header: '홈페이지', key: 'productHomepage', width: 20, style: { numFmt: '@' } },
            { header: '비고', key: 'productBigo', width: 20, style: { numFmt: '@' } },
            { header: '등록일', key: 'createdAt', width: 19 },
        ];

        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1', 'B1'].forEach((addr) => {
            const cell = worksheet.getCell(addr);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          });

        rows.forEach((r) => {
            worksheet.addRow({
                productName: r.product_name || r.productName,
                productType: r.product_type || r.productType,
                productCategory: r.product_category || r.productCategory,
                productSize1: r.product_size1 || r.productSize1,
                productSize2: r.product_size2 || r.productSize2,
                customerCode: r.customer_code || r.customerCode,
                customerName: r.customerName || '',
                productOrderUnit: r.product_order_unit || r.productOrderUnit,
                productInventoryUnit: r.product_inventory_unit || r.productInventoryUnit,
                unitQuantity: r.unit_quantity || r.unitQuantity,
                safeInventory: r.safe_inventory || r.safeInventory,
                taxType: r.tax_type || r.taxType,
                productPrice: r.product_price || r.productPrice,
                taxTypeSale: r.tax_type_sale || r.taxTypeSale,
                productPriceSale: r.product_price_sale || r.productPriceSale,
                productHomepage: r.product_homepage || r.productHomepage,
                productBigo: r.product_bigo || r.productBigo,
                createdAt: r.created_at || r.createdAt ? this.formatDate(r.created_at || r.createdAt) : '',
            })    
        });

        const colCount = worksheet.columns.length;
        const lastColumn = worksheet.getRow(1).getCell(colCount);
        worksheet.autoFilter = { from: 'A1', to: lastColumn.address };

        const fileName = encodeURIComponent('품목정보.xlsx');
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