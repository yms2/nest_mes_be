import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Production } from '../entities/production.entity';
import { ProductionInstruction } from '../../instruction/entities/production-instruction.entity';
import { ProductionPlan } from '../../plan/entities/production-plan.entity';
import { QueryProductionResultDto } from '../dto/query-production-result.dto';

@Injectable()
export class ProductionResultDownloadService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
  ) {}

  async downloadExcel(query?: QueryProductionResultDto): Promise<Buffer> {
    // 생산실적 데이터 조회 (기존 서비스 로직 재사용)
    const data = await this.getAllProductionResults(query || {});

    // 엑셀 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('생산실적');

    // 컬럼 정의
    const columns = [
      { header: '품목명', key: 'productName', width: 25 },
      { header: '품목구분', key: 'productType', width: 15 },
      { header: '품목규격', key: 'productSize', width: 20 },
      { header: '거래처명', key: 'customerName', width: 20 },
      { header: '프로젝트명', key: 'projectName', width: 20 },
      { header: '구분', key: 'orderType', width: 15 },
      { header: '계획수량', key: 'plannedQuantity', width: 12 },
      { header: '지시수량', key: 'instructionQuantity', width: 12 },
      { header: '실제수량', key: 'actualQuantity', width: 12 },
      { header: '불량수량', key: 'defectQuantity', width: 12 },
      { header: '생산상태', key: 'productionStatus', width: 15 },
      { header: '담당자명', key: 'employeeName', width: 15 },
      { header: '시작일', key: 'startDate', width: 15 },
      { header: '완료일', key: 'completionDate', width: 15 },
      { header: '계획시작일', key: 'expectedStartDate', width: 15 },
      { header: '계획완료일', key: 'expectedCompletionDate', width: 15 },
    ];

    worksheet.columns = columns;

    // 헤더 스타일 적용
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // 데이터 행 추가
    data.data.forEach((item, index) => {
      const row = worksheet.addRow({
        productName: item.productName,
        productType: item.productType,
        productSize: item.productSize,
        customerName: item.customerName,
        projectName: item.projectName,
        orderType: item.orderType,
        plannedQuantity: item.plannedQuantity,
        instructionQuantity: item.instructionQuantity,
        actualQuantity: item.actualQuantity,
        defectQuantity: item.defectQuantity,
        productionStatus: item.productionStatus,
        employeeName: item.employeeName,
        startDate: item.startDate,
        completionDate: item.completionDate,
        expectedStartDate: item.expectedStartDate,
        expectedCompletionDate: item.expectedCompletionDate,
      });

      // 데이터 행 스타일 적용 (기본 스타일만 적용)
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
      });
    });

    // 자동 필터는 제거 (기존 생산지시 다운로드와 동일하게)

    // 엑셀 파일을 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  private async getAllProductionResults(query: QueryProductionResultDto): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 1000 } = query;

    // 생산지시별로 그룹화된 결과를 조회
    const queryBuilder = this.createQueryBuilder(query);

    // 생산지시 코드별로 그룹화
    const groupedResults = await queryBuilder
      .select([
        'production.productionInstructionCode',
        'MIN(production.productCode) as productCode',
        'MIN(production.productName) as productName',
        'MIN(production.productType) as productType',
        'MIN(production.productSize) as productSize',
        'MAX(production.productionInstructionQuantity) as productionInstructionQuantity',
        'MIN(production.createdAt) as startDate',
        'MIN(production.createdAt) as createdAt',
        'CASE WHEN MAX(production.productionStatus) = \'최종완료\' THEN MAX(CASE WHEN production.productionStatus = \'최종완료\' THEN production.productionCompletionDate END) ELSE NULL END as completionDate',
        'MAX(production.employeeCode) as employeeCode',
        'MAX(production.employeeName) as employeeName',
        'MAX(production.productionStatus) as productionStatus',
        'SUM(production.productionDefectQuantity) as totalDefectQuantity',
        'SUM(production.productionCompletionQuantity) as totalCompletionQuantity',
        'COUNT(production.id) as processCount'
      ])
      .groupBy('production.productionInstructionCode')
      .orderBy('startDate', 'DESC')
      .getRawMany();

    const total = groupedResults.length;
    const offset = (page - 1) * limit;
    const paginatedResults = groupedResults.slice(offset, offset + limit);

    // 각 생산지시별로 상세 정보 조회
    const data = await Promise.all(
      paginatedResults.map(async (result) => {
        // 생산 지시 정보 조회
        const productionInstruction = await this.productionInstructionRepository.findOne({
          where: { productionInstructionCode: result.productionInstructionCode },
        });

        // 생산 계획 정보 조회
        const productionPlan = productionInstruction 
          ? await this.productionPlanRepository.findOne({
              where: { productionPlanCode: productionInstruction.productionPlanCode },
            })
          : null;

        // 해당 생산지시의 모든 공정 조회
        const allProcesses = await this.productionRepository.find({
          where: { productionInstructionCode: result.productionInstructionCode },
          order: { createdAt: 'ASC' }
        });

        // 실제 시작일과 완료일 계산
        const actualStartDate = allProcesses.length > 0 ? allProcesses[0].createdAt : result.startDate;
        const actualCompletionDate = allProcesses.some(p => p.productionStatus === '최종완료') 
          ? allProcesses.find(p => p.productionStatus === '최종완료')?.productionCompletionDate 
          : null;

        // 날짜를 YYYY-MM-DD 형식으로 변환
        const formatDate = (date: any): string | null => {
          if (!date) return null;
          const d = new Date(date);
          if (isNaN(d.getTime())) return null;
          return d.toISOString().split('T')[0];
        };

        return {
          productionInstructionCode: result.productionInstructionCode,
          productCode: result.productCode,
          productName: result.productName,
          productType: result.productType,
          productSize: result.productSize,
          orderType: productionPlan?.orderType || '',
          productionInstructionQuantity: productionInstruction?.productionInstructionQuantity || 0,
          totalDefectQuantity: result?.totalDefectQuantity || 0,
          totalCompletionQuantity: productionInstruction?.actualProductionQuantity || 0,
          productionStatus: this.convertProductionStatus(result.productionStatus),
          employeeCode: result.employeeCode,
          employeeName: result.employeeName,
          startDate: formatDate(actualStartDate),
          completionDate: formatDate(actualCompletionDate),
          
          // 거래처/프로젝트 정보
          customerName: productionPlan?.customerName || '',
          projectName: productionPlan?.projectName || '',

          expectedStartDate: productionPlan?.expectedStartDate || '',
          expectedCompletionDate: productionPlan?.expectedCompletionDate || '',

          // 계획 vs 실제
          plannedQuantity: productionPlan?.productionPlanQuantity || 0,
          instructionQuantity: productionInstruction?.productionInstructionQuantity || 0,
          actualQuantity: productionInstruction?.actualProductionQuantity || 0,
          defectQuantity: result?.totalDefectQuantity || 0,
          processCount: parseInt(result.processCount) || 0,
        };
      })
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  private createQueryBuilder(query: QueryProductionResultDto) {
    const queryBuilder = this.productionRepository
      .createQueryBuilder('production');

    // 검색 조건 적용
    if (query.productionInstructionCode) {
      queryBuilder.andWhere('production.productionInstructionCode LIKE :productionInstructionCode', {
        productionInstructionCode: `%${query.productionInstructionCode}%`,
      });
    }

    if (query.productCode) {
      queryBuilder.andWhere('production.productCode LIKE :productCode', {
        productCode: `%${query.productCode}%`,
      });
    }

    if (query.productName) {
      queryBuilder.andWhere('production.productName LIKE :productName', {
        productName: `%${query.productName}%`,
      });
    }

    if (query.productType) {
      queryBuilder.andWhere('production.productType LIKE :productType', {
        productType: `%${query.productType}%`,
      });
    }

    if (query.employeeCode) {
      queryBuilder.andWhere('production.employeeCode LIKE :employeeCode', {
        employeeCode: `%${query.employeeCode}%`,
      });
    }

    if (query.employeeName) {
      queryBuilder.andWhere('production.employeeName LIKE :employeeName', {
        employeeName: `%${query.employeeName}%`,
      });
    }

    if (query.productionStatus) {
      queryBuilder.andWhere('production.productionStatus = :productionStatus', {
        productionStatus: query.productionStatus,
      });
    }

    if (query.startDateFrom) {
      queryBuilder.andWhere('DATE(production.createdAt) >= :startDateFrom', {
        startDateFrom: query.startDateFrom,
      });
    }

    if (query.startDateTo) {
      queryBuilder.andWhere('DATE(production.createdAt) <= :startDateTo', {
        startDateTo: query.startDateTo,
      });
    }

    if (query.completionDateFrom) {
      queryBuilder.andWhere('DATE(production.productionCompletionDate) >= :completionDateFrom', {
        completionDateFrom: query.completionDateFrom,
      });
    }

    if (query.completionDateTo) {
      queryBuilder.andWhere('DATE(production.productionCompletionDate) <= :completionDateTo', {
        completionDateTo: query.completionDateTo,
      });
    }

    return queryBuilder;
  }

  private convertProductionStatus(status: string): string {
    switch (status) {
      case '최종완료': return '생산완료';
      case '공정완료': return '진행중';
      case '진행중': return '진행중';
      default: return '미진행';
    }
  }
}
