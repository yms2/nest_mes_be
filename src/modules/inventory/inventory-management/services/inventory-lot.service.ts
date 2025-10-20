import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryLot } from '../entities/inventory-lot.entity';
import { logService } from '../../../log/Services/log.service';
import { InventoryAdjustmentLogService } from '../../inventory-logs/services/inventory-adjustment-log.service';

@Injectable()
export class InventoryLotService {
    constructor(
        @InjectRepository(InventoryLot)
        private readonly inventoryLotRepository: Repository<InventoryLot>,
        private readonly logService: logService,
        private readonly inventoryAdjustmentLogService: InventoryAdjustmentLogService,
    ) {}

    /**
     * LOT별 재고 생성 또는 수량 증가
     * @param productCode 품목 코드
     * @param lotCode LOT 코드
     * @param quantity 수량
     * @param productName 품목명
     * @param username 사용자명
     * @returns 생성/업데이트된 LOT 재고 정보
     */
    async createOrUpdateLotInventory(
        productCode: string,
        lotCode: string,
        quantity: number,
        productName: string,
        username: string = 'system',
        warehouseCode?: string,
        warehouseName?: string,
        warehouseZone?: string,
        adjustmentType: 'CHANGE' | 'PRODUCTION' = 'CHANGE'
    ): Promise<InventoryLot> {
        try {
            // 기존 LOT 재고 조회
            let lotInventory = await this.inventoryLotRepository.findOne({
                where: { productCode, lotCode }
            });

            if (lotInventory) {
                // 기존 LOT이 있는 경우 수량 증가
                const oldQuantity = lotInventory.lotQuantity;
                lotInventory.lotQuantity += quantity;
                lotInventory.updatedBy = username;
                lotInventory.updatedAt = new Date();

                const savedLot = await this.inventoryLotRepository.save(lotInventory);

                // 재고 조정 로그 기록
                await this.inventoryAdjustmentLogService.logAdjustment(
                    lotCode, // inventoryCode (LOT 코드만 사용)
                    `${productName} (${lotCode})`, // inventoryName
                    adjustmentType, // adjustmentType
                    oldQuantity, // beforeQuantity
                    savedLot.lotQuantity, // afterQuantity
                    quantity, // quantityChange
                    'LOT 재고조정 수량 증가', // reason
                    username // createdBy
                );

                // 일반 로그 기록
                await this.logService.createDetailedLog({
                    moduleName: 'LOT재고관리',
                    action: 'LOT_QUANTITY_INCREASE',
                    username,
                    targetId: `${productCode}-${lotCode}`,
                    details: `LOT 재고조정 수량 증가: ${productCode} (${lotCode}) ${oldQuantity} → ${savedLot.lotQuantity} (+${quantity})`
                });

                return savedLot;
            } else {
                // 새로운 LOT 생성
                const newLotInventory = this.inventoryLotRepository.create({
                    productCode,
                    productName,
                    lotCode,
                    lotQuantity: quantity,
                    warehouseCode,
                    warehouseName,
                    warehouseZone,
                    lotStatus: '정상',
                    createdBy: username,
                });

                const savedLot = await this.inventoryLotRepository.save(newLotInventory);

                // 재고 조정 로그 기록 (새 LOT 생성)
                await this.inventoryAdjustmentLogService.logAdjustment(
                    lotCode, // inventoryCode (LOT 코드만 사용)
                    `${productName} (${lotCode})`, // inventoryName
                    adjustmentType === 'PRODUCTION' ? 'PRODUCTION' : 'SET', // adjustmentType
                    0, // beforeQuantity
                    savedLot.lotQuantity, // afterQuantity
                    quantity, // quantityChange
                    '새 LOT 재고 생성', // reason
                    username // createdBy
                );

                // 일반 로그 기록
                await this.logService.createDetailedLog({
                    moduleName: 'LOT재고관리',
                    action: 'LOT_CREATE',
                    username,
                    targetId: `${productCode}-${lotCode}`,
                    details: `새 LOT 재고 생성: ${productCode} (${lotCode}) 수량: ${quantity}`
                });

                return savedLot;
            }
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'LOT재고관리',
                action: 'LOT_CREATE_FAILED',
                username,
                targetId: `${productCode}-${lotCode}`,
                details: `LOT 재고 생성/수정 실패: ${error.message}`
            });

            throw new BadRequestException(`LOT 재고 처리 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * LOT별 재고 수량 감소
     * @param productCode 품목 코드
     * @param lotCode LOT 코드
     * @param quantity 감소할 수량
     * @param username 사용자명
     * @returns 업데이트된 LOT 재고 정보
     */
    async decreaseLotInventory(
        productCode: string,
        lotCode: string,
        quantity: number,
        username: string = 'system'
    ): Promise<InventoryLot> {
        const lotInventory = await this.inventoryLotRepository.findOne({
            where: { productCode, lotCode }
        });

        if (!lotInventory) {
            throw new NotFoundException(`LOT '${lotCode}'에 해당하는 재고를 찾을 수 없습니다.`);
        }

        if (lotInventory.lotQuantity < quantity) {
            throw new BadRequestException(
                `LOT 재고가 부족합니다. 현재 수량: ${lotInventory.lotQuantity}, 요청 수량: ${quantity}`
            );
        }

        const oldQuantity = lotInventory.lotQuantity;
        lotInventory.lotQuantity -= quantity;
        lotInventory.updatedBy = username;
        lotInventory.updatedAt = new Date();

        const savedLot = await this.inventoryLotRepository.save(lotInventory);

        // 재고 조정 로그 기록
        await this.inventoryAdjustmentLogService.logAdjustment(
            lotCode, // inventoryCode (LOT 코드만 사용)
            `${lotInventory.productName} (${lotCode})`, // inventoryName
            'CHANGE', // adjustmentType
            oldQuantity, // beforeQuantity
            savedLot.lotQuantity, // afterQuantity
            -quantity, // quantityChange (음수)
            'LOT 재고조정 수량 감소 ', // reason
            username // createdBy
        );

        // 일반 로그 기록
        await this.logService.createDetailedLog({
            moduleName: 'LOT재고관리',
            action: 'LOT_QUANTITY_DECREASE',
            username,
            targetId: `${productCode}-${lotCode}`,
            details: `LOT 재고조정 수량 감소: ${productCode} (${lotCode}) ${oldQuantity} → ${savedLot.lotQuantity} (-${quantity})`
        });

        return savedLot;
    }

    /**
     * 품목별 LOT 재고 목록 조회
     * @param productCode 품목 코드
     * @returns LOT 재고 목록
     */
    async getLotInventoriesByProduct(productCode: string): Promise<InventoryLot[]> {
        return await this.inventoryLotRepository.find({
            where: { productCode },
            order: { lotCode: 'ASC' }
        });
    }

    /**
     * 특정 LOT 재고 조회
     * @param productCode 품목 코드
     * @param lotCode LOT 코드
     * @returns LOT 재고 정보
     */
    async getLotInventory(productCode: string, lotCode: string): Promise<InventoryLot> {
        const lotInventory = await this.inventoryLotRepository.findOne({
            where: { productCode, lotCode }
        });

        if (!lotInventory) {
            throw new NotFoundException(`LOT '${lotCode}'에 해당하는 재고를 찾을 수 없습니다.`);
        }

        return lotInventory;
    }

    /**
     * 모든 LOT 재고 목록 조회
     * @param searchParams 검색 조건
     * @returns LOT 재고 목록
     */
    async getAllLotInventories(searchParams?: {
        page?: number;
        limit?: number;
        productCode?: string;
        lotCode?: string;
        lotStatus?: string;
        warehouseCode?: string;
        warehouseName?: string;
        warehouseZone?: string;
    }): Promise<{ lotInventories: InventoryLot[]; total: number; page: number; limit: number; totalPages: number }> {
        const page = searchParams?.page || 1;
        const limit = searchParams?.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.inventoryLotRepository.createQueryBuilder('lot');

        if (searchParams?.productCode) {
            queryBuilder.andWhere('lot.productCode = :productCode', { productCode: searchParams.productCode });
        }

        if (searchParams?.lotCode) {
            queryBuilder.andWhere('lot.lotCode LIKE :lotCode', { lotCode: `%${searchParams.lotCode}%` });
        }

        if (searchParams?.lotStatus) {
            queryBuilder.andWhere('lot.lotStatus = :lotStatus', { lotStatus: searchParams.lotStatus });
        }

        if (searchParams?.warehouseCode) {
            queryBuilder.andWhere('lot.warehouseCode LIKE :warehouseCode', { warehouseCode: `%${searchParams.warehouseCode}%` });
        }

        if (searchParams?.warehouseName) {
            queryBuilder.andWhere('lot.warehouseName LIKE :warehouseName', { warehouseName: `%${searchParams.warehouseName}%` });
        }

        if (searchParams?.warehouseZone) {
            queryBuilder.andWhere('lot.warehouseZone LIKE :warehouseZone', { warehouseZone: `%${searchParams.warehouseZone}%` });
        }

        const [lotInventories, total] = await queryBuilder
            .orderBy('lot.productCode', 'ASC')
            .addOrderBy('lot.lotCode', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            lotInventories,
            total,
            page,
            limit,
            totalPages
        };
    }


    /**
     * 품목별 총 재고 수량 계산
     * @param productCode 품목 코드
     * @returns 총 재고 수량
     */
    async getTotalQuantityByProduct(productCode: string): Promise<number> {
        const result = await this.inventoryLotRepository
            .createQueryBuilder('lot')
            .select('SUM(lot.lotQuantity)', 'total')
            .where('lot.productCode = :productCode', { productCode })
            .getRawOne();

        return parseInt(result.total) || 0;
    }

    /**
     * 창고별 LOT 재고 조회
     * @param warehouseCode 창고 코드
     * @param searchParams 검색 조건
     * @returns 창고별 LOT 재고 목록
     */
    async getLotInventoriesByWarehouse(
        warehouseCode: string,
        searchParams?: {
            page?: number;
            limit?: number;
            productCode?: string;
            lotCode?: string;
            lotStatus?: string;
            warehouseZone?: string;
        }
    ): Promise<{ lotInventories: InventoryLot[]; total: number; page: number; limit: number; totalPages: number }> {
        const page = searchParams?.page || 1;
        const limit = searchParams?.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.inventoryLotRepository.createQueryBuilder('lot')
            .where('lot.warehouseCode = :warehouseCode', { warehouseCode });

        if (searchParams?.productCode) {
            queryBuilder.andWhere('lot.productCode = :productCode', { productCode: searchParams.productCode });
        }

        if (searchParams?.lotCode) {
            queryBuilder.andWhere('lot.lotCode LIKE :lotCode', { lotCode: `%${searchParams.lotCode}%` });
        }

        if (searchParams?.lotStatus) {
            queryBuilder.andWhere('lot.lotStatus = :lotStatus', { lotStatus: searchParams.lotStatus });
        }

        if (searchParams?.warehouseZone) {
            queryBuilder.andWhere('lot.warehouseZone LIKE :warehouseZone', { warehouseZone: `%${searchParams.warehouseZone}%` });
        }

        const [lotInventories, total] = await queryBuilder
            .orderBy('lot.productCode', 'ASC')
            .addOrderBy('lot.lotCode', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            lotInventories,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 창고 구역별 LOT 재고 조회
     * @param warehouseCode 창고 코드
     * @param warehouseZone 창고 구역
     * @param searchParams 검색 조건
     * @returns 창고 구역별 LOT 재고 목록
     */
    async getLotInventoriesByWarehouseZone(
        warehouseCode: string,
        warehouseZone: string,
        searchParams?: {
            page?: number;
            limit?: number;
            productCode?: string;
            lotCode?: string;
            lotStatus?: string;
        }
    ): Promise<{ lotInventories: InventoryLot[]; total: number; page: number; limit: number; totalPages: number }> {
        const page = searchParams?.page || 1;
        const limit = searchParams?.limit || 10;
        const skip = (page - 1) * limit;

        const queryBuilder = this.inventoryLotRepository.createQueryBuilder('lot')
            .where('lot.warehouseCode = :warehouseCode', { warehouseCode })
            .andWhere('lot.warehouseZone = :warehouseZone', { warehouseZone });

        if (searchParams?.productCode) {
            queryBuilder.andWhere('lot.productCode = :productCode', { productCode: searchParams.productCode });
        }

        if (searchParams?.lotCode) {
            queryBuilder.andWhere('lot.lotCode LIKE :lotCode', { lotCode: `%${searchParams.lotCode}%` });
        }

        if (searchParams?.lotStatus) {
            queryBuilder.andWhere('lot.lotStatus = :lotStatus', { lotStatus: searchParams.lotStatus });
        }

        const [lotInventories, total] = await queryBuilder
            .orderBy('lot.productCode', 'ASC')
            .addOrderBy('lot.lotCode', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        return {
            lotInventories,
            total,
            page,
            limit,
            totalPages
        };
    }

    /**
     * 창고별 재고 현황 요약 조회
     * @returns 창고별 재고 현황
     */
    async getWarehouseInventorySummary(): Promise<{
        warehouses: Array<{
            warehouseCode: string;
            warehouseName: string;
            totalProducts: number;
            totalQuantity: number;
            zones: Array<{
                warehouseZone: string;
                productCount: number;
                totalQuantity: number;
            }>;
        }>;
    }> {
        // 창고별 기본 정보 조회 (창고 테이블과 조인)
        const warehouseSummary = await this.inventoryLotRepository
            .createQueryBuilder('lot')
            .leftJoin('Warehouse', 'w', 'lot.warehouseCode = w.warehouseCode')
            .select([
                'lot.warehouseCode',
                'COALESCE(w.warehouseName, lot.warehouseName, CONCAT(lot.warehouseCode, " 창고")) as warehouseName',
                'COUNT(DISTINCT lot.productCode) as totalProducts',
                'SUM(lot.lotQuantity) as totalQuantity'
            ])
            .where('lot.warehouseCode IS NOT NULL')
            .groupBy('lot.warehouseCode')
            .orderBy('lot.warehouseCode', 'ASC')
            .getRawMany();

        // 창고 구역별 상세 정보 조회
        const zoneSummary = await this.inventoryLotRepository
            .createQueryBuilder('lot')
            .select([
                'lot.warehouseCode',
                'lot.warehouseZone',
                'COUNT(DISTINCT lot.productCode) as productCount',
                'SUM(lot.lotQuantity) as totalQuantity'
            ])
            .where('lot.warehouseCode IS NOT NULL AND lot.warehouseZone IS NOT NULL')
            .groupBy('lot.warehouseCode, lot.warehouseZone')
            .orderBy('lot.warehouseCode', 'ASC')
            .addOrderBy('lot.warehouseZone', 'ASC')
            .getRawMany();

        // 창고별로 구역 정보 그룹화
        const warehouses = warehouseSummary.map(warehouse => {
            const zones = zoneSummary
                .filter(zone => zone.warehouseCode === warehouse.warehouseCode)
                .map(zone => ({
                    warehouseZone: zone.warehouseZone || '전체',
                    productCount: parseInt(zone.productCount),
                    totalQuantity: parseInt(zone.totalQuantity)
                }));

            return {
                warehouseCode: warehouse.warehouseCode,
                warehouseName: warehouse.warehouseName,
                totalProducts: parseInt(warehouse.totalProducts),
                totalQuantity: parseInt(warehouse.totalQuantity),
                zones
            };
        });

        return { warehouses };
    }

    /**
     * 품목별 창고 구역별 재고 현황 조회
     * @param productCode 품목 코드
     * @returns 품목별 창고 구역별 재고 현황
     */
    async getProductWarehouseZoneSummary(productCode: string): Promise<{
        productCode: string;
        productName: string;
        totalQuantity: number;
        warehouses: Array<{
            warehouseCode: string;
            warehouseName: string;
            totalQuantity: number;
            zones: Array<{
                warehouseZone: string;
                quantity: number;
                lotCount: number;
                lotCodes: string[];
            }>;
        }>;
    }> {
        // 품목 기본 정보 (모든 LOT 데이터에서 계산)
        const lotInventories = await this.inventoryLotRepository.find({
            where: { productCode },
            select: ['productCode', 'productName', 'lotQuantity']
        });
        
        const productName = lotInventories.length > 0 ? lotInventories[0].productName : '알 수 없음';
        const totalQuantity = lotInventories.reduce((sum, lot) => sum + lot.lotQuantity, 0);

        // 창고별 재고 현황 (창고 테이블과 조인)
        const warehouseSummary = await this.inventoryLotRepository
            .createQueryBuilder('lot')
            .leftJoin('Warehouse', 'w', 'lot.warehouseCode = w.warehouseCode')
            .select([
                'lot.warehouseCode',
                'COALESCE(w.warehouseName, lot.warehouseName, CONCAT(lot.warehouseCode, " 창고")) as warehouseName',
                'SUM(lot.lotQuantity) as totalQuantity'
            ])
            .where('lot.productCode = :productCode', { productCode })
            .andWhere('lot.warehouseCode IS NOT NULL')
            .groupBy('lot.warehouseCode')
            .orderBy('lot.warehouseCode', 'ASC')
            .getRawMany();

        // 구역별 상세 재고 현황 (LOT 코드 포함)
        const zoneSummary = await this.inventoryLotRepository
            .createQueryBuilder('lot')
            .select([
                'lot.warehouseCode',
                'COALESCE(lot.warehouseZone, "전체") as warehouseZone',
                'SUM(lot.lotQuantity) as quantity',
                'COUNT(*) as lotCount',
                'GROUP_CONCAT(DISTINCT lot.lotCode ORDER BY lot.lotCode SEPARATOR ", ") as lotCodes'
            ])
            .where('lot.productCode = :productCode', { productCode })
            .andWhere('lot.warehouseCode IS NOT NULL')
            .groupBy('lot.warehouseCode, lot.warehouseZone')
            .orderBy('lot.warehouseCode', 'ASC')
            .addOrderBy('lot.warehouseZone', 'ASC')
            .getRawMany();

        // 창고별로 구역 정보 그룹화 (중복 제거)
        const warehouseMap = new Map();
        
        warehouseSummary.forEach(warehouse => {
            const warehouseCode = warehouse.warehouseCode;
            if (!warehouseMap.has(warehouseCode)) {
                const zones = zoneSummary
                    .filter(zone => zone.warehouseCode === warehouseCode)
                    .map(zone => ({
                        warehouseZone: zone.warehouseZone,
                        quantity: parseInt(zone.quantity),
                        lotCount: parseInt(zone.lotCount),
                        lotCodes: zone.lotCodes ? zone.lotCodes.split(', ') : []
                    }));

                warehouseMap.set(warehouseCode, {
                    warehouseCode: warehouseCode,
                    warehouseName: warehouse.warehouseName,
                    totalQuantity: parseInt(warehouse.totalQuantity),
                    zones
                });
            }
        });

        const warehouses = Array.from(warehouseMap.values());

        return {
            productCode,
            productName,
            totalQuantity,
            warehouses
        };
    }
}
