import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryLot } from '../entities/inventory-lot.entity';
import { logService } from '../../../log/Services/log.service';

@Injectable()
export class InventoryLotService {
    constructor(
        @InjectRepository(InventoryLot)
        private readonly inventoryLotRepository: Repository<InventoryLot>,
        private readonly logService: logService,
    ) {}

    /**
     * LOT별 재고 생성 또는 수량 증가
     * @param productCode 품목 코드
     * @param lotCode LOT 코드
     * @param quantity 수량
     * @param productName 품목명
     * @param unit 단위
     * @param storageLocation 보관 위치
     * @param receivingCode 입고 코드
     * @param username 사용자명
     * @returns 생성/업데이트된 LOT 재고 정보
     */
    async createOrUpdateLotInventory(
        productCode: string,
        lotCode: string,
        quantity: number,
        productName: string,
        unit: string,
        storageLocation: string,
        receivingCode: string,
        username: string = 'system',
        warehouseCode?: string,
        warehouseName?: string,
        warehouseZone?: string
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

                // 로그 기록
                await this.logService.createDetailedLog({
                    moduleName: 'LOT재고관리',
                    action: 'LOT_QUANTITY_INCREASE',
                    username,
                    targetId: `${productCode}-${lotCode}`,
                    details: `LOT 재고 수량 증가: ${productCode} (${lotCode}) ${oldQuantity} → ${savedLot.lotQuantity} (+${quantity})`
                });

                return savedLot;
            } else {
                // 새로운 LOT 생성
                const newLotInventory = this.inventoryLotRepository.create({
                    productCode,
                    productName,
                    lotCode,
                    lotQuantity: quantity,
                    unit,
                    storageLocation,
                    warehouseCode,
                    warehouseName,
                    warehouseZone,
                    firstReceivingCode: receivingCode,
                    lotStatus: '정상',
                    createdBy: username,
                });

                const savedLot = await this.inventoryLotRepository.save(newLotInventory);

                // 로그 기록
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

        // 로그 기록
        await this.logService.createDetailedLog({
            moduleName: 'LOT재고관리',
            action: 'LOT_QUANTITY_DECREASE',
            username,
            targetId: `${productCode}-${lotCode}`,
            details: `LOT 재고 수량 감소: ${productCode} (${lotCode}) ${oldQuantity} → ${savedLot.lotQuantity} (-${quantity})`
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
}
