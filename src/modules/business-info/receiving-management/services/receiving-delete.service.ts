import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { logService } from '../../../log/Services/log.service';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { InventoryLotService } from '../../../inventory/inventory-management/services/inventory-lot.service';
import { ChangeQuantityDto } from '../../../inventory/inventory-management/dto/quantity-change.dto';
import { InventoryLot } from '../../../inventory/inventory-management/entities/inventory-lot.entity';
import { InventoryAdjustmentLog } from '../../../inventory/inventory-logs/entities/inventory-adjustment-log.entity';
import { InventoryAdjustmentLogService } from '../../../inventory/inventory-logs/services/inventory-adjustment-log.service';

@Injectable()
export class ReceivingDeleteService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        @InjectRepository(InventoryLot)
        private readonly inventoryLotRepository: Repository<InventoryLot>,
        @InjectRepository(InventoryAdjustmentLog)
        private readonly inventoryAdjustmentLogRepository: Repository<InventoryAdjustmentLog>,
        private readonly logService: logService,
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly inventoryLotService: InventoryLotService,
        private readonly inventoryAdjustmentLogService: InventoryAdjustmentLogService,
    ) {}

    /**
     * ID로 입고 정보를 삭제합니다. (하드 삭제)
     */
    async deleteReceiving(id: number, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!existingReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고를 찾을 수 없습니다.`);
            }

            // 재고 롤백 (삭제된 입고의 수량만큼 복구)
            await this.rollbackInventory(existingReceiving, username, true); // isDelete = true

            // 하드 삭제 실행
            await this.receivingRepository.delete(id);

            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: `입고 삭제: ID ${id} (${existingReceiving.receivingCode})`,
                username,
                targetId: existingReceiving.receivingCode,
                details: `입고가 삭제되었습니다. 재고 ${existingReceiving.quantity}개 복구됨.`
            });

            return {
                success: true,
                message: '입고 정보가 성공적으로 삭제되었습니다.',
                deletedReceiving: existingReceiving
            };

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: `입고 삭제 실패: ID ${id}`,
                username,
                targetId: id.toString(),
                details: `오류: ${error.message}`
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`입고 정보 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 입고로 인한 재고 증가 롤백
     */
    private async rollbackInventory(receiving: Receiving, username: string, isDelete: boolean = false): Promise<void> {
        try {
            // 현재 재고 수량 조회
            const currentInventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: receiving.productCode }
            });
            
            const beforeQuantity = currentInventory ? currentInventory.inventoryQuantity : 0;
            const afterQuantity = beforeQuantity - receiving.quantity;

            // 1. 일반 재고 수량 차감 - 직접 업데이트
            await this.inventoryRepository.update(
                { inventoryCode: receiving.productCode },
                {
                    inventoryQuantity: afterQuantity,
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // 2. LOT 재고도 롤백 - 직접 UPDATE
            if (receiving.lotCode) {
                // 기존 LOT 재고 조회
                let lotInventory = await this.inventoryLotRepository.findOne({
                    where: { 
                        productCode: receiving.productCode, 
                        lotCode: receiving.lotCode 
                    }
                });

                if (lotInventory) {
                    // 기존 LOT이 있는 경우 수량 차감
                    const oldLotQuantity = lotInventory.lotQuantity;
                    lotInventory.lotQuantity -= receiving.quantity;
                    lotInventory.updatedBy = username;
                    lotInventory.updatedAt = new Date();

                    await this.inventoryLotRepository.save(lotInventory);

                    console.log(`[LOT재고차감] ${receiving.productCode} - LOT: ${receiving.lotCode}, 차감: ${receiving.quantity}개, 잔여: ${lotInventory.lotQuantity}개`);

                    // LOT 재고 조정 로그 기록
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        receiving.lotCode, // inventory_code에는 LOT번호 사용
                        receiving.productName,
                        'PRODUCTION',
                        oldLotQuantity,
                        lotInventory.lotQuantity,
                        -receiving.quantity,
                        `입고 삭제 - LOT 재고 롤백 (입고코드: ${receiving.receivingCode})`,
                        username
                    );
                }
            }


            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_ROLLBACK',
                username,
                targetId: receiving.productCode,
                targetName: receiving.productName,
                details: `입고 ${isDelete ? '삭제' : '수정'}로 인한 재고 롤백: ${receiving.quantity}개 (입고코드: ${receiving.receivingCode})`
            });
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_ROLLBACK_FAIL',
                username,
                targetId: receiving.productCode,
                targetName: receiving.productName,
                details: `입고 ${isDelete ? '삭제' : '수정'} 재고 롤백 실패: ${error.message} (입고코드: ${receiving.receivingCode})`
            });
            console.error('재고 롤백 실패:', error);
            throw error;
        }
    }
}
