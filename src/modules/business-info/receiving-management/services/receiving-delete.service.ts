import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { logService } from '../../../log/Services/log.service';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { InventoryLotService } from '../../../inventory/inventory-management/services/inventory-lot.service';
import { ChangeQuantityDto } from '../../../inventory/inventory-management/dto/quantity-change.dto';

@Injectable()
export class ReceivingDeleteService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        private readonly logService: logService,
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly inventoryLotService: InventoryLotService,
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
            const rollbackDto: ChangeQuantityDto = {
                inventoryCode: receiving.productCode,
                quantityChange: -receiving.quantity,
                reason: isDelete 
                    ? `입고 삭제 - 재고 복구 (입고코드: ${receiving.receivingCode})`
                    : `입고 수정 - 기존 증가 롤백 (입고코드: ${receiving.receivingCode})`
            };
            await this.inventoryManagementService.changeInventoryQuantity(rollbackDto, username);

            // LOT 재고도 롤백
            if (receiving.lotCode) {
                await this.inventoryLotService.decreaseLotInventory(
                    receiving.productCode,
                    receiving.lotCode,
                    receiving.quantity,
                    username
                );
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
