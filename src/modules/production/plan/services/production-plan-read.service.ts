import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ProductionPlan } from '../entities/production-plan.entity';
import { QueryProductionPlanDto } from '../dto/query-production-plan.dto';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';

export interface ProductionPlanSummary {
  totalPlans: number;
  totalQuantity: number;
  shortageItems: number;
  completedPlans: number;
  inProgressPlans: number;
  pendingPlans: number;
}

@Injectable()
export class ProductionPlanReadService {
  constructor(
    @InjectRepository(ProductionPlan)
    private readonly productionPlanRepository: Repository<ProductionPlan>,
  ) {}

  /**
   * 생산 계획 목록을 조회합니다.
   */
  async getAllProductionPlan(
    page: number = 1,
    limit: number = 20,
    query?: QueryProductionPlanDto,
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
      .orderBy('productionPlan.productionPlanDate', 'DESC')
      .addOrderBy('productionPlan.productCode', 'ASC')
      .getRawAndEntities();

    const entities = result.entities;
    const rawData = result.raw;
    const total = await queryBuilder.getCount();

    // 실시간 재고 수량을 포함한 데이터 변환
    const data = entities.map((entity, index) => {
      const raw = rawData[index];
      const currentStock = raw?.currentStock ? parseInt(raw.currentStock) : 0;
      const productionQuantity = entity.productionPlanQuantity || 0;
      
      return {
        ...entity,
        // 기존 필드 업데이트
        productStock: currentStock, // 현재 실제 재고로 업데이트
        expectedProductStock: currentStock + productionQuantity, // 현재 재고 + 생산계획 수량
        productName: raw?.realProductName || entity.productName, // 최신 품목명으로 업데이트
        productType: raw?.realProductType || entity.productType, // 최신 품목 유형으로 업데이트
        productSize: raw?.realProductSize || entity.productSize, // 최신 품목 규격으로 업데이트
        // 추가 정보
        shortageQuantity: Math.max(0, productionQuantity - currentStock), // 부족 수량 계산
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
   * 쿼리 빌더를 생성합니다.
   */
  private createQueryBuilder(query: QueryProductionPlanDto): SelectQueryBuilder<ProductionPlan> {
    const queryBuilder = this.productionPlanRepository
      .createQueryBuilder('productionPlan')
      .leftJoin(ProductInfo, 'product', 'product.productCode = productionPlan.productCode')
      .leftJoin(Inventory, 'inventory', 'inventory.inventoryCode = productionPlan.productCode')
      .addSelect([
        'inventory.inventoryQuantity as currentStock',
        'product.productName as realProductName',
        'product.productType as realProductType',
        'product.productSize1 as realProductSize'
      ]);

    if (query.productName) {
      queryBuilder.andWhere('productionPlan.productName LIKE :productName', { 
        productName: `%${query.productName}%` 
      });
    }

    if (query.projectName) {
      queryBuilder.andWhere('productionPlan.projectName LIKE :projectName', { 
        projectName: `%${query.projectName}%` 
      });
    }

    if (query.customerName) {
      queryBuilder.andWhere('productionPlan.customerName LIKE :customerName', { 
        customerName: `%${query.customerName}%` 
      });
    }

    if (query.employeeName) {
      queryBuilder.andWhere('productionPlan.employeeName LIKE :employeeName', { 
        employeeName: `%${query.employeeName}%` 
      });
    }

    if (query.productionPlanDateFrom) {
      queryBuilder.andWhere('productionPlan.productionPlanDate >= :productionPlanDateFrom', {
        productionPlanDateFrom: new Date(query.productionPlanDateFrom),
      });
    }

    if (query.productionPlanDateTo) {
      queryBuilder.andWhere('productionPlan.productionPlanDate <= :productionPlanDateTo', {
        productionPlanDateTo: new Date(query.productionPlanDateTo),
      });
    }

    if (query.expectedStartDateFrom) {
      queryBuilder.andWhere('productionPlan.expectedStartDate >= :expectedStartDateFrom', {
        expectedStartDateFrom: new Date(query.expectedStartDateFrom),
      });
    }

    if (query.expectedStartDateTo) {
      queryBuilder.andWhere('productionPlan.expectedStartDate <= :expectedStartDateTo', {
        expectedStartDateTo: new Date(query.expectedStartDateTo),
      });
    }

    if (query.expectedCompletionDateFrom) {
      queryBuilder.andWhere('productionPlan.expectedCompletionDate >= :expectedCompletionDateFrom', {
        expectedCompletionDateFrom: new Date(query.expectedCompletionDateFrom),
      });
    }

    if (query.expectedCompletionDateTo) {
      queryBuilder.andWhere('productionPlan.expectedCompletionDate <= :expectedCompletionDateTo', {
        expectedCompletionDateTo: new Date(query.expectedCompletionDateTo),
      });
    }


    return queryBuilder;
  }
}
