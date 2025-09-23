import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';
import { BomInfo } from '../../../base-info/bom-info/entities/bom-info.entity';
import { ProductInfo } from '../../../base-info/product-info/product_sample/entities/product-info.entity';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { logService } from 'src/modules/log/Services/log.service';
@Injectable()
export class OrderInfoService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        @InjectRepository(BomInfo)
        private readonly bomInfoRepository: Repository<BomInfo>,
        @InjectRepository(ProductInfo)
        private readonly productInfoRepository: Repository<ProductInfo>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        private readonly logService: logService,
    ) {}

    /**
     * 수주 코드로 BOM을 조회하고 발주 정보를 생성합니다.
     */
    async getBomByOrderCode(orderCode: string, username: string = 'system') {
        try {
            // 1. 수주 정보 조회
            const orderManagement = await this.orderManagementRepository.findOne({
                where: { orderCode }
            });

            if (!orderManagement) {
                throw new Error(`수주 코드 ${orderCode}를 찾을 수 없습니다.`);
            }

            // 2. BOM 전개 (재귀적으로 하위 품목들을 모두 조회)
            const rawBomItems = await this.explodeBom(orderManagement.productCode, orderManagement.quantity);

            // 3. BOM 아이템 합산 (같은 품목 수량 합산)
            const bomItems = this.consolidateBomItems(rawBomItems);

            // 3. 발주 정보 생성
            const purchaseOrderItems = await this.generatePurchaseOrderItems(
                orderManagement,
                bomItems
            );


            // 4. 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 BOM 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: orderCode,
                targetName: orderManagement.projectName,
                details: `수주 ${orderCode}의 BOM 조회 완료: ${bomItems.length}개 품목`,
            });

            return {
                orderManagement,
                purchaseOrderItems,
            };

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '발주관리 BOM 조회',
                action: 'READ_FAILED',
                username,
                targetId: orderCode,
                targetName: 'BOM 조회',
                details: `수주 ${orderCode}의 BOM 조회 실패: ${error.message}`,
            });
            throw error;
        }
    }

    /**
     * BOM을 재귀적으로 전개합니다.
     */
    private async explodeBom(parentProductCode: string, parentQuantity: number, level: number = 1, visited: Set<string> = new Set()): Promise<any[]> {
        const bomItems: any[] = [];


        // 무한 루프 방지: 이미 방문한 품목인지 확인
        if (visited.has(parentProductCode)) {
            return bomItems;
        }

        // 최대 레벨 제한 (10단계 이상은 처리하지 않음)
        if (level > 10) {
            return bomItems;
        }

        // 현재 품목을 방문 목록에 추가
        visited.add(parentProductCode);

        // 직접 하위 품목들 조회
        const directChildren = await this.bomInfoRepository.find({
            where: { parentProductCode }
        });


        for (const child of directChildren) {
            const totalQuantity = child.quantity * parentQuantity;
            

            // 품목 정보 조회
            const productInfo = await this.productInfoRepository.findOne({
                where: { productCode: child.childProductCode }
            });

            // 재고 수량 조회
            const inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: child.childProductCode }
            });

            const bomItem = {
                level,
                parentProductCode,
                childProductCode: child.childProductCode,
                childProductName: productInfo?.productName || '품목명 없음',
                bomQuantity: child.quantity,
                parentQuantity,
                totalQuantity,
                unit: child.unit,
                unitPrice: productInfo ? parseInt(productInfo.productPrice) || 0 : 0,
                productType: productInfo?.productType || '',
                productCategory: productInfo?.productCategory || '',
                productOrderUnit: productInfo?.productOrderUnit || '',
                productInventoryUnit: productInfo?.productInventoryUnit || '',
                taxType: productInfo?.taxType || '',
                productPriceSale: productInfo ? parseInt(productInfo.productPriceSale) || 0 : 0,
                currentInventoryQuantity: inventory?.inventoryQuantity || 0,
                inventoryStatus: inventory?.inventoryStatus || '미등록',
                safeInventory: inventory?.safeInventory || 0
            };

            bomItems.push(bomItem);

            // 재귀적으로 하위 BOM 전개 (visited Set을 전달)
            const subBomItems = await this.explodeBom(child.childProductCode, totalQuantity, level + 1, new Set(visited));
            bomItems.push(...subBomItems);
        }

        return bomItems;
    }

    /**
     * BOM 아이템들을 품목별로 합산합니다.
     */
    private consolidateBomItems(bomItems: any[]): any[] {
        const consolidatedMap = new Map<string, any>();

        for (const item of bomItems) {
            const key = item.childProductCode;
            
            if (consolidatedMap.has(key)) {
                // 기존 아이템이 있으면 수량 합산
                const existingItem = consolidatedMap.get(key);
                existingItem.totalQuantity += item.totalQuantity;
                existingItem.bomQuantity += item.bomQuantity;
                
                // 최소 레벨로 업데이트 (더 상위 레벨로)
                if (item.level < existingItem.level) {
                    existingItem.level = item.level;
                    existingItem.parentProductCode = item.parentProductCode;
                }
                
            } else {
                // 새로운 아이템 추가
                consolidatedMap.set(key, { ...item });
            }
        }

        const consolidatedItems = Array.from(consolidatedMap.values());
        
        return consolidatedItems;
    }

    /**
     * 발주 아이템을 생성합니다.
     */
    private async generatePurchaseOrderItems(orderManagement: OrderManagement, bomItems: any[]): Promise<any[]> {
        const purchaseOrderItems: any[] = [];

        // BOM 아이템이 있는 경우
        if (bomItems && bomItems.length > 0) {
            for (let i = 0; i < bomItems.length; i++) {
                const bomItem = bomItems[i];
                const unitPrice = bomItem.unitPrice || 0;
                const supplyPrice = unitPrice * bomItem.totalQuantity;
                const vat = Math.round(supplyPrice * 0.1); // 부가세 10%
                const total = supplyPrice + vat;

                // 고유한 발주 코드 생성 (기본 발주 코드 + 품목 코드 + 순번)
                const uniqueOrderCode = `${orderManagement.orderCode}_${bomItem.childProductCode}_${String(i + 1).padStart(3, '0')}`;

                const purchaseOrderItem = {
                    customerCode: orderManagement.customerCode,
                    customerName: orderManagement.customerName,
                    orderCode: uniqueOrderCode,
                    projectCode: orderManagement.projectCode,
                    projectName: orderManagement.projectName,
                    projectVersion: orderManagement.projectVersion,
                    orderName: `${orderManagement.projectName} - ${bomItem.childProductName}`,
                    orderDate: new Date(),
                    productCode: bomItem.childProductCode,
                    productName: bomItem.childProductName,
                    usePlanQuantity: bomItem.totalQuantity,
                    orderQuantity: bomItem.totalQuantity,
                    unitPrice,
                    supplyPrice,
                    vat,
                    total,
                    discountAmount: 0,
                    totalAmount: total,
                    deliveryDate: orderManagement.deliveryDate,
                    approvalInfo: '대기',
                    remark: `BOM Level ${bomItem.level} (합산된 수량: ${bomItem.totalQuantity})`,
                    bomLevel: bomItem.level,
                    parentProductCode: bomItem.parentProductCode,
                    productType: bomItem.productType,
                    productCategory: bomItem.productCategory,
                    productOrderUnit: bomItem.productOrderUnit,
                    productInventoryUnit: bomItem.productInventoryUnit,
                    taxType: bomItem.taxType,
                    productPriceSale: bomItem.productPriceSale,
                    currentInventoryQuantity: bomItem.currentInventoryQuantity,
                    inventoryStatus: bomItem.inventoryStatus,
                    safeInventory: bomItem.safeInventory
                };

                purchaseOrderItems.push(purchaseOrderItem);
            }
        } else {
            // BOM 아이템이 없는 경우, 수주 품목 자체를 발주 아이템으로 생성
            
            const productInfo = await this.productInfoRepository.findOne({
                where: { productCode: orderManagement.productCode }
            });

            // 재고 수량 조회
            const inventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: orderManagement.productCode }
            });

            if (productInfo) {
                const unitPrice = parseInt(productInfo.productPrice) || 0;
                const supplyPrice = unitPrice * orderManagement.quantity;
                const vat = Math.round(supplyPrice * 0.1); // 부가세 10%
                const total = supplyPrice + vat;

                // 고유한 발주 코드 생성 (기본 발주 코드 + 품목 코드 + 001)
                const uniqueOrderCode = `${orderManagement.orderCode}_${orderManagement.productCode}_001`;

                const purchaseOrderItem = {
                    customerCode: orderManagement.customerCode,
                    customerName: orderManagement.customerName,
                    orderCode: uniqueOrderCode,
                    projectCode: orderManagement.projectCode,
                    projectName: orderManagement.projectName,
                    projectVersion: orderManagement.projectVersion,
                    orderName: `${orderManagement.projectName} - ${orderManagement.productName}`,
                    orderDate: new Date(),
                    productCode: orderManagement.productCode,
                    productName: orderManagement.productName,
                    usePlanQuantity: orderManagement.quantity,
                    orderQuantity: orderManagement.quantity,
                    unitPrice,
                    supplyPrice,
                    vat,
                    total,
                    discountAmount: 0,
                    totalAmount: total,
                    deliveryDate: orderManagement.deliveryDate,
                    approvalInfo: '대기',
                    remark: 'BOM 데이터 없음 - 수주 품목 직접 발주',
                    bomLevel: 0,
                    parentProductCode: null,
                    productType: productInfo.productType || '',
                    productCategory: productInfo.productCategory || '',
                    productOrderUnit: productInfo.productOrderUnit || '',
                    productInventoryUnit: productInfo.productInventoryUnit || '',
                    taxType: productInfo.taxType || '',
                    productPriceSale: parseInt(productInfo.productPriceSale) || 0,
                    currentInventoryQuantity: inventory?.inventoryQuantity || 0,
                    inventoryStatus: inventory?.inventoryStatus || '미등록',
                    safeInventory: inventory?.safeInventory || 0
                };

                purchaseOrderItems.push(purchaseOrderItem);
            }
        }

        return purchaseOrderItems;
    }
}
