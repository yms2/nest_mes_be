import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelTemplateService {
    async generateUploadTemplate(): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('직원정보양식');

        worksheet.columns = [
            { header: '사원명', key: 'employeeName', width: 20, style: { numFmt: '@' } },
            { header: '부서명', key: 'department', width: 20, style: { numFmt: '@' } },
            { header: '직급', key: 'position', width: 20, style: { numFmt: '@' } },
            { header: '성별', key: 'gender', width: 20, style: { numFmt: '@' } },
            { header: '내/외국인', key: 'domesticForeign', width: 20, style: { numFmt: '@' } },
            { header: '생년월일', key: 'birthday', width: 20, style: { numFmt: '@' } },
            { header: '휴대폰', key: 'employeePhone', width: 20, style: { numFmt: '@' } },
            { header: '이메일', key: 'employeeEmail', width: 20, style: { numFmt: '@' } },
            { header: '입사일', key: 'hireDate', width: 20, style: { numFmt: '@' } },
            { header: '퇴사일', key: 'resignationDate', width: 20, style: { numFmt: '@' } },
            { header: '우편번호', key: 'zipcode', width: 20, style: { numFmt: '@' } },
            { header: '주소', key: 'address', width: 20, style: { numFmt: '@' } },
            { header: '상세주소', key: 'addressDetail', width: 20, style: { numFmt: '@' } },
        ];

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'K1', 'L1'].forEach((address) => {
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