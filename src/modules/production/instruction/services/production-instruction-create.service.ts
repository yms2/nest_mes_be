import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductionInstruction } from '../entities/production-instruction.entity';
import { ProductionPlan } from '@/modules/production/plan/entities/production-plan.entity';
import { 
  CreateProductionInstructionDto, 
  CreateProductionInstructionFromPlanDto
} from '../dto/create-production-instruction.dto';
import { UpdateProductionInstructionDto } from '../dto/update-production-instruction.dto';
import { QueryProductionInstructionDto } from '../dto/query-production-instruction.dto';

@Injectable()
export class ProductionInstructionService {
  constructor(
    @InjectRepository(ProductionInstruction)
    private readonly productionInstructionRepository: Repository<ProductionInstruction>,
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
  ) {}

  /**
   * 생산 지시를 생성합니다.
   * @param dto 생산 지시 생성 DTO
   * @param username 사용자명
   * @returns 생성된 생산 지시
   */
  async createProductionInstruction(
    dto: CreateProductionInstructionDto,
    username: string,
  ): Promise<ProductionInstruction> {
    // 생산 계획 존재 여부 확인
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { productionPlanCode: dto.productionPlanCode },
    });

    if (!productionPlan) {
      throw new NotFoundException(`생산 계획을 찾을 수 없습니다: ${dto.productionPlanCode}`);
    }

    // 생산 지시 코드 생성
    const productionInstructionCode = await this.generateProductionInstructionCode();

    // 생산 지시 생성
    const productionInstruction = this.productionInstructionRepository.create({
      productionInstructionCode,
      productionPlanCode: dto.productionPlanCode,
      productionInstructionQuantity: dto.productionInstructionQuantity,
      productionStartDate: new Date(dto.productionStartDate),
      productionCompletionDate: new Date(dto.productionCompletionDate),
      employeeCode: dto.employeeCode,
      employeeName: dto.employeeName,
      remark: dto.remark || '',
      createdBy: username,
      updatedBy: username,
    });

    return await this.productionInstructionRepository.save(productionInstruction);
  }

  /**
   * 생산 계획에서 생산 지시를 생성합니다.
   * @param dto 생산 계획 기반 생산 지시 생성 DTO
   * @param username 사용자명
   * @returns 생성된 생산 지시들
   */
  async createProductionInstructionFromPlan(
    dto: CreateProductionInstructionFromPlanDto,
    username: string,
  ): Promise<ProductionInstruction[]> {
    const productionInstructions: ProductionInstruction[] = [];

    for (const planCode of dto.productionPlanCodes) {
      // 생산 계획 조회
      const productionPlan = await this.productionPlanRepository.findOne({
        where: { productionPlanCode: planCode },
      });

      if (!productionPlan) {
        throw new NotFoundException(`생산 계획을 찾을 수 없습니다: ${planCode}`);
      }

      // 생산 지시 코드 생성
      const productionInstructionCode = await this.generateProductionInstructionCode();

      // 생산 지시 생성 (생산 계획의 수량을 사용)
      const productionInstruction = this.productionInstructionRepository.create({
        productionInstructionCode,
        productionPlanCode: planCode,
        productionInstructionQuantity: productionPlan.productionPlanQuantity,
        productionStartDate: new Date(dto.productionStartDate),
        productionCompletionDate: new Date(dto.productionCompletionDate),
        employeeCode: dto.employeeCode,
        employeeName: dto.employeeName,
        remark: dto.remark || '',
        createdBy: username,
        updatedBy: username,
      });

      productionInstructions.push(productionInstruction);
    }

    return await this.productionInstructionRepository.save(productionInstructions);
  }

  /**
   * 생산 지시를 수정합니다.
   * @param id 생산 지시 ID
   * @param updateData 수정할 데이터
   * @param username 사용자명
   * @returns 수정된 생산 지시
   */
  async updateProductionInstruction(
    id: number,
    updateData: UpdateProductionInstructionDto,
    username: string,
  ): Promise<ProductionInstruction> {
    const productionInstruction = await this.productionInstructionRepository.findOne({ 
      where: { id } 
    });

    if (!productionInstruction) {
      throw new NotFoundException(`생산 지시를 찾을 수 없습니다: ${id}`);
    }

    // 수정 가능한 필드들만 업데이트
    if (updateData.productionInstructionQuantity !== undefined) {
      productionInstruction.productionInstructionQuantity = updateData.productionInstructionQuantity;
    }
    if (updateData.productionStartDate) {
      productionInstruction.productionStartDate = new Date(updateData.productionStartDate);
    }
    if (updateData.productionCompletionDate) {
      productionInstruction.productionCompletionDate = new Date(updateData.productionCompletionDate);
    }
    if (updateData.employeeCode) {
      productionInstruction.employeeCode = updateData.employeeCode;
    }
    if (updateData.employeeName) {
      productionInstruction.employeeName = updateData.employeeName;
    }
    if (updateData.remark !== undefined) {
      productionInstruction.remark = updateData.remark;
    }

    productionInstruction.updatedBy = username;
    productionInstruction.updatedAt = new Date();

    return await this.productionInstructionRepository.save(productionInstruction);
  }

  /**
   * 생산 지시를 조회합니다.
   * @param id 생산 지시 ID
   * @returns 생산 지시 정보
   */
  async getProductionInstructionById(id: number): Promise<ProductionInstruction> {
    const productionInstruction = await this.productionInstructionRepository.findOne({
      where: { id },
    });

    if (!productionInstruction) {
      throw new NotFoundException(`생산 지시를 찾을 수 없습니다: ${id}`);
    }

    return productionInstruction;
  }

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
    const queryBuilder = this.createQueryBuilder(query || {});

    const offset = (page - 1) * limit;

    const result = await queryBuilder
      .skip(offset)
      .take(limit)
      .orderBy('productionInstruction.productionStartDate', 'DESC')
      .addOrderBy('productionInstruction.createdAt', 'DESC')
      .getRawAndEntities();

    const entities = result.entities;
    const rawData = result.raw;
    const total = await queryBuilder.getCount();

    // 생산 계획 정보를 포함한 데이터 변환
    const data = entities.map((entity, index) => {
      const raw = rawData[index];
      
      return {
        ...entity,
        // 생산 계획 정보 추가
        productionPlanInfo: {
          productCode: raw?.productCode,
          productName: raw?.productName,
          productType: raw?.productType,
          productSize: raw?.productSize,
          productionPlanQuantity: raw?.productionPlanQuantity,
        },
      };
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * 생산 계획 코드로 생산 지시를 조회합니다.
   * @param productionPlanCode 생산 계획 코드
   * @returns 해당 생산 계획의 생산 지시 목록
   */
  async getProductionInstructionsByPlanCode(productionPlanCode: string): Promise<ProductionInstruction[]> {
    return await this.productionInstructionRepository.find({
      where: { productionPlanCode },
      order: { productionStartDate: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * 생산 지시를 삭제합니다.
   * @param id 생산 지시 ID
   * @param username 사용자명
   */
  async deleteProductionInstruction(id: number, username: string): Promise<void> {
    const productionInstruction = await this.productionInstructionRepository.findOne({ 
      where: { id } 
    });

    if (!productionInstruction) {
      throw new NotFoundException(`생산 지시를 찾을 수 없습니다: ${id}`);
    }

    await this.productionInstructionRepository.update(id, {
      updatedBy: username,
      updatedAt: new Date(),
    });

    await this.productionInstructionRepository.remove(productionInstruction);
  }

  /**
   * 쿼리 빌더를 생성합니다.
   */
  private createQueryBuilder(query: QueryProductionInstructionDto): SelectQueryBuilder<ProductionInstruction> {
    const queryBuilder = this.productionInstructionRepository
      .createQueryBuilder('productionInstruction')
      .leftJoin('production_plan', 'productionPlan', 'productionInstruction.productionPlanCode = productionPlan.productionPlanCode')
      .addSelect([
        'productionPlan.productCode',
        'productionPlan.productName',
        'productionPlan.productType',
        'productionPlan.productSize',
        'productionPlan.productionPlanQuantity',
      ]);


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

    return queryBuilder;
  }

  /**
   * 생산 지시 코드를 생성합니다.
   * @returns 생성된 생산 지시 코드
   */
  private async generateProductionInstructionCode(): Promise<string> {
    const count = await this.productionInstructionRepository.count();
    const nextNumber = (count + 1).toString().padStart(6, '0');
    return `PI${nextNumber}`;
  }
}
