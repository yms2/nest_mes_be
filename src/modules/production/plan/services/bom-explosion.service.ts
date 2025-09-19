import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomInfo } from '@/modules/base-info/bom-info/entities/bom-info.entity';
import { ProductInfo } from '@/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { OrderManagement } from '@/modules/business-info/ordermanagement-info/entities/ordermanagement.entity';
import { Inventory } from '@/modules/inventory/inventory-management/entities/inventory.entity';

export interface BomItem {
  productCode: string;
  productName: string;
  productType: string;
  productSize: string;
  quantity: number;
  unit: string;
  level: number;
  parentProductCode?: string;
  requiredQuantity: number; // 수주 수량 기준으로 계산된 필요 수량
  stockQuantity: number; // 현재 재고 수량
  shortageQuantity: number; // 부족 수량 (필요 수량 - 재고 수량)
  children: BomItem[];
}

export interface BomExplosionResult {
  rootProduct: {
    productCode: string;
    productName: string;
    orderQuantity: number;
  };
  bomItems: BomItem[];
  totalItems: number;
  shortageItems: BomItem[]; // 부족한 아이템들
  sufficientItems: BomItem[]; // 재고가 충분한 아이템들
  productionRequired: boolean; // 생산이 필요한지 여부
}

@Injectable()
export class BomExplosionService {
  constructor(
    @InjectRepository(BomInfo)
    private readonly bomRepository: Repository<BomInfo>,
    @InjectRepository(ProductInfo)
    private readonly productRepository: Repository<ProductInfo>,
    @InjectRepository(OrderManagement)
    private readonly orderRepository: Repository<OrderManagement>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  /**
   * 수주 코드를 기반으로 BOM을 전개합니다.
   * @param orderCode 수주 코드
   * @returns BOM 전개 결과
   */
  async explodeBomByOrderCode(orderCode: string): Promise<BomExplosionResult> {
    // 수주 정보 조회
    const order = await this.orderRepository.findOne({
      where: { orderCode },
    });

    if (!order) {
      throw new Error(`수주를 찾을 수 없습니다: ${orderCode}`);
    }

    // BOM 전개 실행
    return await this.explodeBom(order.productCode, order.quantity);
  }

  /**
   * 품목 코드와 수량을 기반으로 BOM을 전개합니다.
   * @param productCode 품목 코드
   * @param quantity 수량
   * @returns BOM 전개 결과
   */
  async explodeBom(productCode: string, quantity: number): Promise<BomExplosionResult> {
    // 모든 BOM과 제품 정보, 재고 정보 조회
    const allBoms = await this.bomRepository.find();
    const allProducts = await this.productRepository.find();
    const allInventories = await this.inventoryRepository.find();

    // 제품 정보를 Map으로 구성
    const productMap = new Map<string, ProductInfo>();
    allProducts.forEach(product => {
      productMap.set(product.productCode, product);
    });

    // 재고 정보를 Map으로 구성
    const inventoryMap = new Map<string, Inventory>();
    allInventories.forEach(inventory => {
      inventoryMap.set(inventory.inventoryCode, inventory);
    });

    // 루트 제품 정보
    const rootProduct = productMap.get(productCode);
    if (!rootProduct) {
      throw new Error(`제품을 찾을 수 없습니다: ${productCode}`);
    }

    // BOM 전개 실행
    const bomItems = await this.buildBomTree(productCode, quantity, allBoms, productMap, inventoryMap, new Set());

    // 부족한 아이템들과 충분한 아이템들 필터링
    const shortageItems = this.findShortageItems(bomItems);
    const sufficientItems = this.findSufficientItems(bomItems);
    const productionRequired = shortageItems.length > 0;

    return {
      rootProduct: {
        productCode: rootProduct.productCode,
        productName: rootProduct.productName,
        orderQuantity: quantity,
      },
      bomItems,
      totalItems: bomItems.length,
      shortageItems,
      sufficientItems,
      productionRequired,
    };
  }

  /**
   * BOM 트리를 재귀적으로 구성합니다.
   */
  private async buildBomTree(
    productCode: string,
    quantity: number,
    allBoms: BomInfo[],
    productMap: Map<string, ProductInfo>,
    inventoryMap: Map<string, Inventory>,
    visited: Set<string>,
  ): Promise<BomItem[]> {
    if (visited.has(productCode)) {
      return []; // 순환 참조 방지
    }

    visited.add(productCode);

    const childBoms = allBoms.filter(bom => bom.parentProductCode === productCode);
    const bomItems: BomItem[] = [];

    for (const bom of childBoms) {
      const product = productMap.get(bom.childProductCode);
      if (!product) continue;

      const requiredQuantity = bom.quantity * quantity;
      const inventory = inventoryMap.get(bom.childProductCode);
      const stockQuantity = inventory?.inventoryQuantity || 0;
      const shortageQuantity = Math.max(0, requiredQuantity - stockQuantity);

      const bomItem: BomItem = {
        productCode: bom.childProductCode,
        productName: product.productName,
        productType: product.productType,
        productSize: product.productSize1 || '',
        quantity: bom.quantity,
        unit: bom.unit,
        level: bom.level,
        parentProductCode: productCode,
        requiredQuantity,
        stockQuantity,
        shortageQuantity,
        children: await this.buildBomTree(
          bom.childProductCode,
          requiredQuantity,
          allBoms,
          productMap,
          inventoryMap,
          new Set(visited),
        ),
      };

      bomItems.push(bomItem);
    }

    return bomItems;
  }

  /**
   * 부족한 아이템들을 찾습니다.
   */
  private findShortageItems(bomItems: BomItem[]): BomItem[] {
    const shortageItems: BomItem[] = [];

    for (const item of bomItems) {
      if (item.shortageQuantity > 0) {
        shortageItems.push(item);
      }
      shortageItems.push(...this.findShortageItems(item.children));
    }

    return shortageItems;
  }

  /**
   * 재고가 충분한 아이템들을 찾습니다.
   */
  private findSufficientItems(bomItems: BomItem[]): BomItem[] {
    const sufficientItems: BomItem[] = [];

    for (const item of bomItems) {
      if (item.shortageQuantity === 0 && item.requiredQuantity > 0) {
        sufficientItems.push(item);
      }
      sufficientItems.push(...this.findSufficientItems(item.children));
    }

    return sufficientItems;
  }
  /**
   * BOM 아이템을 평면화합니다.
   */
  flattenBomItems(bomItems: BomItem[]): BomItem[] {
    const result: BomItem[] = [];

    for (const item of bomItems) {
      result.push(item);
      result.push(...this.flattenBomItems(item.children));
    }

    return result;
  }
}
