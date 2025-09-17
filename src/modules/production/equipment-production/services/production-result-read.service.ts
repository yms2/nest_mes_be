import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Production } from '../entities/production.entity';
import { ProductionInstruction } from '@/modules/production/instruction/entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { QueryProductionResultDto } from '../dto/query-production-result.dto';

@Injectable()
export class ProductionResultReadService {
  constructor(
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
  ) {}

  async getAllProductionResults(
    page: number = 1,
    limit: number = 20,
    query?: QueryProductionResultDto,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    // 생산지시별로 그룹화된 결과를 조회
    const queryBuilder = this.createQueryBuilder(query || {});

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

        // 해당 생산지시의 모든 공정 조회 (디버깅용)
        const allProcesses = await this.productionRepository.find({
          where: { productionInstructionCode: result.productionInstructionCode },
          order: { createdAt: 'ASC' }
        });

        const finalResult = {
          productionInstructionCode: result.productionInstructionCode,
          productCode: result.productCode,
          productName: result.productName,
          productType: result.productType,
          productSize: result.productSize,
          orderType: productionPlan?.orderType || '',
          productionInstructionQuantity: productionInstruction?.productionInstructionQuantity || 0,
          totalDefectQuantity: result?.totalDefectQuantity || 0, // 생산지시 테이블에서 가져옴
          totalCompletionQuantity: productionInstruction?.actualProductionQuantity || 0, // 생산지시 테이블에서 가져옴
          productionStatus: this.convertProductionStatus(result.productionStatus),
          employeeCode: result.employeeCode,
          employeeName: result.employeeName,
          startDate: result.startDate,
          completionDate: result.completionDate,
          
          // 거래처/프로젝트 정보 (상단에 추가)
          customerName: productionPlan?.customerName || '',
          projectName: productionPlan?.projectName || '',

          expectedStartDate: productionPlan?.expectedStartDate || '',
          expectedCompletionDate: productionPlan?.expectedCompletionDate || '',

        };

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

        // 실제 계산된 날짜로 업데이트 (YYYY-MM-DD 형식)
        finalResult.startDate = formatDate(actualStartDate);
        finalResult.completionDate = formatDate(actualCompletionDate);

        return finalResult;
      })
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * 생산 상태를 변환합니다.
   * @param status 원본 생산 상태
   * @returns 변환된 생산 상태
   */
  private convertProductionStatus(status: string): string {
    switch (status) {
      case '최종완료':
        return '생산완료';
      case '공정완료':
        return '진행중';
      case '진행중':
        return '진행중';
      default:
        return '미진행';
    }
  }

  private createQueryBuilder(query: QueryProductionResultDto): SelectQueryBuilder<Production> {
    const queryBuilder = this.productionRepository
      .createQueryBuilder('production');

    if (query.productionCode) {
      queryBuilder.andWhere('production.productionCode LIKE :productionCode', {
        productionCode: `%${query.productionCode}%`,
      });
    }

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

    if (query.productionStatus) {
      queryBuilder.andWhere('production.productionStatus = :productionStatus', {
        productionStatus: query.productionStatus,
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

    if (query.startDateFrom) {
      queryBuilder.andWhere('production.createdAt >= :startDateFrom', {
        startDateFrom: query.startDateFrom,
      });
    }

    if (query.startDateTo) {
      queryBuilder.andWhere('production.createdAt <= :startDateTo', {
        startDateTo: query.startDateTo,
      });
    }

    if (query.completionDateFrom) {
      queryBuilder.andWhere('production.productionCompletionDate >= :completionDateFrom', {
        completionDateFrom: query.completionDateFrom,
      });
    }

    if (query.completionDateTo) {
      queryBuilder.andWhere('production.productionCompletionDate <= :completionDateTo', {
        completionDateTo: query.completionDateTo,
      });
    }

    return queryBuilder;
  }
}
