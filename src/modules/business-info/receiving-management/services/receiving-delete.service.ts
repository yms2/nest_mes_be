import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { logService } from '../../../log/Services/log.service';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
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
    ) {}

    /**
     * ID로 입고 정보를 삭제합니다.
     */
    async deleteReceiving(id: number, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!existingReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고 정보를 찾을 수 없습니다.`);
            }

            // 재고 수량 감소 처리 (삭제 전에 실행)
            if (existingReceiving.productCode && existingReceiving.quantity > 0) {
                try {
                    const changeQuantityDto: ChangeQuantityDto = {
                        inventoryCode: existingReceiving.productCode,
                        quantityChange: -existingReceiving.quantity, // 음수로 감소
                        reason: `입고 삭제 - ${existingReceiving.receivingCode}`
                    };

                    await this.inventoryManagementService.changeInventoryQuantity(
                        changeQuantityDto,
                        username
                    );

                    // 재고 감소 로그 기록
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_DECREASE',
                        username,
                        targetId: existingReceiving.productCode,
                        details: `입고 삭제로 인한 재고 감소: ${existingReceiving.productCode} (${existingReceiving.productName}) -${existingReceiving.quantity}`
                    });

                } catch (inventoryError) {
                    // 재고 처리 실패 시 로그만 기록하고 삭제는 계속 진행
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_DECREASE_FAILED',
                        username,
                        targetId: existingReceiving.productCode,
                        details: `입고 삭제 후 재고 감소 실패: ${existingReceiving.productCode} - ${inventoryError.message}`
                    });
                }
            }

            // 삭제 실행
            await this.receivingRepository.delete(id);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'DELETE_SUCCESS',
                username,
                targetId: existingReceiving.receivingCode,
                details: `입고 정보 삭제: ${existingReceiving.receivingCode} (품목: ${existingReceiving.productName}, 수량: ${existingReceiving.quantity})`
            });

            return {
                success: true,
                message: '입고 정보가 성공적으로 삭제되었습니다.',
                deletedReceiving: existingReceiving
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'DELETE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`입고 정보 삭제 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
