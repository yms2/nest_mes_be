import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomerInfoTemplateService {

    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('거래처정보양식');

        worksheet.columns = [
            { header: '거래처명', key: 'customerName', width: 20, style: { numFmt: '@' } },
            { header: '대표자명', key: 'customerCeo', width: 20, style: { numFmt: '@' } },
            { header: '사업자등록번호', key: 'customerBusinessNumber', width: 20, style: { numFmt: '@' } },
            { header: '법인번호', key: 'customerCorporateRegistrationNumber', width: 20, style: { numFmt: '@' } },
            { header: '거래구분', key: 'customerTradeType', width: 20, style: { numFmt: '@' } },
            { header: '업태', key: 'customerBusinessType', width: 20, style: { numFmt: '@' } },
            { header: '종목', key: 'customerBusinessItem', width: 20, style: { numFmt: '@' } },
            { header: '전화번호', key: 'customerTel', width: 20, style: { numFmt: '@' } },
            { header: '휴대전화', key: 'customerMobile', width: 20, style: { numFmt: '@' } },
            { header: '펙스번호', key: 'customerFax', width: 20, style: { numFmt: '@' } },
            { header: '대표이메일', key: 'customerEmail', width: 20, style: { numFmt: '@' } },
            { header: '계산서이메일', key: 'customerInvoiceEmail', width: 20, style: { numFmt: '@' } },
            { header: '우편번호', key: 'customerZipcode', width: 20, style: { numFmt: '@' } },
            { header: '주소', key: 'customerAddress', width: 20, style: { numFmt: '@' } },
            { header: '상세주소', key: 'customerAddressDetail', width: 20, style: { numFmt: '@' } },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1', 'B1', 'C1'].forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' },
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.numFmt = '@';
            });
        });

        const bufferData = await workbook.xlsx.writeBuffer();
        return Buffer.from(bufferData);
    }
}