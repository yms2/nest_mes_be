import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

@Injectable()
export class BomExcelService {
  generateBomTemplate(): Buffer {
    const header = [['상위품목명', '품목명', '수량', '단위']];

    const worksheet = XLSX.utils.aoa_to_sheet(header);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BOM 업로드 양식');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
