import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionPlan } from '../entities/production-plan.entity';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { CreateDirectProductionPlanDto, UpdateDirectProductionPlanDto } from '../dto/create-direct-production-plan.dto';
import { ProductionPlanCodeGenerator } from '../utils/production-plan-code-generator.util';

@Injectable()
export class DirectProductionPlanCreateService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
  ) {}

  /**
   * 직접 생산 계획을 생성합니다.
   * @param dto 직접 생산 계획 생성 DTO
   * @param username 사용자명
   * @returns 생성된 생산 계획
   */
  async createDirectProductionPlan(
    dto: CreateDirectProductionPlanDto,
    username: string,
  ): Promise<ProductionPlan> {
    // 품목 정보 조회 및 검증
    const product = await this.productRepository.findOne({
      where: { productCode: dto.productCode },
    });

    if (!product) {
      throw new NotFoundException(`품목을 찾을 수 없습니다: ${dto.productCode}`);
    }

    // 생산 계획 코드 생성
    const productionPlanCode = await ProductionPlanCodeGenerator.generateProductionPlanCode(
      this.productionPlanRepository,
    );

    // 생산 계획 생성
    const productionPlan = this.productionPlanRepository.create({
      productionPlanCode,
      productionPlanDate: new Date(dto.productionPlanDate),
      orderType: dto.orderType || '직접등록',
      projectCode: dto.projectCode || null,
      projectName: dto.projectName || null,
      customerCode: dto.customerCode || null,
      customerName: dto.customerName || null,
      productCode: dto.productCode,
      productName: dto.productName || product.productName, // DTO의 품목명 우선 사용
      productType: product.productType,
      productSize: product.productSize1 || '',
      productStock: parseInt(product.safeInventory) || 0,
      productionPlanQuantity: dto.productionPlanQuantity,
      expectedProductStock: (parseInt(product.safeInventory) || 0) + dto.productionPlanQuantity,
      expectedStartDate: new Date(dto.expectedStartDate),
      expectedCompletionDate: new Date(dto.expectedCompletionDate),
      employeeCode: dto.employeeCode,
      employeeName: dto.employeeName,
      remark: dto.remark || '',
      createdBy: username,
      updatedBy: username,
    } as ProductionPlan);

    const savedProductionPlan = await this.productionPlanRepository.save(productionPlan);
    return Array.isArray(savedProductionPlan) ? savedProductionPlan[0] : savedProductionPlan;
  }

  /**
   * 직접 생산 계획을 수정합니다.
   * @param id 생산 계획 ID
   * @param updateData 수정할 데이터
   * @param username 사용자명
   * @returns 수정된 생산 계획
   */
  async updateDirectProductionPlan(
    id: number,
    updateData: UpdateDirectProductionPlanDto,
    username: string,
  ): Promise<ProductionPlan> {
    const productionPlan = await this.productionPlanRepository.findOne({ where: { id } });

    if (!productionPlan) {
      throw new NotFoundException(`생산 계획을 찾을 수 없습니다: ${id}`);
    }

    // 수정 가능한 필드들만 업데이트
    if (updateData.productionPlanDate) {
      productionPlan.productionPlanDate = new Date(updateData.productionPlanDate);
    }
    if (updateData.productName) {
      productionPlan.productName = updateData.productName;
    }
    if (updateData.productionPlanQuantity !== undefined) {
      productionPlan.productionPlanQuantity = updateData.productionPlanQuantity;
      // 예상 재고 수량도 함께 업데이트
      productionPlan.expectedProductStock = (productionPlan.productStock || 0) + updateData.productionPlanQuantity;
    }
    if (updateData.expectedStartDate) {
      productionPlan.expectedStartDate = new Date(updateData.expectedStartDate);
    }
    if (updateData.expectedCompletionDate) {
      productionPlan.expectedCompletionDate = new Date(updateData.expectedCompletionDate);
    }
    if (updateData.employeeCode) {
      productionPlan.employeeCode = updateData.employeeCode;
    }
    if (updateData.employeeName) {
      productionPlan.employeeName = updateData.employeeName;
    }
    if (updateData.orderType !== undefined) {
      productionPlan.orderType = updateData.orderType;
    }
    if (updateData.projectCode !== undefined) {
      productionPlan.projectCode = updateData.projectCode;
    }
    if (updateData.projectName !== undefined) {
      productionPlan.projectName = updateData.projectName;
    }
    if (updateData.customerCode !== undefined) {
      productionPlan.customerCode = updateData.customerCode;
    }
    if (updateData.customerName !== undefined) {
      productionPlan.customerName = updateData.customerName;
    }
    if (updateData.remark !== undefined) {
      productionPlan.remark = updateData.remark;
    }

    productionPlan.updatedBy = username;
    productionPlan.updatedAt = new Date();

    return await this.productionPlanRepository.save(productionPlan);
  }

  /**
   * ID로 직접 생산 계획을 조회합니다.
   * @param id 생산 계획 ID
   * @returns 생산 계획 정보
   */
  async getDirectProductionPlanById(id: number): Promise<ProductionPlan> {
    const productionPlan = await this.productionPlanRepository.findOne({
      where: { id },
    });

    if (!productionPlan) {
      throw new NotFoundException(`생산 계획을 찾을 수 없습니다: ${id}`);
    }

    return productionPlan;
  }

  /**
   * 품목 코드로 직접 생산 계획을 조회합니다.
   * @param productCode 품목 코드
   * @returns 해당 품목의 생산 계획 목록
   */
  async getDirectProductionPlansByProduct(productCode: string): Promise<ProductionPlan[]> {
    return await this.productionPlanRepository.find({
      where: { productCode },
      order: { productionPlanDate: 'DESC', createdAt: 'DESC' },
    });
  }

}
