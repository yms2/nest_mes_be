import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionPlan } from '../entities/production-plan.entity';
import { BomExplosionService, BomExplosionResult } from './bom-explosion.service';
import { OrderManagement } from '@/modules/business-info/ordermanagement-info/entities/ordermanagement.entity';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { ProductionPlanCodeGenerator } from '../utils/production-plan-code-generator.util';

export interface ProductionPlanCreateDto {
  orderCode: string;
  productionPlanDate: Date;
  expectedStartDate: Date;
  expectedCompletionDate: Date;
  employeeCode: string;
  employeeName: string;
  remark?: string;
  selectedProductCodes: string[]; // 생산할 품목 코드들 (프론트에서 선택)
}

export interface ProductionPlanItem {
  productCode: string;
  productName: string;
  productType: string;
  productSize: string;
  requiredQuantity: number;
  stockQuantity: number;
  shortageQuantity: number;
  productionQuantity: number; // 실제 생산 계획 수량
  level: number;
  parentProductCode?: string;
}

@Injectable()
export class ProductionPlanCreateService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
    @InjectRepository(OrderManagement)
    private readonly orderRepository: Repository<OrderManagement>,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
    private readonly bomExplosionService: BomExplosionService,
  ) {}

  /**
   * 수주 기반 생산 계획을 생성합니다.
   * @param dto 생산 계획 생성 DTO
   * @param username 사용자명
   * @returns 생성된 생산 계획
   */
  async createProductionPlanFromOrder(
    dto: ProductionPlanCreateDto,
    username: string,
  ): Promise<ProductionPlan[]> {
    // 수주 정보 조회
    const order = await this.orderRepository.findOne({
      where: { orderCode: dto.orderCode },
    });

    if (!order) {
      throw new Error(`수주를 찾을 수 없습니다: ${dto.orderCode}`);
    }

    // BOM 전개
    const bomResult = await this.bomExplosionService.explodeBomByOrderCode(dto.orderCode);

    // 생산 계획 아이템 생성
    const productionPlanItems = await this.createProductionPlanItems(bomResult, dto);

    // 생산 계획 생성
    const productionPlans: ProductionPlan[] = [];

    for (const item of productionPlanItems) {
      const productionPlan = this.productionPlanRepository.create({
        productionPlanCode: await ProductionPlanCodeGenerator.generateProductionPlanCode(
          this.productionPlanRepository,
        ),
        productionPlanDate: dto.productionPlanDate,
        orderType: order.orderType,
        projectCode: order.projectCode,
        projectName: order.projectName,
        customerCode: order.customerCode,
        customerName: order.customerName,
        productCode: item.productCode,
        productName: item.productName,
        productType: item.productType,
        productSize: item.productSize,
        productStock: item.stockQuantity,
        productionPlanQuantity: item.productionQuantity,
        expectedProductStock: item.stockQuantity + item.productionQuantity,
        expectedStartDate: dto.expectedStartDate,
        expectedCompletionDate: dto.expectedCompletionDate,
        employeeCode: dto.employeeCode,
        employeeName: dto.employeeName,
        remark: dto.remark || '',
        createdBy: username,
        updatedBy: username,
      });

      productionPlans.push(productionPlan);
    }

    // 데이터베이스에 저장
    return await this.productionPlanRepository.save(productionPlans);
  }

  /**
   * BOM 전개 결과를 기반으로 생산 계획 아이템들을 생성합니다.
   */
  private async createProductionPlanItems(
    bomResult: BomExplosionResult,
    dto: ProductionPlanCreateDto,
  ): Promise<ProductionPlanItem[]> {
    const items: ProductionPlanItem[] = [];
    const flattenedItems = this.bomExplosionService.flattenBomItems(bomResult.bomItems);

    // 최상위 품목의 상세 정보 조회
    const rootProduct = await this.productRepository.findOne({
      where: { productCode: bomResult.rootProduct.productCode },
    });

    // 최상위 품목도 포함하여 모든 품목을 처리
    const allItems = [
      {
        productCode: bomResult.rootProduct.productCode,
        productName: bomResult.rootProduct.productName,
        productType: rootProduct?.productType || '',
        productSize: rootProduct?.productSize1 || '',
        requiredQuantity: bomResult.rootProduct.orderQuantity,
        stockQuantity: parseInt(rootProduct?.safeInventory || '0') || 0,
        shortageQuantity: Math.max(0, bomResult.rootProduct.orderQuantity - (parseInt(rootProduct?.safeInventory || '0') || 0)),
        level: 0,
        parentProductCode: null,
      },
      ...flattenedItems,
    ];

    for (const item of allItems) {
      // 선택된 품목 코드에 포함되어 있는지 확인
      const isSelected = dto.selectedProductCodes.includes(item.productCode);
      
      if (isSelected && item.requiredQuantity > 0) {
        items.push({
          productCode: item.productCode,
          productName: item.productName,
          productType: item.productType,
          productSize: item.productSize,
          requiredQuantity: item.requiredQuantity,
          stockQuantity: item.stockQuantity,
          shortageQuantity: item.shortageQuantity,
          productionQuantity: item.requiredQuantity, // 선택된 품목은 필요 수량만큼 생산
          level: item.level,
          parentProductCode: item.parentProductCode || undefined,
        });
      }
    }

    return items;
  }


  /**
   * 생산 계획을 수정합니다.
   */
  async updateProductionPlan(
    id: number,
    updateData: Partial<ProductionPlanCreateDto>,
    username: string,
  ): Promise<ProductionPlan> {
    const productionPlan = await this.productionPlanRepository.findOne({ where: { id } });

    if (!productionPlan) {
      throw new Error(`생산 계획을 찾을 수 없습니다: ${id}`);
    }

    // 수정 가능한 필드들만 업데이트
    if (updateData.productionPlanDate) {
      productionPlan.productionPlanDate = updateData.productionPlanDate;
    }
    if (updateData.expectedStartDate) {
      productionPlan.expectedStartDate = updateData.expectedStartDate;
    }
    if (updateData.expectedCompletionDate) {
      productionPlan.expectedCompletionDate = updateData.expectedCompletionDate;
    }
    if (updateData.employeeCode) {
      productionPlan.employeeCode = updateData.employeeCode;
    }
    if (updateData.employeeName) {
      productionPlan.employeeName = updateData.employeeName;
    }
    if (updateData.remark !== undefined) {
      productionPlan.remark = updateData.remark;
    }

    productionPlan.updatedBy = username;
    productionPlan.updatedAt = new Date();

    return await this.productionPlanRepository.save(productionPlan);
  }

  /**
   * 생산 계획을 삭제합니다.
   */
  async deleteProductionPlan(id: number, username: string): Promise<void> {
    const productionPlan = await this.productionPlanRepository.findOne({ where: { id } });

    if (!productionPlan) {
      throw new Error(`생산 계획을 찾을 수 없습니다: ${id}`);
    }

    await this.productionPlanRepository.update(id, {
      updatedBy: username,
      updatedAt: new Date(),
    });

    await this.productionPlanRepository.remove(productionPlan);
  }
}
