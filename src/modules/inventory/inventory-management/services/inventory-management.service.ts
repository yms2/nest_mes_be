import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { ProductInfo } from 'src/modules/base-info/product-info/product_sample/entities/product-info.entity';
import { ChangeQuantityDto, SetQuantityDto, MultipleQuantityChangeDto, MultipleQuantitySetDto } from '../dto/quantity-change.dto';
import { InventoryAdjustmentLogService } from '../../inventory-logs/services/inventory-adjustment-log.service';

@Injectable()
export class InventoryManagementService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
    private readonly inventoryAdjustmentLogService: InventoryAdjustmentLogService,
  ) {}

  /**
   * 품목을 재고로 등록 (품목명과 단위만 사용)
   * @param productCode 품목 코드
   * @param createdBy 생성자
   * @returns 생성된 재고 정보
   */
  async createInventoryFromProduct(
    productCode: string,
    createdBy: string,
  ): Promise<Inventory> {
    // 1. 품목 정보 조회
    const product = await this.productInfoRepository.findOne({
      where: { productCode }
    });

    if (!product) {
      throw new NotFoundException(`품목 코드 '${productCode}'에 해당하는 상품을 찾을 수 없습니다.`);
    }

    // 2. 이미 재고로 등록되어 있는지 확인
    const existingInventory = await this.inventoryRepository.findOne({
      where: { inventoryCode: productCode }
    });

    if (existingInventory) {
      throw new ConflictException(`품목 코드 '${productCode}'의 재고가 이미 존재합니다.`);
    }

    // 3. 재고 엔티티 생성 (품목명과 단위만 사용)
    const inventoryEntity = this.createInventoryEntityFromProduct(product, createdBy);

    // 4. 재고 저장
    return this.inventoryRepository.save(inventoryEntity);
  }

  /**
   * 품목 정보에서 재고 엔티티 생성 (품목명, 단위, 품목구분 포함)
   * @param product 품목 정보
   * @param createdBy 생성자
   * @returns 재고 엔티티
   */
  private createInventoryEntityFromProduct(
    product: ProductInfo,
    createdBy: string,
  ): Inventory {
    return this.inventoryRepository.create({
      inventoryCode: product.productCode,
      inventoryName: product.productName || `품목_${product.productCode}`,
      inventoryType: product.productType || '미분류',
      inventoryQuantity: 0, // 기본 수량 0
      inventoryUnit: product.productInventoryUnit || 'EA',
      inventoryLocation: '기본창고', // 기본 위치
      safeInventory: parseInt(product.safeInventory) || 0,
      inventoryStatus: '정상',
      createdBy,
    });
  }

  /**
   * 모든 품목을 재고로 등록 (품목명과 단위만 사용)
   * @param createdBy 생성자
   * @returns 생성 결과
   */
  async createAllProductsAsInventory(createdBy: string): Promise<{
    created: Inventory[];
    skipped: string[];
  }> {
    // 1. 모든 품목 조회
    const products = await this.productInfoRepository.find();
    
    // 2. 이미 재고로 등록된 품목 코드들 조회
    const existingInventories = await this.inventoryRepository.find({
      select: ['inventoryCode']
    });
    const existingCodes = new Set(existingInventories.map(inv => inv.inventoryCode));

    const created: Inventory[] = [];
    const skipped: string[] = [];

    // 3. 각 품목에 대해 처리
    for (const product of products) {
      try {
        // 이미 재고로 등록된 경우 건너뛰기
        if (existingCodes.has(product.productCode)) {
          skipped.push(product.productCode);
          continue;
        }

        // 재고 등록
        const inventory = await this.createInventoryFromProduct(
          product.productCode,
          createdBy
        );

        created.push(inventory);
      } catch (error) {
        skipped.push(product.productCode);
      }
    }

    return { created, skipped };
  }

  /**
   * 재고 코드로 재고 조회
   */
  async findInventoryByCode(inventoryCode: string): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { inventoryCode }
    });
  }

  /**
   * 품목구분별로 재고 생성
   * @param productType 품목구분
   * @param createdBy 생성자
   * @returns 생성 결과
   */
  async createInventoriesByProductType(
    productType: string,
    createdBy: string,
  ): Promise<{
    created: Inventory[];
    skipped: string[];
    productType: string;
  }> {
    // 1. 해당 품목구분의 모든 품목 조회
    const products = await this.productInfoRepository.find({
      where: { productType }
    });

    if (products.length === 0) {
      return {
        created: [],
        skipped: [],
        productType,
      };
    }

    // 2. 이미 재고로 등록된 품목 코드들 조회
    const existingInventories = await this.inventoryRepository.find({
      select: ['inventoryCode']
    });
    const existingCodes = new Set(existingInventories.map(inv => inv.inventoryCode));

    const created: Inventory[] = [];
    const skipped: string[] = [];

    // 3. 각 품목에 대해 처리
    for (const product of products) {
      try {
        // 이미 재고로 등록된 경우 건너뛰기
        if (existingCodes.has(product.productCode)) {
          skipped.push(product.productCode);
          continue;
        }

        // 재고 등록
        const inventory = await this.createInventoryFromProduct(
          product.productCode,
          createdBy
        );

        created.push(inventory);
      } catch (error) {
        skipped.push(product.productCode);
      }
    }

    return { created, skipped, productType };
  }

  /**
   * 모든 품목구분 목록 조회
   * @returns 품목구분 목록
   */
  async getAllProductTypes(): Promise<string[]> {
    const result = await this.productInfoRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.productType', 'productType')
      .where('product.productType IS NOT NULL')
      .orderBy('product.productType', 'ASC')
      .getRawMany();

    return result.map(item => item.productType);
  }

  /**
   * 품목구분별 품목 개수 조회
   * @returns 품목구분별 품목 개수
   */
  async getProductCountByType(): Promise<{ productType: string; count: number }[]> {
    const result = await this.productInfoRepository
      .createQueryBuilder('product')
      .select('product.productType', 'productType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.productType')
      .orderBy('product.productType', 'ASC')
      .getRawMany();

    return result.map(item => ({
      productType: item.productType || '미분류',
      count: parseInt(item.count),
    }));
  }

  /**
   * 품목구분별 재고 현황 조회
   * @returns 품목구분별 재고 현황
   */
  async getInventoryStatusByProductType(): Promise<{
    productType: string;
    totalProducts: number;
    registeredInventories: number;
    pendingProducts: number;
  }[]> {
    const productCounts = await this.getProductCountByType();
    const existingInventories = await this.inventoryRepository.find({
      select: ['inventoryCode']
    });
    const existingCodes = new Set(existingInventories.map(inv => inv.inventoryCode));

    const result: {
      productType: string;
      totalProducts: number;
      registeredInventories: number;
      pendingProducts: number;
    }[] = [];

    for (const { productType, count: totalProducts } of productCounts) {
      // 해당 품목구분의 품목들 조회
      const products = await this.productInfoRepository.find({
        where: { productType },
        select: ['productCode']
      });

      // 재고로 등록된 품목 개수 계산
      const registeredInventories = products.filter(
        product => existingCodes.has(product.productCode)
      ).length;

      result.push({
        productType,
        totalProducts,
        registeredInventories,
        pendingProducts: totalProducts - registeredInventories,
      });
    }

    return result;
  }

  /**
   * 품목구분별 재고 조회
   * @param productType 품목구분
   * @returns 해당 품목구분의 재고 목록
   */
  async findInventoriesByType(productType: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { inventoryType: productType },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 모든 재고 조회
   */
  async findAllInventories(): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * 재고 수량 변경 (증감)
   * @param changeQuantityDto 수량 변경 정보
   * @param updatedBy 수정자
   * @returns 업데이트된 재고 정보
   */
  async changeInventoryQuantity(
    changeQuantityDto: ChangeQuantityDto,
    updatedBy: string,
  ): Promise<Inventory> {
    // 1. 재고 조회
    const inventory = await this.inventoryRepository.findOne({
      where: { inventoryCode: changeQuantityDto.inventoryCode }
    });

    if (!inventory) {
      throw new NotFoundException(`재고 코드 '${changeQuantityDto.inventoryCode}'에 해당하는 재고를 찾을 수 없습니다.`);
    }

    const oldQuantity = inventory.inventoryQuantity;
    const changeQuantity = changeQuantityDto.quantityChange;
    const newQuantity = oldQuantity + changeQuantity;

    // 2. 수량이 음수가 되는지 확인
    if (newQuantity < 0) {
      // 실패 이력 기록
      await this.inventoryAdjustmentLogService.logFailedAdjustment(
        changeQuantityDto.inventoryCode,
        inventory.inventoryName,
        'CHANGE',
        `수량 변경 후 재고가 음수가 될 수 없습니다. 현재 수량: ${oldQuantity}, 변경 수량: ${changeQuantity}`,
        updatedBy,
      );
      throw new BadRequestException(
        `수량 변경 후 재고가 음수가 될 수 없습니다. 현재 수량: ${oldQuantity}, 변경 수량: ${changeQuantity}`
      );
    }

    try {
      // 3. 수량 업데이트
      await this.inventoryRepository.update(
        { inventoryCode: changeQuantityDto.inventoryCode },
        {
          inventoryQuantity: newQuantity,
          updatedBy,
          updatedAt: new Date(),
        }
      );

      // 4. 성공 이력 기록
      await this.inventoryAdjustmentLogService.logAdjustment(
        changeQuantityDto.inventoryCode,
        inventory.inventoryName,
        'CHANGE',
        oldQuantity,
        newQuantity,
        changeQuantity,
        changeQuantityDto.reason || '수량 변경',
        updatedBy,
      );

      // 5. 업데이트된 재고 정보 반환
      const updatedInventory = await this.inventoryRepository.findOne({
        where: { inventoryCode: changeQuantityDto.inventoryCode }
      });
      
      if (!updatedInventory) {
        throw new NotFoundException('업데이트된 재고 정보를 찾을 수 없습니다.');
      }
      
      return updatedInventory;
    } catch (error) {
      // 실패 이력 기록
      await this.inventoryAdjustmentLogService.logFailedAdjustment(
        changeQuantityDto.inventoryCode,
        inventory.inventoryName,
        'CHANGE',
        error.message,
        updatedBy,
      );
      throw error;
    }
  }

  /**
   * 재고 수량 설정
   * @param setQuantityDto 수량 설정 정보
   * @param updatedBy 수정자
   * @returns 업데이트된 재고 정보
   */
  async setInventoryQuantity(
    setQuantityDto: SetQuantityDto,
    updatedBy: string,
  ): Promise<Inventory> {
    // 1. 재고 조회
    const inventory = await this.inventoryRepository.findOne({
      where: { inventoryCode: setQuantityDto.inventoryCode }
    });

    if (!inventory) {
      throw new NotFoundException(`재고 코드 '${setQuantityDto.inventoryCode}'에 해당하는 재고를 찾을 수 없습니다.`);
    }

    const oldQuantity = inventory.inventoryQuantity;
    const newQuantity = setQuantityDto.quantity;
    const quantityChange = newQuantity - oldQuantity;

    try {
      // 2. 수량 업데이트
      await this.inventoryRepository.update(
        { inventoryCode: setQuantityDto.inventoryCode },
        {
          inventoryQuantity: newQuantity,
          updatedBy,
          updatedAt: new Date(),
        }
      );

      // 3. 성공 이력 기록
      await this.inventoryAdjustmentLogService.logAdjustment(
        setQuantityDto.inventoryCode,
        inventory.inventoryName,
        'SET',
        oldQuantity,
        newQuantity,
        quantityChange,
        setQuantityDto.reason || '수량 설정',
        updatedBy,
      );

      // 4. 업데이트된 재고 정보 반환
      const updatedInventory = await this.inventoryRepository.findOne({
        where: { inventoryCode: setQuantityDto.inventoryCode }
      });
      
      if (!updatedInventory) {
        throw new NotFoundException('업데이트된 재고 정보를 찾을 수 없습니다.');
      }
      
      return updatedInventory;
    } catch (error) {
      // 실패 이력 기록
      await this.inventoryAdjustmentLogService.logFailedAdjustment(
        setQuantityDto.inventoryCode,
        inventory.inventoryName,
        'SET',
        error.message,
        updatedBy,
      );
      throw error;
    }
  }

  /**
   * 여러 재고 수량 일괄 변경 (증감)
   * @param multipleQuantityChangeDto 수량 변경할 재고 목록
   * @param updatedBy 수정자
   * @returns 변경 결과
   */
  async changeMultipleInventoryQuantities(
    multipleQuantityChangeDto: MultipleQuantityChangeDto,
    updatedBy: string,
  ): Promise<{
    success: Inventory[];
    failed: { inventoryCode: string; error: string }[];
    totalProcessed: number;
    successCount: number;
    failedCount: number;
  }> {
    const results = {
      success: [] as Inventory[],
      failed: [] as { inventoryCode: string; error: string }[],
      totalProcessed: multipleQuantityChangeDto.inventories.length,
      successCount: 0,
      failedCount: 0,
    };

    for (const changeDto of multipleQuantityChangeDto.inventories) {
      try {
        const updatedInventory = await this.changeInventoryQuantity(changeDto, updatedBy);
        results.success.push(updatedInventory);
        results.successCount++;
      } catch (error) {
        results.failed.push({
          inventoryCode: changeDto.inventoryCode,
          error: error.message,
        });
        results.failedCount++;
      }
    }

    return results;
  }

  /**
   * 여러 재고 수량 일괄 설정
   * @param multipleQuantitySetDto 수량 설정할 재고 목록
   * @param updatedBy 수정자
   * @returns 설정 결과
   */
  async setMultipleInventoryQuantities(
    multipleQuantitySetDto: MultipleQuantitySetDto,
    updatedBy: string,
  ): Promise<{
    success: Inventory[];
    failed: { inventoryCode: string; error: string }[];
    totalProcessed: number;
    successCount: number;
    failedCount: number;
  }> {
    const results = {
      success: [] as Inventory[],
      failed: [] as { inventoryCode: string; error: string }[],
      totalProcessed: multipleQuantitySetDto.inventories.length,
      successCount: 0,
      failedCount: 0,
    };

    for (const setDto of multipleQuantitySetDto.inventories) {
      try {
        const updatedInventory = await this.setInventoryQuantity(setDto, updatedBy);
        results.success.push(updatedInventory);
        results.successCount++;
      } catch (error) {
        results.failed.push({
          inventoryCode: setDto.inventoryCode,
          error: error.message,
        });
        results.failedCount++;
      }
    }

    return results;
  }

  /**
   * 품목 정보 변경 시 재고 정보 동기화 (재고가 없으면 새로 생성)
   * @param productCode 품목 코드
   * @param updatedBy 수정자
   * @returns 동기화된 재고 정보
   */
  async syncInventoryFromProduct(
    productCode: string,
    updatedBy: string,
  ): Promise<Inventory> {
    // 1. 품목 정보 조회
    const product = await this.productInfoRepository.findOne({
      where: { productCode }
    });

    if (!product) {
      throw new NotFoundException(`품목 코드 '${productCode}'에 해당하는 품목을 찾을 수 없습니다.`);
    }

    // 2. 재고 정보 조회
    const inventory = await this.inventoryRepository.findOne({
      where: { inventoryCode: productCode }
    });

    // 3. 재고가 없으면 새로 생성
    if (!inventory) {
      const newInventory = this.createInventoryEntityFromProduct(product, updatedBy);
      return this.inventoryRepository.save(newInventory);
    }

    // 4. 변경사항 확인
    const hasChanges = this.checkInventoryChanges(inventory, product);
    
    if (!hasChanges) {
      return inventory; // 변경사항이 없으면 기존 재고 정보 반환
    }

    // 5. 재고 정보 업데이트
    const updateData: Partial<Inventory> = {
      updatedBy,
      updatedAt: new Date(),
    };

    // 품목명 변경 시 재고명 업데이트
    if (product.productName && product.productName !== inventory.inventoryName) {
      updateData.inventoryName = product.productName;
    }

    // 품목구분 변경 시 재고구분 업데이트
    if (product.productType && product.productType !== inventory.inventoryType) {
      updateData.inventoryType = product.productType;
    }

    // 단위 변경 시 재고 단위 업데이트
    if (product.productInventoryUnit && product.productInventoryUnit !== inventory.inventoryUnit) {
      updateData.inventoryUnit = product.productInventoryUnit;
    }

    // 안전재고 변경 시 재고 안전재고 업데이트
    if (product.safeInventory && parseInt(product.safeInventory) !== inventory.safeInventory) {
      updateData.safeInventory = parseInt(product.safeInventory);
    }

    // 6. 업데이트 실행
    await this.inventoryRepository.update({ inventoryCode: productCode }, updateData);

    // 7. 업데이트된 재고 정보 반환
    const updatedInventory = await this.inventoryRepository.findOne({
      where: { inventoryCode: productCode }
    });
    
    if (!updatedInventory) {
      throw new NotFoundException('업데이트된 재고 정보를 찾을 수 없습니다.');
    }
    
    return updatedInventory;
  }

  /**
   * 여러 재고의 품목 정보 동기화
   * @param productCodes 품목 코드 목록
   * @param updatedBy 수정자
   * @returns 동기화 결과
   */
  async syncMultipleInventoriesFromProducts(
    productCodes: string[],
    updatedBy: string,
  ): Promise<{
    success: Inventory[];
    failed: { productCode: string; error: string }[];
    totalProcessed: number;
    successCount: number;
    failedCount: number;
  }> {
    const results = {
      success: [] as Inventory[],
      failed: [] as { productCode: string; error: string }[],
      totalProcessed: productCodes.length,
      successCount: 0,
      failedCount: 0,
    };

    for (const productCode of productCodes) {
      try {
        const updatedInventory = await this.syncInventoryFromProduct(productCode, updatedBy);
        results.success.push(updatedInventory);
        results.successCount++;
      } catch (error) {
        results.failed.push({
          productCode,
          error: error.message,
        });
        results.failedCount++;
      }
    }

    return results;
  }

  /**
   * 모든 품목의 재고 정보 동기화 (재고가 없으면 새로 생성)
   * @param updatedBy 수정자
   * @returns 동기화 결과
   */
  async syncAllInventoriesFromProducts(updatedBy: string): Promise<{
    success: Inventory[];
    failed: { productCode: string; error: string }[];
    totalProcessed: number;
    successCount: number;
    failedCount: number;
  }> {
    // 1. 모든 품목 조회
    const products = await this.productInfoRepository.find({
      select: ['productCode']
    });

    const productCodes = products.map(product => product.productCode);

    // 2. 일괄 동기화 실행
    return this.syncMultipleInventoriesFromProducts(productCodes, updatedBy);
  }

  /**
   * 재고 정보 변경사항 확인
   * @param inventory 기존 재고 정보
   * @param product 품목 정보
   * @returns 변경사항 존재 여부
   */
  private checkInventoryChanges(
    inventory: Inventory,
    product: ProductInfo,
  ): boolean {
    const fieldsToCheck = [
      { productField: 'productName', inventoryField: 'inventoryName' },
      { productField: 'productType', inventoryField: 'inventoryType' },
      { productField: 'productInventoryUnit', inventoryField: 'inventoryUnit' },
      { productField: 'safeInventory', inventoryField: 'safeInventory', transform: (val: string) => parseInt(val) },
    ];

    return fieldsToCheck.some(({ productField, inventoryField, transform }) => {
      const productValue = product[productField as keyof ProductInfo];
      const inventoryValue = inventory[inventoryField as keyof Inventory];
      
      if (productValue === undefined || productValue === null) {
        return false;
      }

      const transformedValue = transform ? transform(productValue as string) : productValue;
      return transformedValue !== inventoryValue;
    });
  }

}
