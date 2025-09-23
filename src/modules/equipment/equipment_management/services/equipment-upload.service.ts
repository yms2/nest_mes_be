import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Equipment } from '../entities/equipment.entity';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { EquipmentCreateService } from './equipment-create.service';
import { logService } from 'src/modules/log/Services/log.service';

interface ExcelRowData {
  equipmentName: string;
  equipmentModel: string;
  equipmentPurchasePlace: string;
  equipmentPurchaseDate: string;
  equipmentPurchasePrice: number;
  equipmentHistory?: string;
  equipmentWorker?: string;
}

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
  details: Array<{
    row: number;
    status: 'success' | 'failed';
    errors?: string[];
    data?: any;
  }>;
}

@Injectable()
export class EquipmentUploadService {
  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    private readonly equipmentCreateService: EquipmentCreateService,
    private readonly logService: logService,
  ) {}

  /**
   * 엑셀 파일을 처리하여 설비정보를 일괄 등록합니다.
   * @param file 업로드된 엑셀 파일
   * @param username 사용자명
   * @returns 업로드 결과
   */
  async processExcelFile(file: Express.Multer.File, username: string = 'system'): Promise<UploadResult> {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file.buffer as any);
      
      // 시트 찾기 (여러 시트명 시도)
      let worksheet = workbook.getWorksheet('설비정보양식');
      if (!worksheet) {
        worksheet = workbook.getWorksheet('설비정보');
      }
      if (!worksheet) {
        worksheet = workbook.getWorksheet('Sheet1');
      }
      if (!worksheet) {
        worksheet = workbook.getWorksheet(0); // 첫 번째 시트
      }
      if (!worksheet) {
        // 사용 가능한 시트 목록 출력
        const sheetNames = workbook.worksheets.map(ws => ws.name);
        throw new BadRequestException(`설비정보 시트를 찾을 수 없습니다. 사용 가능한 시트: ${sheetNames.join(', ')}`);
      }

      // 헤더 검증 및 컬럼 매핑
      const columnMapping = this.validateHeadersAndGetMapping(worksheet);

      const results: UploadResult = {
        success: 0,
        failed: 0,
        errors: [],
        details: []
      };

      // 데이터 행 처리 (헤더 제외)
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        // 빈 행 건너뛰기
        if (this.isEmptyRow(row)) {
          continue;
        }

        try {
          const equipmentData = this.parseRowDataWithMapping(row, rowNumber, columnMapping);
          const validationResult = this.validateEquipmentData(equipmentData, rowNumber);
          
          if (!validationResult.isValid) {
            results.failed++;
            results.errors.push(`행 ${rowNumber}: ${validationResult.errors.join(', ')}`);
            results.details.push({
              row: rowNumber,
              status: 'failed',
              errors: validationResult.errors,
              data: equipmentData
            });
            continue;
          }

          // 설비 데이터 저장
          await this.saveEquipmentData(equipmentData, username);
          results.success++;
          results.details.push({
            row: rowNumber,
            status: 'success',
            data: equipmentData
          });

        } catch (error) {
          results.failed++;
          const errorMessage = `행 ${rowNumber}: ${error.message}`;
          results.errors.push(errorMessage);
          results.details.push({
            row: rowNumber,
            status: 'failed',
            errors: [error.message],
            data: null
          });
        }
      }

      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '설비관리 업로드',
        action: 'UPLOAD_SUCCESS',
        username,
        targetId: '',
        targetName: file.originalname,
        details: `설비정보 업로드 완료: 성공 ${results.success}개, 실패 ${results.failed}개`,
      });

      return results;

    } catch (error) {
      // 로그 기록
      await this.logService.createDetailedLog({
        moduleName: '설비관리 업로드',
        action: 'UPLOAD_FAIL',
        username,
        targetId: '',
        targetName: file?.originalname || '알 수 없음',
        details: `설비정보 업로드 실패: ${error.message}`,
      }).catch(() => {});

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`엑셀 파일 처리 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 빈 행인지 확인합니다.
   * @param row 엑셀 행
   * @returns 빈 행 여부
   */
  private isEmptyRow(row: ExcelJS.Row): boolean {
    const values = row.values as any[];
    return !values || values.length <= 1 || values.slice(1).every(val => val === undefined || val === null || val === '');
  }

  /**
   * 행 데이터를 파싱합니다.
   * @param row 엑셀 행
   * @param rowNumber 행 번호
   * @returns 파싱된 설비 데이터
   */
  private parseRowData(row: ExcelJS.Row, rowNumber: number): ExcelRowData {
    const values = row.values as any[];
    
    // 엑셀 컬럼 순서에 맞게 데이터 추출
    const equipmentData: ExcelRowData = {
      equipmentName: this.getStringValue(values[1]), // A열: 설비명
      equipmentModel: this.getStringValue(values[2]), // B열: 설비모델
      equipmentPurchasePlace: this.getStringValue(values[3]), // C열: 구매처
      equipmentPurchaseDate: this.getDateValue(values[4]), // D열: 구매일
      equipmentPurchasePrice: this.getNumberValue(values[5]), // E열: 구매가격
      equipmentHistory: this.getStringValue(values[6]), // F열: 설비이력
      equipmentWorker: this.getStringValue(values[7]), // G열: 담당자
    };

    return equipmentData;
  }

  /**
   * 컬럼 매핑을 사용하여 행 데이터를 파싱합니다.
   * @param row 엑셀 행
   * @param rowNumber 행 번호
   * @param columnMapping 컬럼 매핑 정보
   * @returns 파싱된 설비 데이터
   */
  private parseRowDataWithMapping(row: ExcelJS.Row, rowNumber: number, columnMapping: { [key: string]: number }): ExcelRowData {
    const equipmentData: ExcelRowData = {
      equipmentName: this.getCellValueByMapping(row, columnMapping.equipmentName),
      equipmentModel: this.getCellValueByMapping(row, columnMapping.equipmentModel),
      equipmentPurchasePlace: this.getCellValueByMapping(row, columnMapping.equipmentPurchasePlace),
      equipmentPurchaseDate: this.getDateValueByMapping(row, columnMapping.equipmentPurchaseDate),
      equipmentPurchasePrice: this.getNumberValueByMapping(row, columnMapping.equipmentPurchasePrice),
      equipmentHistory: this.getCellValueByMapping(row, columnMapping.equipmentHistory),
      equipmentWorker: this.getCellValueByMapping(row, columnMapping.equipmentWorker),
    };

    return equipmentData;
  }

  /**
   * 매핑된 컬럼에서 문자열 값을 가져옵니다.
   * @param row 엑셀 행
   * @param columnNumber 컬럼 번호
   * @returns 문자열 값
   */
  private getCellValueByMapping(row: ExcelJS.Row, columnNumber?: number): string {
    if (!columnNumber) return '';
    const cell = row.getCell(columnNumber);
    return this.getStringValue(cell.value);
  }

  /**
   * 매핑된 컬럼에서 날짜 값을 가져옵니다.
   * @param row 엑셀 행
   * @param columnNumber 컬럼 번호
   * @returns 날짜 문자열
   */
  private getDateValueByMapping(row: ExcelJS.Row, columnNumber?: number): string {
    if (!columnNumber) return '';
    const cell = row.getCell(columnNumber);
    return this.getDateValue(cell.value);
  }

  /**
   * 매핑된 컬럼에서 숫자 값을 가져옵니다.
   * @param row 엑셀 행
   * @param columnNumber 컬럼 번호
   * @returns 숫자 값
   */
  private getNumberValueByMapping(row: ExcelJS.Row, columnNumber?: number): number {
    if (!columnNumber) return 0;
    const cell = row.getCell(columnNumber);
    return this.getNumberValue(cell.value);
  }

  /**
   * 헤더를 검증하고 컬럼 매핑을 생성합니다.
   * @param worksheet 엑셀 워크시트
   * @returns 컬럼 매핑 정보
   */
  private validateHeadersAndGetMapping(worksheet: ExcelJS.Worksheet): { [key: string]: number } {
    const actualHeaders: string[] = [];
    
    // 실제 헤더 행의 모든 셀을 읽어옴
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      actualHeaders.push(cell.value?.toString().trim() || '');
    });

    // 첫 번째 셀이 비어있으면 헤더가 없다고 판단
    if (!actualHeaders[0] || actualHeaders[0].trim() === '') {
      throw new BadRequestException('엑셀 파일에 헤더 행이 없습니다. 첫 번째 행에 컬럼명이 있어야 합니다.');
    }

    // 필수 헤더 검증 및 매핑 (설비명만 필수)
    const requiredHeaders = [
      { key: 'equipmentName', alternatives: ['설비명', 'equipmentName', '장비명', '기계명'] }
    ];

    // 선택적 헤더들
    const optionalHeaders = [
      { key: 'equipmentModel', alternatives: ['설비모델', 'equipmentModel', '모델', '기계모델'] },
      { key: 'equipmentPurchasePlace', alternatives: ['구매처', 'equipmentPurchasePlace', '구매처명', '공급업체', '제조사'] },
      { key: 'equipmentPurchaseDate', alternatives: ['구매일', 'equipmentPurchaseDate', '구매날짜', '구입일'] },
      { key: 'equipmentPurchasePrice', alternatives: ['구매가격', 'equipmentPurchasePrice', '가격', '비용', '금액'] },
      { key: 'equipmentHistory', alternatives: ['설비이력', 'equipmentHistory', '이력', '비고', '설비비고'] },
      { key: 'equipmentWorker', alternatives: ['담당자', 'equipmentWorker', '담당자명', '관리자'] }
    ];

    const columnMapping: { [key: string]: number } = {};
    const missingHeaders: string[] = [];

    for (const requiredHeader of requiredHeaders) {
      let found = false;
      
      for (let i = 0; i < actualHeaders.length; i++) {
        const header = actualHeaders[i];
        if (requiredHeader.alternatives.some(alt => 
          header.toLowerCase().includes(alt.toLowerCase())
        )) {
          columnMapping[requiredHeader.key] = i + 1; // ExcelJS는 1부터 시작
          found = true;
          break;
        }
      }
      
      if (!found) {
        missingHeaders.push(requiredHeader.key);
      }
    }

    // 선택적 헤더들도 매핑에 추가
    for (const optionalHeader of optionalHeaders) {
      for (let i = 0; i < actualHeaders.length; i++) {
        const header = actualHeaders[i];
        if (optionalHeader.alternatives.some(alt => 
          header.toLowerCase().includes(alt.toLowerCase())
        )) {
          columnMapping[optionalHeader.key] = i + 1;
          break;
        }
      }
    }

    if (missingHeaders.length > 0) {
      throw new BadRequestException(`필수 컬럼이 누락되었습니다: ${missingHeaders.join(', ')}. 엑셀 파일의 첫 번째 행에 설비명 컬럼이 필요합니다.`);
    }

    return columnMapping;
  }

  /**
   * 문자열 값을 가져옵니다.
   * @param value 셀 값
   * @returns 문자열
   */
  private getStringValue(value: any): string {
    if (value === undefined || value === null) return '';
    return String(value).trim();
  }

  /**
   * 숫자 값을 가져옵니다.
   * @param value 셀 값
   * @returns 숫자
   */
  private getNumberValue(value: any): number {
    if (value === undefined || value === null || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * 날짜 값을 가져옵니다.
   * @param value 셀 값
   * @returns 날짜 문자열
   */
  private getDateValue(value: any): string {
    if (value === undefined || value === null || value === '') {
      return '';
    }
    
    // 엑셀 날짜 숫자인 경우
    if (typeof value === 'number') {
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    
    // 문자열인 경우
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    }
    
    // Date 객체인 경우
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    return '';
  }

  /**
   * 설비 데이터를 검증합니다.
   * @param data 설비 데이터
   * @param rowNumber 행 번호
   * @returns 검증 결과
   */
  private validateEquipmentData(data: ExcelRowData, rowNumber: number) {
    const errors: string[] = [];

    // 필수 필드 검증 (설비명만 필수)
    if (!data.equipmentName || data.equipmentName.trim() === '') {
      errors.push('설비명은 필수입니다');
    }

    // 구매일 형식 검증 (입력된 경우에만)
    if (data.equipmentPurchaseDate && data.equipmentPurchaseDate.trim() !== '') {
      const purchaseDate = new Date(data.equipmentPurchaseDate);
      if (isNaN(purchaseDate.getTime())) {
        errors.push('유효한 구매일 형식이 아닙니다 (YYYY-MM-DD)');
      }
    }

    // 구매가격 검증 (입력된 경우에만)
    if (data.equipmentPurchasePrice && data.equipmentPurchasePrice < 0) {
      errors.push('구매가격은 0 이상이어야 합니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 설비 데이터를 저장합니다.
   * @param data 설비 데이터
   * @param username 사용자명
   */
  private async saveEquipmentData(data: ExcelRowData, username: string) {
    // DTO 생성 (기본값 설정)
    const createEquipmentDto: CreateEquipmentDto = {
      equipmentName: data.equipmentName,
      equipmentModel: data.equipmentModel || '',
      equipmentPurchasePlace: data.equipmentPurchasePlace || '',
      equipmentPurchaseDate: data.equipmentPurchaseDate || new Date().toISOString().split('T')[0],
      equipmentPurchasePrice: data.equipmentPurchasePrice || 0,
      equipmentHistory: data.equipmentHistory || '',
      equipmentWorker: data.equipmentWorker || '',
    };

    // 설비 등록 (기존 서비스 활용)
    await this.equipmentCreateService.createEquipment(createEquipmentDto);
  }
}