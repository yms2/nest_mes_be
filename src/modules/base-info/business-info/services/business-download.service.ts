import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExportService {
  async exportBusinessInfos(rows: any[], res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('사업장정보');

    // 1) 컬럼 정의 (텍스트 서식 고정: numFmt: '@')
    worksheet.columns = [
      { header: '사업장명', key: 'businessName', width: 20, style: { numFmt: '@' } },
      { header: '대표자명', key: 'businessCeo', width: 20, style: { numFmt: '@' } },
      { header: '사업자등록번호', key: 'businessNumber', width: 20, style: { numFmt: '@' } },
      { header: '법인번호', key: 'corporateRegistrationNumber', width: 20, style: { numFmt: '@' } },
      { header: '업태', key: 'businessType', width: 20, style: { numFmt: '@' } },
      { header: '종목', key: 'businessItem', width: 20, style: { numFmt: '@' } },
      { header: '전화번호', key: 'businessTel', width: 20, style: { numFmt: '@' } },
      { header: '휴대전화', key: 'businessMobile', width: 20, style: { numFmt: '@' } },
      { header: '우편번호', key: 'businessZipcode', width: 12, style: { numFmt: '@' } },
      { header: '주소', key: 'businessAddress', width: 30, style: { numFmt: '@' } },
      { header: '상세주소', key: 'businessAddressDetail', width: 30, style: { numFmt: '@' } },
      { header: '대표이메일', key: 'businessCeoEmail', width: 25, style: { numFmt: '@' } },
      { header: '등록일', key: 'createdAt', width: 19 },
    ];

    // 2) 헤더 스타일
    const header = worksheet.getRow(1);
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // 필수 컬럼(예: A, B, C)을 빨간색으로
    ['A1', 'B1', 'C1'].forEach((addr) => {
      const cell = worksheet.getCell(addr);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // 3) 데이터 주입
    rows.forEach((r) => {
      worksheet.addRow({
        businessName: r.businessName,
        businessCeo: r.businessCeo,
        businessNumber: r.businessNumber,
        corporateRegistrationNumber: r.corporateRegistrationNumber,
        businessType: r.businessType,
        businessItem: r.businessItem,
        businessTel: r.businessTel,
        businessMobile: r.businessMobile,
        businessZipcode: r.businessZipcode,
        businessAddress: r.businessAddress,
        businessAddressDetail: r.businessAddressDetail,
        businessCeoEmail: r.businessCeoEmail,
        createdAt: r.createdAt ? this.formatDate(r.createdAt) : '',
      });
    });

    // 4) UX: 필터/고정행
    const colCount = worksheet.columns.length;
    const lastColumn = worksheet.getRow(1).getCell(colCount);
    worksheet.autoFilter = { from: 'A1', to: lastColumn.address };

    // 5) 응답 헤더 & 스트리밍
    const fileName = encodeURIComponent('사업장정보.xlsx');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    await workbook.xlsx.write(res); // 스트리밍(대용량에 유리)
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
