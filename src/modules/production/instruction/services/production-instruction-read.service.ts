import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductionInstruction } from '../entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { QueryProductionInstructionDto } from '../dto/query-production-instruction.dto';

@Injectable()
export class ProductionInstructionReadService {
  constructor(
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
  ) {}

  /**
   * 생산 지시 목록을 조회합니다.
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @param query 검색 조건
   * @returns 생산 지시 목록
   */
  async getAllProductionInstructions(
    page: number = 1,
    limit: number = 20,
    query?: QueryProductionInstructionDto,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    // 생산 계획 조건이 있는 경우 JOIN 쿼리 사용
    if (query?.customerName || query?.projectName || query?.productName || query?.productType) {
      return await this.getProductionInstructionsWithPlanFilters(page, limit, query);
    }

    const queryBuilder = this.createQueryBuilder(query || {});

    const offset = (page - 1) * limit;

    const result = await queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('productionInstruction.productionStartDate', 'DESC')
      .addOrderBy('productionInstruction.createdAt', 'DESC')
      .getMany();

    const total = await queryBuilder.getCount();

    // 각 생산 지시에 대해 생산 계획 정보를 별도로 조회
    const data = await Promise.all(
      result.map(async (entity) => {
        const productionPlan = await this.productionPlanRepository.findOne({
          where: { productionPlanCode: entity.productionPlanCode },
        });

        return {
          ...entity,
          productionPlanInfo: productionPlan ? {
            productCode: productionPlan.productCode,
            productName: productionPlan.productName,
            productType: productionPlan.productType,
            productSize: productionPlan.productSize,
            productionPlanQuantity: productionPlan.productionPlanQuantity,
            expectedStartDate: productionPlan.expectedStartDate,
            expectedCompletionDate: productionPlan.expectedCompletionDate,
            orderType: productionPlan.orderType,
            projectCode: productionPlan.projectCode,
            projectName: productionPlan.projectName,
            customerCode: productionPlan.customerCode,
            customerName: productionPlan.customerName,
          } : null,
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

  /**
   * ID로 생산 지시를 조회합니다.
   * @param id 생산 지시 ID
   * @returns 생산 지시 정보
   */
  async getProductionInstructionById(id: number): Promise<any> {
    const entity = await this.productionInstructionRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new NotFoundException(`생산 지시를 찾을 수 없습니다: ${id}`);
    }

    const productionPlan = await this.productionPlanRepository.findOne({
      where: { productionPlanCode: entity.productionPlanCode },
    });

    return {
      ...entity,
      productionPlanInfo: productionPlan ? {
        productCode: productionPlan.productCode,
        productName: productionPlan.productName,
        productType: productionPlan.productType,
        productSize: productionPlan.productSize,
        productionPlanQuantity: productionPlan.productionPlanQuantity,
        expectedStartDate: productionPlan.expectedStartDate,
        expectedCompletionDate: productionPlan.expectedCompletionDate,
        orderType: productionPlan.orderType,
        projectCode: productionPlan.projectCode,
        projectName: productionPlan.projectName,
        customerCode: productionPlan.customerCode,
        customerName: productionPlan.customerName,
      } : null,
    };
  }

  /**
   * 생산 계획 코드로 생산 지시를 조회합니다.
   * @param productionPlanCode 생산 계획 코드
   * @returns 해당 생산 계획의 생산 지시 목록
   */
  async getProductionInstructionsByPlanCode(productionPlanCode: string): Promise<any[]> {
    const entities = await this.productionInstructionRepository.find({
      where: { productionPlanCode },
      order: { productionStartDate: 'DESC', createdAt: 'DESC' },
    });

    const productionPlan = await this.productionPlanRepository.findOne({
      where: { productionPlanCode },
    });

    return entities.map((entity) => ({
      ...entity,
      productionPlanInfo: productionPlan ? {
        productCode: productionPlan.productCode,
        productName: productionPlan.productName,
        productType: productionPlan.productType,
        productSize: productionPlan.productSize,
        productionPlanQuantity: productionPlan.productionPlanQuantity,
        expectedStartDate: productionPlan.expectedStartDate,
        expectedCompletionDate: productionPlan.expectedCompletionDate,
        orderType: productionPlan.orderType,
        projectCode: productionPlan.projectCode,
        projectName: productionPlan.projectName,
        customerCode: productionPlan.customerCode,
        customerName: productionPlan.customerName,
      } : null,
    }));
  }

  /**
   * 사원 코드로 생산 지시를 조회합니다.
   * @param employeeCode 사원 코드
   * @returns 해당 사원의 생산 지시 목록
   */
  async getProductionInstructionsByEmployee(employeeCode: string): Promise<any[]> {
    const entities = await this.productionInstructionRepository.find({
      where: { employeeCode },
      order: { productionStartDate: 'DESC', createdAt: 'DESC' },
    });

    return await Promise.all(
      entities.map(async (entity) => {
        const productionPlan = await this.productionPlanRepository.findOne({
          where: { productionPlanCode: entity.productionPlanCode },
        });

        return {
          ...entity,
          productionPlanInfo: productionPlan ? {
            productCode: productionPlan.productCode,
            productName: productionPlan.productName,
            productType: productionPlan.productType,
            productSize: productionPlan.productSize,
            productionPlanQuantity: productionPlan.productionPlanQuantity,
            expectedStartDate: productionPlan.expectedStartDate,
            expectedCompletionDate: productionPlan.expectedCompletionDate,
            orderType: productionPlan.orderType,
            projectCode: productionPlan.projectCode,
            projectName: productionPlan.projectName,
            customerCode: productionPlan.customerCode,
            customerName: productionPlan.customerName,
          } : null,
        };
      })
    );
  }

  /**
   * 날짜 범위로 생산 지시를 조회합니다.
   * @param startDate 시작일
   * @param endDate 종료일
   * @returns 해당 기간의 생산 지시 목록
   */
  async getProductionInstructionsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const entities = await this.productionInstructionRepository
      .createQueryBuilder('productionInstruction')
      .where('productionInstruction.productionStartDate >= :startDate', { startDate })
      .andWhere('productionInstruction.productionStartDate <= :endDate', { endDate })
      .orderBy('productionInstruction.productionStartDate', 'ASC')
      .addOrderBy('productionInstruction.createdAt', 'DESC')
      .getMany();

    return await Promise.all(
      entities.map(async (entity) => {
        const productionPlan = await this.productionPlanRepository.findOne({
          where: { productionPlanCode: entity.productionPlanCode },
        });

        return {
          ...entity,
          productionPlanInfo: productionPlan ? {
            productCode: productionPlan.productCode,
            productName: productionPlan.productName,
            productType: productionPlan.productType,
            productSize: productionPlan.productSize,
            productionPlanQuantity: productionPlan.productionPlanQuantity,
            expectedStartDate: productionPlan.expectedStartDate,
            expectedCompletionDate: productionPlan.expectedCompletionDate,
            orderType: productionPlan.orderType,
            projectCode: productionPlan.projectCode,
            projectName: productionPlan.projectName,
            customerCode: productionPlan.customerCode,
            customerName: productionPlan.customerName,
          } : null,
        };
      })
    );
  }

  /**
   * 생산 계획 필터를 사용한 생산 지시 조회
   */
  private async getProductionInstructionsWithPlanFilters(
    page: number,
    limit: number,
    query: QueryProductionInstructionDto,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.productionInstructionRepository
      .createQueryBuilder('productionInstruction')
      .leftJoin(ProductionPlan, 'productionPlan', 'productionInstruction.productionPlanCode = productionPlan.productionPlanCode');


    if (query.employeeName) {
      queryBuilder.andWhere('productionInstruction.employeeName LIKE :employeeName', {
        employeeName: `%${query.employeeName}%`,
      });
    }

    if (query.startDateFrom) {
      queryBuilder.andWhere('productionInstruction.productionStartDate >= :startDateFrom', {
        startDateFrom: query.startDateFrom,
      });
    }

    if (query.startDateTo) {
      queryBuilder.andWhere('productionInstruction.productionStartDate <= :startDateTo', {
        startDateTo: query.startDateTo,
      });
    }

    if (query.completionDateFrom) {
      queryBuilder.andWhere('productionInstruction.productionCompletionDate >= :completionDateFrom', {
        completionDateFrom: query.completionDateFrom,
      });
    }

    if (query.completionDateTo) {
      queryBuilder.andWhere('productionInstruction.productionCompletionDate <= :completionDateTo', {
        completionDateTo: query.completionDateTo,
      });
    }

    // 생산 계획 조건
    if (query.customerName) {
      queryBuilder.andWhere('productionPlan.customerName LIKE :customerName', {
        customerName: `%${query.customerName}%`,
      });
    }

    if (query.projectName) {
      queryBuilder.andWhere('productionPlan.projectName LIKE :projectName', {
        projectName: `%${query.projectName}%`,
      });
    }

    if (query.productName) {
      queryBuilder.andWhere('productionPlan.productName LIKE :productName', {
        productName: `%${query.productName}%`,
      });
    }

    if (query.productType) {
      queryBuilder.andWhere('productionPlan.productType LIKE :productType', {
        productType: `%${query.productType}%`,
      });
    }

    const offset = (page - 1) * limit;

    const result = await queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('productionInstruction.productionStartDate', 'DESC')
      .addOrderBy('productionInstruction.createdAt', 'DESC')
      .getMany();

    const total = await queryBuilder.getCount();

    // 각 생산 지시에 대해 생산 계획 정보를 별도로 조회
    const data = await Promise.all(
      result.map(async (entity) => {
        const productionPlan = await this.productionPlanRepository.findOne({
          where: { productionPlanCode: entity.productionPlanCode },
        });

        return {
          ...entity,
          productionPlanInfo: productionPlan ? {
            productCode: productionPlan.productCode,
            productName: productionPlan.productName,
            productType: productionPlan.productType,
            productSize: productionPlan.productSize,
            productionPlanQuantity: productionPlan.productionPlanQuantity,
            expectedStartDate: productionPlan.expectedStartDate,
            expectedCompletionDate: productionPlan.expectedCompletionDate,
            orderType: productionPlan.orderType,
            projectCode: productionPlan.projectCode,
            projectName: productionPlan.projectName,
            customerCode: productionPlan.customerCode,
            customerName: productionPlan.customerName,
          } : null,
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

  /**
   * 쿼리 빌더를 생성합니다.
   */
  private createQueryBuilder(query: QueryProductionInstructionDto): SelectQueryBuilder<ProductionInstruction> {
    const queryBuilder = this.productionInstructionRepository
      .createQueryBuilder('productionInstruction');



    if (query.employeeName) {
      queryBuilder.andWhere('productionInstruction.employeeName LIKE :employeeName', {
        employeeName: `%${query.employeeName}%`,
      });
    }

    if (query.startDateFrom) {
      queryBuilder.andWhere('productionInstruction.productionStartDate >= :startDateFrom', {
        startDateFrom: query.startDateFrom,
      });
    }

    if (query.startDateTo) {
      queryBuilder.andWhere('productionInstruction.productionStartDate <= :startDateTo', {
        startDateTo: query.startDateTo,
      });
    }

    if (query.completionDateFrom) {
      queryBuilder.andWhere('productionInstruction.productionCompletionDate >= :completionDateFrom', {
        completionDateFrom: query.completionDateFrom,
      });
    }

    if (query.completionDateTo) {
      queryBuilder.andWhere('productionInstruction.productionCompletionDate <= :completionDateTo', {
        completionDateTo: query.completionDateTo,
      });
    }

    return queryBuilder;
  }
}
