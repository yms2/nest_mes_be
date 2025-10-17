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
import { InventoryLot } from '../../../inventory/inventory-management/entities/inventory-lot.entity';
import { InventoryAdjustmentLog } from '../../../inventory/inventory-logs/entities/inventory-adjustment-log.entity';
import { InventoryAdjustmentLogService } from '../../../inventory/inventory-logs/services/inventory-adjustment-log.service';

@Injectable()
export class ReceivingUpdateService {
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
            // 현재 재고 수량 조회
            const currentInventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: receiving.productCode }
            });
            
            const beforeQuantity = currentInventory ? currentInventory.inventoryQuantity : 0;
            const afterQuantity = beforeQuantity - receiving.quantity;

            // 직접 재고 수량 롤백
            await this.inventoryRepository.update(
                { inventoryCode: receiving.productCode },
                {
                    inventoryQuantity: afterQuantity,
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // LOT 재고도 롤백 - 직접 UPDATE
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
                        `입고 수정 - LOT 재고 롤백 (입고코드: ${receiving.receivingCode})`,
                        username
                    );
                }
            }

            // 재고 조정 로그 기록 (inventory-adjustment-log)
            const inventoryCodeForLog = receiving.lotCode || receiving.productCode;
            await this.inventoryAdjustmentLogService.logAdjustment(
                inventoryCodeForLog,
                receiving.productName,
                'PRODUCTION',
                beforeQuantity,
                afterQuantity,
                -receiving.quantity,
                `입고 수정 - 기존 증가 롤백 (입고코드: ${receiving.receivingCode})`,
                username
            );

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
            // 현재 재고 수량 조회
            const currentInventory = await this.inventoryRepository.findOne({
                where: { inventoryCode: receiving.productCode }
            });
            
            const beforeQuantity = currentInventory ? currentInventory.inventoryQuantity : 0;
            const afterQuantity = beforeQuantity + receiving.quantity;

            // 직접 재고 수량 증가
            await this.inventoryRepository.update(
                { inventoryCode: receiving.productCode },
                {
                    inventoryQuantity: afterQuantity,
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // LOT 재고도 증가 - 직접 INSERT
            if (receiving.lotCode) {
                // 기존 LOT 재고 조회
                let lotInventory = await this.inventoryLotRepository.findOne({
                    where: { 
                        productCode: receiving.productCode, 
                        lotCode: receiving.lotCode 
                    }
                });

                if (lotInventory) {
                    // 기존 LOT이 있는 경우 수량 증가
                    const oldLotQuantity = lotInventory.lotQuantity;
                    lotInventory.lotQuantity += receiving.quantity;
                    lotInventory.updatedBy = username;
                    lotInventory.updatedAt = new Date();

                    await this.inventoryLotRepository.save(lotInventory);

                    console.log(`[LOT재고증가] ${receiving.productCode} - LOT: ${receiving.lotCode}, 증가: ${receiving.quantity}개, 총수량: ${lotInventory.lotQuantity}개`);

                    // LOT 재고 조정 로그 기록
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        receiving.lotCode, // inventory_code에는 LOT번호 사용
                        receiving.productName,
                        'PRODUCTION',
                        oldLotQuantity,
                        lotInventory.lotQuantity,
                        receiving.quantity,
                        `입고 수정 - LOT 재고 증가 (입고코드: ${receiving.receivingCode})`,
                        username
                    );
                } else {
                    // 새로운 LOT 생성
                    const newLotInventory = this.inventoryLotRepository.create({
                        productCode: receiving.productCode,
                        productName: receiving.productName,
                        lotCode: receiving.lotCode,
                        lotQuantity: receiving.quantity,
                        unit: receiving.unit || 'EA',
                        storageLocation: receiving.warehouseZone || '기본위치',
                        warehouseCode: receiving.warehouseCode,
                        warehouseName: receiving.warehouseName,
                        warehouseZone: receiving.warehouseZone,
                        lotStatus: '정상',
                        createdBy: username,
                    });

                    await this.inventoryLotRepository.save(newLotInventory);

                    console.log(`[LOT재고생성] ${receiving.productCode} - LOT: ${receiving.lotCode}, 수량: ${receiving.quantity}개`);

                    // LOT 재고 조정 로그 기록 (새 LOT 생성)
                    await this.inventoryAdjustmentLogService.logAdjustment(
                        receiving.lotCode, // inventory_code에는 LOT번호 사용
                        receiving.productName,
                        'PRODUCTION',
                        0,
                        receiving.quantity,
                        receiving.quantity,
                        `입고 수정 - 새 LOT 재고 생성 (입고코드: ${receiving.receivingCode})`,
                        username
                    );
                }
            }


            // 기존 로그 기록 (logService)
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
            
            // 실패 로그도 inventory-adjustment-log에 기록
            try {
                const inventoryCodeForLog = receiving.lotCode || receiving.productCode;
                await this.inventoryAdjustmentLogService.logFailedAdjustment(
                    inventoryCodeForLog,
                    receiving.productName,
                    'PRODUCTION',
                    `입고 수정 재고 증가 실패: ${error.message}`,
                    username
                );
            } catch (logError) {
                console.error(`[재고로그] 실패 로그 기록 실패: ${receiving.productCode}`, logError);
            }
            
            console.error('재고 증가 실패:', error);
            throw error;
        }
    }
}
