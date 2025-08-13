import * as ExcelJS from 'exceljs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelTemplateService {
  async generateUploadTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('사업장정보양식');

    // 헤더 + 텍스트형식 설정
    worksheet.columns = [
      { header: '사업장명', key: 'businessName', width: 20, style: { numFmt: '@' } },
      { header: '대표자명', key: 'businessCeo', width: 20, style: { numFmt: '@' } },
      { header: '사업자등록번호', key: 'businessNumber', width: 20, style: { numFmt: '@' } },
      { header: '법인번호', key: 'corporateRegistrationNumber', width: 20, style: { numFmt: '@' } },
      { header: '업태', key: 'businessType', width: 20, style: { numFmt: '@' } },
      { header: '종목', key: 'businessItem', width: 20, style: { numFmt: '@' } },
      { header: '전화번호', key: 'businessTel', width: 20, style: { numFmt: '@' } },
      { header: '휴대전화', key: 'businessMobile', width: 20, style: { numFmt: '@' } },
      { header: '우편번호', key: 'businessZipcode', width: 20, style: { numFmt: '@' } },
      { header: '주소', key: 'businessAddress', width: 20, style: { numFmt: '@' } },
      { header: '상세주소', key: 'businessAddressDetail', width: 20, style: { numFmt: '@' } },
      { header: '대표이메일', key: 'businessCeoEmail', width: 20, style: { numFmt: '@' } },
    ];

    // 헤더 스타일
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // 필수 컬럼 표시 (A1, B1, C1만 빨간색)
    ['A1', 'B1', 'C1'].forEach((address) => {
      const cell = worksheet.getCell(address);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF0000' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // 모든 셀을 텍스트 형식으로 지정 (추가 보정)
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.numFmt = '@';
      });
    });

    const bufferData = await workbook.xlsx.writeBuffer();
    return Buffer.from(bufferData);
  }
}
