import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery } from '../entities/delivery.entity';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';
import { logService } from 'src/modules/log/Services/log.service';
import { InventoryManagementService } from '../../../inventory/inventory-management/services/inventory-management.service';
import { InventoryLotService } from '../../../inventory/inventory-management/services/inventory-lot.service';
import { ChangeQuantityDto } from '../../../inventory/inventory-management/dto/quantity-change.dto';
import { Shipping } from '../../shipping-info/entities/shipping.entity';

@Injectable()
export class DeliveryUpdateService {
    constructor(
        @InjectRepository(Delivery)
        private readonly deliveryRepository: Repository<Delivery>,
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        private readonly logService: logService,
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly inventoryLotService: InventoryLotService,
    ) {}

    /**
     * 납품 정보 수정
     * @param deliveryCode 납품 코드
     * @param updateDeliveryDto 수정할 납품 정보
     * @param username 수정자
     * @returns 수정된 납품 정보
     */
    async updateDelivery(
        deliveryCode: string,
        updateDeliveryDto: UpdateDeliveryDto,
        username: string
    ): Promise<Delivery> {
        try {
            // 기존 납품 정보 조회
            const existingDelivery = await this.deliveryRepository.findOne({
                where: { deliveryCode }
            });

            if (!existingDelivery) {
                throw new NotFoundException(`납품 코드 ${deliveryCode}에 해당하는 납품을 찾을 수 없습니다.`);
            }

            // 수정할 데이터 준비
            const updateData: any = {
                ...updateDeliveryDto,
                updatedBy: username,
                updatedAt: new Date(),
            };

            // 날짜 필드 처리
            if (updateDeliveryDto.deliveryDate) {
                updateData.deliveryDate = new Date(updateDeliveryDto.deliveryDate);
            }

            // 수량이 변경되는 경우 재고 처리
            if (updateDeliveryDto.deliveryQuantity !== undefined && 
                updateDeliveryDto.deliveryQuantity !== existingDelivery.deliveryQuantity) {
                await this.handleInventoryAdjustment(existingDelivery, updateDeliveryDto.deliveryQuantity, username);
            }

            // 납품 정보 업데이트
            await this.deliveryRepository.update(
                { deliveryCode },
                updateData
            );

            // 업데이트된 납품 정보 조회
            const updatedDelivery = await this.deliveryRepository.findOne({
                where: { deliveryCode }
            });

            if (!updatedDelivery) {
                throw new NotFoundException(`업데이트된 납품 정보를 찾을 수 없습니다.`);
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_UPDATE',
                action: `납품 정보 수정: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `수정된 필드: ${Object.keys(updateDeliveryDto).join(', ')}`
            });

            return updatedDelivery;
        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_UPDATE_ERROR',
                action: `납품 정보 수정 실패: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 납품 삭제 (소프트 삭제)
     * @param deliveryCode 납품 코드
     * @param username 삭제자
     * @returns 삭제 성공 여부
     */
    async deleteDelivery(deliveryCode: string, username: string): Promise<void> {
        try {
            // 기존 납품 정보 조회
            const existingDelivery = await this.deliveryRepository.findOne({
                where: { 
                    deliveryCode,
                    deletedAt: null
                } as any
            });

            if (!existingDelivery) {
                throw new NotFoundException(`납품 코드 ${deliveryCode}에 해당하는 납품을 찾을 수 없습니다.`);
            }

            // 소프트 삭제 실행
            await this.deliveryRepository.update(
                { deliveryCode },
                {
                    deletedAt: new Date(),
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE',
                action: `납품 삭제: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `납품이 소프트 삭제되었습니다.`
            });

        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE_ERROR',
                action: `납품 삭제 실패: ${deliveryCode}`,
                username,
                targetId: deliveryCode,
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 납품 삭제 (ID로, 소프트 삭제)
     * @param id 납품 ID
     * @param username 삭제자
     * @returns 삭제 성공 여부
     */
    async deleteDeliveryById(id: number, username: string): Promise<void> {
        try {
            // 기존 납품 정보 조회
            const existingDelivery = await this.deliveryRepository.findOne({
                where: { 
                    id,
                    deletedAt: null
                } as any
            });

            if (!existingDelivery) {
                throw new NotFoundException(`ID ${id}에 해당하는 납품을 찾을 수 없습니다.`);
            }

            // 재고 롤백 (삭제된 납품의 수량만큼 복구)
            await this.rollbackInventory(existingDelivery, username, true);

            // 소프트 삭제 실행
            await this.deliveryRepository.update(
                { id },
                {
                    deletedAt: new Date(),
                    updatedBy: username,
                    updatedAt: new Date()
                }
            );

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE',
                action: `납품 삭제: ID ${id} (${existingDelivery.deliveryCode})`,
                username,
                targetId: existingDelivery.deliveryCode,
                details: `납품이 소프트 삭제되었습니다. 재고 ${existingDelivery.deliveryQuantity}개 복구됨.`
            });

        } catch (error) {
            // 오류 로그 기록
            await this.logService.createDetailedLog({
                moduleName: 'DELIVERY_DELETE_ERROR',
                action: `납품 삭제 실패: ID ${id}`,
                username,
                targetId: id.toString(),
                details: `오류: ${error.message}`
            });

            throw error;
        }
    }

    /**
     * 납품 수량 변경 시 재고 조정 (롤백 후 재차감)
     */
    private async handleInventoryAdjustment(
        existingDelivery: Delivery, 
        newQuantity: number, 
        username: string
    ): Promise<void> {
        try {
            const oldQuantity = existingDelivery.deliveryQuantity;
            const quantityDifference = newQuantity - oldQuantity;

            if (quantityDifference === 0) {
                return; // 수량 변경 없음
            }

            // 1. 기존 재고 롤백 (기존 차감된 수량만큼 복구)
            await this.rollbackInventory(existingDelivery, username);

            // 2. 새로운 수량으로 재고 차감
            const newDelivery = { ...existingDelivery, deliveryQuantity: newQuantity };
            await this.decreaseInventory(newDelivery, username);

            // 재고 조정 로그
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_ADJUSTMENT',
                username,
                targetId: existingDelivery.productCode,
                targetName: existingDelivery.productName,
                details: `납품 수량 변경으로 인한 재고 조정: ${oldQuantity} → ${newQuantity} (차이: ${quantityDifference > 0 ? '+' : ''}${quantityDifference}) (납품코드: ${existingDelivery.deliveryCode})`
            });

        } catch (error) {
            // 재고 조정 실패 로그
            await this.logService.createDetailedLog({
                moduleName: '재고관리',
                action: 'INVENTORY_ADJUSTMENT_FAIL',
                username,
                targetId: existingDelivery.productCode,
                targetName: existingDelivery.productName,
                details: `납품 수량 변경 재고 조정 실패: ${error.message} (납품코드: ${existingDelivery.deliveryCode})`
            });

            throw new BadRequestException(`재고 조정 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 기존 재고 롤백 (기존 차감된 수량만큼 복구)
     */
    private async rollbackInventory(delivery: Delivery, username: string, isDelete: boolean = false): Promise<void> {
        try {
            // 전체 재고 복구
            const rollbackDto: ChangeQuantityDto = {
                inventoryCode: delivery.productCode,
                quantityChange: delivery.deliveryQuantity, // 양수로 복구
                reason: isDelete 
                    ? `납품 삭제 - 재고 복구 (납품코드: ${delivery.deliveryCode})`
                    : `납품 수정 - 기존 차감 롤백 (납품코드: ${delivery.deliveryCode})`
            };

            await this.inventoryManagementService.changeInventoryQuantity(rollbackDto, username);

            // LOT 재고 복구 (LOT 코드가 있는 경우)
            if (delivery.shippingCode) {
                const shipping = await this.shippingRepository.findOne({
                    where: { shippingCode: delivery.shippingCode }
                });

                if (shipping && (shipping as any).lotCode) {
                    // LOT 재고는 직접 복구 (decreaseLotInventory의 반대)
                    await this.increaseLotInventory(
                        delivery.productCode,
                        (shipping as any).lotCode,
                        delivery.deliveryQuantity,
                        username,
                        isDelete
                    );
                }
            }

        } catch (error) {
            console.error('재고 롤백 실패:', error);
            throw error;
        }
    }

    /**
     * LOT 재고 증가 (롤백용)
     */
    private async increaseLotInventory(
        productCode: string,
        lotCode: string,
        quantity: number,
        username: string,
        isDelete: boolean = false
    ): Promise<void> {
        const lotInventory = await this.inventoryLotService.getLotInventory(productCode, lotCode);
        
        if (lotInventory) {
            // LOT 재고 증가
            await this.inventoryLotService.createOrUpdateLotInventory(
                productCode,
                lotCode,
                quantity, // 양수로 증가
                lotInventory.productName,
                lotInventory.unit,
                lotInventory.storageLocation,
                isDelete ? 'DELETE_ROLLBACK' : 'ROLLBACK',
                username
            );
        }
    }

    /**
     * 재고 차감 (기존 로직과 동일)
     */
    private async decreaseInventory(delivery: Delivery, username: string): Promise<void> {
        try {
            // 전체 재고 차감
            const changeQuantityDto: ChangeQuantityDto = {
                inventoryCode: delivery.productCode,
                quantityChange: -delivery.deliveryQuantity, // 음수로 차감
                reason: `납품 - 납품코드: ${delivery.deliveryCode}`
            };

            await this.inventoryManagementService.changeInventoryQuantity(changeQuantityDto, username);

            // LOT 재고 차감 (LOT 코드가 있는 경우)
            if (delivery.shippingCode) {
                const shipping = await this.shippingRepository.findOne({
                    where: { shippingCode: delivery.shippingCode }
                });

                if (shipping && (shipping as any).lotCode) {
                    await this.inventoryLotService.decreaseLotInventory(
                        delivery.productCode,
                        (shipping as any).lotCode,
                        delivery.deliveryQuantity,
                        username
                    );
                }
            }

        } catch (error) {
            console.error('재고 차감 실패:', error);
            throw error;
        }
    }

}
