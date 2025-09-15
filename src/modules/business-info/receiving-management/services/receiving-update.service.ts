import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receiving } from '../entities/receiving.entity';
import { UpdateReceivingDto } from '../dto/update-receiving.dto';
import { logService } from '../../../log/Services/log.service';
import { Inventory } from '../../../inventory/inventory-management/entities/inventory.entity';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { InventoryLotService } from '../../../inventory/inventory-management/services/inventory-lot.service';
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
        private readonly inventoryLotService: InventoryLotService,
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

            // 수량이 변경되는 경우 재고 처리 (롤백 후 재차감)
            const oldQuantity = existingReceiving.quantity || 0;
            const newQuantity = updateReceivingDto.quantity || oldQuantity;

            if (newQuantity !== oldQuantity && existingReceiving.productCode) {
                await this.handleInventoryAdjustment(existingReceiving, newQuantity, username);
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

    /**
     * 입고 수량 변경 시 재고 조정 (롤백 후 재차감)
     */
    private async handleInventoryAdjustment(
        existingReceiving: Receiving, 
        newQuantity: number, 
        username: string
    ): Promise<void> {
        try {
            const oldQuantity = existingReceiving.quantity || 0;
            const quantityDifference = newQuantity - oldQuantity;

            if (quantityDifference === 0) {
                return;
            }

            // 1. 기존 입고로 인한 재고 증가 롤백
            await this.rollbackInventory(existingReceiving, username);

            // 2. 새로운 수량으로 재고 증가
            const newReceiving = { ...existingReceiving, quantity: newQuantity };
            await this.increaseInventory(newReceiving, username);

            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_ADJUSTMENT',
                username,
                targetId: existingReceiving.productCode,
                targetName: existingReceiving.productName,
                details: `입고 수량 변경으로 인한 재고 조정: ${oldQuantity} → ${newQuantity} (차이: ${quantityDifference > 0 ? '+' : ''}${quantityDifference}) (입고코드: ${existingReceiving.receivingCode})`
            });
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_ADJUSTMENT_FAIL',
                username,
                targetId: existingReceiving.productCode,
                targetName: existingReceiving.productName,
                details: `입고 수량 변경 재고 조정 실패: ${error.message} (입고코드: ${existingReceiving.receivingCode})`
            });
            throw new BadRequestException(`재고 조정 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 입고로 인한 재고 증가 롤백
     */
    private async rollbackInventory(receiving: Receiving, username: string): Promise<void> {
        try {
            const rollbackDto: ChangeQuantityDto = {
                inventoryCode: receiving.productCode,
                quantityChange: -receiving.quantity,
                reason: `입고 수정 - 기존 증가 롤백 (입고코드: ${receiving.receivingCode})`
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
        } catch (error) {
            console.error('재고 롤백 실패:', error);
            throw error;
        }
    }

    /**
     * 입고로 인한 재고 증가
     */
    private async increaseInventory(receiving: Receiving, username: string): Promise<void> {
        try {
            const changeQuantityDto: ChangeQuantityDto = {
                inventoryCode: receiving.productCode,
                quantityChange: receiving.quantity,
                reason: `입고 - 입고코드: ${receiving.receivingCode}`
            };
            await this.inventoryManagementService.changeInventoryQuantity(changeQuantityDto, username);

            // LOT 재고도 증가
            if (receiving.lotCode) {
                await this.inventoryLotService.createOrUpdateLotInventory(
                    receiving.productCode,
                    receiving.lotCode,
                    receiving.quantity,
                    receiving.productName,
                    receiving.unit,
                    receiving.warehouseName,
                    'RECEIVING',
                    username
                );
            }

            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_INCREASE',
                username,
                targetId: receiving.productCode,
                targetName: receiving.productName,
                details: `입고로 인한 재고 증가: ${receiving.quantity}개 (입고코드: ${receiving.receivingCode})`
            });
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_INCREASE_FAIL',
                username,
                targetId: receiving.productCode,
                targetName: receiving.productName,
                details: `입고 재고 증가 실패: ${error.message} (입고코드: ${receiving.receivingCode})`
            });
            console.error('재고 증가 실패:', error);
            throw error;
        }
    }
}
