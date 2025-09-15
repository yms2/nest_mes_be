import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { UpdateReceivingDto } from '../dto/update-receiving.dto';
import { logService } from '../../../log/Services/log.service';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { ChangeQuantityDto } from '../../../inventory/inventory-management/dto/quantity-change.dto';

@Injectable()
export class ReceivingUpdateService {
    constructor(
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        @InjectRepository(Inventory)
        private readonly inventoryRepository: Repository<Inventory>,
        private readonly logService: logService,
        private readonly inventoryManagementService: InventoryManagementService,
    ) {}

    /**
     * ID로 입고 정보를 수정합니다.
     */
    async updateReceiving(id: number, updateReceivingDto: UpdateReceivingDto, username: string = 'system') {
        try {
            // 기존 정보 조회
            const existingReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!existingReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고 정보를 찾을 수 없습니다.`);
            }

            // 날짜 변환 처리
            const processedData: any = { ...updateReceivingDto };
            if (updateReceivingDto.receivingDate) {
                processedData.receivingDate = new Date(updateReceivingDto.receivingDate);
            }

            // 재고 수량 변경 처리 (수정 전에 실행)
            const oldQuantity = existingReceiving.quantity || 0;
            const newQuantity = updateReceivingDto.quantity || oldQuantity;
            const quantityDifference = newQuantity - oldQuantity;

            if (quantityDifference !== 0 && existingReceiving.productCode) {
                try {
                    const changeQuantityDto: ChangeQuantityDto = {
                        inventoryCode: existingReceiving.productCode,
                        quantityChange: quantityDifference,
                        reason: `입고 수정 - ${existingReceiving.receivingCode} (${oldQuantity} → ${newQuantity})`
                    };

                    await this.inventoryManagementService.changeInventoryQuantity(
                        changeQuantityDto,
                        username
                    );

                    // 재고 변경 로그 기록
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: quantityDifference > 0 ? 'INVENTORY_INCREASE' : 'INVENTORY_DECREASE',
                        username,
                        targetId: existingReceiving.productCode,
                        details: `입고 수정으로 인한 재고 ${quantityDifference > 0 ? '증가' : '감소'}: ${existingReceiving.productCode} (${existingReceiving.productName}) ${quantityDifference > 0 ? '+' : ''}${quantityDifference}`
                    });

                } catch (inventoryError) {
                    // 재고 처리 실패 시 로그만 기록하고 수정은 계속 진행
                    await this.logService.createDetailedLog({
                        moduleName: '재고관리',
                        action: 'INVENTORY_UPDATE_FAILED',
                        username,
                        targetId: existingReceiving.productCode,
                        details: `입고 수정 후 재고 변경 실패: ${existingReceiving.productCode} - ${inventoryError.message}`
                    });
                }
            }

            // 업데이트 실행
            await this.receivingRepository.update(id, processedData);

            // 업데이트된 정보 조회
            const updatedReceiving = await this.receivingRepository.findOne({
                where: { id }
            });

            if (!updatedReceiving) {
                throw new NotFoundException(`ID ${id}에 해당하는 입고 정보를 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: updatedReceiving.receivingCode,
                details: `입고 정보 수정: ${updatedReceiving.receivingCode} (품목: ${updatedReceiving.productName}, 수량: ${updatedReceiving.quantity}, 승인상태: ${updatedReceiving.approvalStatus})`
            });

            return {
                success: true,
                message: '입고 정보가 성공적으로 수정되었습니다.',
                receiving: updatedReceiving
            };

        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '입고관리',
                action: 'UPDATE_FAILED',
                username,
                targetId: id.toString(),
                details: error.message
            });

            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`입고 정보 수정 중 오류가 발생했습니다: ${error.message}`);
        }
    }
}
