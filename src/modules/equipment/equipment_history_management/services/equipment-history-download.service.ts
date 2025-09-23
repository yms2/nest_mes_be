import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { EquipmentHistory } from '../entities/equipment-history.entity';

@Injectable()
export class EquipmentHistoryDownloadService {
  constructor(
    @InjectRepository(EquipmentHistory)
    private readonly equipmentHistoryRepository: Repository<EquipmentHistory>,
  ) {}

  /**
   * 설비 코드로 이력을 조회하고 엑셀로 다운로드합니다.
   * @param equipmentCode 설비 코드
   * @param searchConditions 추가 검색 조건
   * @returns 엑셀 파일 버퍼와 설비명
   */
  async downloadEquipmentHistoryByCode(
    equipmentCode: string,
    searchConditions?: {
      equipmentName?: string;
      employeeName?: string;
      equipmentHistory?: string;
      equipmentRepair?: string;
    }
  ): Promise<{ buffer: Buffer; equipmentName: string }> {
    if (!equipmentCode || equipmentCode.trim() === '') {
      throw new BadRequestException('설비 코드를 입력해주세요.');
    }

    const whereConditions: any = {
      equipmentCode: equipmentCode.trim(),
    };

    // 추가 검색 조건 적용
    if (searchConditions?.equipmentName) {
      whereConditions.equipmentName = Like(`%${searchConditions.equipmentName}%`);
    }

    if (searchConditions?.employeeName) {
      whereConditions.employeeName = Like(`%${searchConditions.employeeName}%`);
    }

    if (searchConditions?.equipmentHistory) {
      whereConditions.equipmentHistory = Like(`%${searchConditions.equipmentHistory}%`);
    }

    if (searchConditions?.equipmentRepair) {
      whereConditions.equipmentRepair = Like(`%${searchConditions.equipmentRepair}%`);
    }

    // 설비 이력 조회
    const equipmentHistories = await this.equipmentHistoryRepository.find({
      where: whereConditions,
      order: { equipmentDate: 'DESC' },
    });

    if (!equipmentHistories || equipmentHistories.length === 0) {
      throw new BadRequestException(`설비 코드 ${equipmentCode}에 해당하는 이력을 찾을 수 없습니다.`);
    }

    // 설비명 추출 (첫 번째 레코드에서)
    const equipmentName = equipmentHistories[0]?.equipmentName || equipmentCode;

    // 엑셀 파일 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('설비이력');

    // 컬럼 설정
    worksheet.columns = [
      { header: '설비이력코드', key: 'equipmentHistoryCode', width: 15 },
      { header: '설비코드', key: 'equipmentCode', width: 15 },
      { header: '설비명', key: 'equipmentName', width: 20 },
      { header: '고장일자', key: 'equipmentDate', width: 15 },
      { header: '고장내역', key: 'equipmentHistory', width: 25 },
      { header: '점검및수리', key: 'equipmentRepair', width: 25 },
      { header: '비용', key: 'equipmentCost', width: 15 },
      { header: '담당자코드', key: 'employeeCode', width: 15 },
      { header: '담당자명', key: 'employeeName', width: 15 },
      { header: '비고', key: 'remark', width: 30 },
      { header: '등록일시', key: 'createdAt', width: 20 },
    ];

    // 헤더 스타일 적용 (다른 모듈과 동일한 스타일)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // 데이터 추가
    equipmentHistories.forEach((history) => {
      worksheet.addRow({
        equipmentHistoryCode: history.equipmentHistoryCode || '',
        equipmentCode: history.equipmentCode || '',
        equipmentName: history.equipmentName || '',
        equipmentDate: history.equipmentDate ? this.formatDate(history.equipmentDate) : '',
        equipmentHistory: history.equipmentHistory || '',
        equipmentRepair: history.equipmentRepair || '',
        equipmentCost: history.equipmentCost || 0,
        employeeCode: history.employeeCode || '',
        employeeName: history.employeeName || '',
        remark: history.remark || '',
        createdAt: history.createdAt ? this.formatDateTime(history.createdAt) : '',
      });
    });

    // 모든 데이터 셀에 텍스트 포맷 적용
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // 헤더 제외
        row.eachCell((cell) => {
          cell.numFmt = '@'; // 텍스트 포맷
        });
      }
    });

    // 자동 필터 설정
    worksheet.autoFilter = 'A1:K1';

    // 엑셀 파일을 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer: Buffer.from(buffer), equipmentName };
  }


  /**
   * 날짜를 YYYY-MM-DD 형식으로 포맷합니다.
   * @param date 날짜
   * @returns 포맷된 날짜 문자열
   */
  private formatDate(date: any): string {
    if (!date) return '';
    
    // Date 객체가 아닌 경우 Date 객체로 변환
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  }

  /**
   * 날짜시간을 YYYY-MM-DD HH:mm:ss 형식으로 포맷합니다.
   * @param date 날짜시간
   * @returns 포맷된 날짜시간 문자열
   */
  private formatDateTime(date: any): string {
    if (!date) return '';
    
    // Date 객체가 아닌 경우 Date 객체로 변환
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().replace('T', ' ').split('.')[0];
  }
}
