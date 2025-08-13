import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExportService {
    async exportEmployeeInfos(rows: any[], res: Response) {
        if (!rows || !Array.isArray(rows)) {
            rows = [];
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('직원정보');

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

        const header = worksheet.getRow(1);
        header.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'K1', 'L1'].forEach((address) => {
            const cell = worksheet.getCell(address);
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        rows.forEach((r) => {
            worksheet.addRow({
                employeeName: r.employeeName,
                department: r.department,
                position: r.position,
                gender: r.gender,
                domesticForeign: r.domesticForeign,
                birthday: r.birthday,
                employeePhone: r.employeePhone,
                employeeEmail: r.employeeEmail,
                hireDate: r.hireDate,
                resignationDate: r.resignationDate,
                zipcode: r.zipcode,
                address: r.address,
                addressDetail: r.addressDetail,
                createdAt: r.createdAt ? this.formatDate(r.createdAt) : '',
            });
        });

        const colCount = worksheet.columns.length;
        const lastColumn = worksheet.getRow(1).getCell(colCount);
        worksheet.autoFilter = { from: 'A1', to: lastColumn.address };

        const fileName = encodeURIComponent('직원정보.xlsx');
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