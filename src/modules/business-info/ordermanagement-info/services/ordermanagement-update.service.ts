import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { UpdateOrderManagementDto } from '../dto/ordermanagement-update.dto';
import { logService } from 'src/modules/log/Services/log.service';
import { OrderManagementValidationHandler } from '../handlers/ordermanagement-validation.handler';

@Injectable()
export class OrderManagementUpdateService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

    /**
     * ID를 통해 주문 정보를 수정합니다.
     * @param id 주문 ID
     * @param updateOrderManagementDto 수정할 주문 데이터
     * @param updatedBy 수정자
     * @returns 수정된 주문 정보
     */
    async updateOrderManagement(
        id: number,
        updateOrderManagementDto: UpdateOrderManagementDto,
        updatedBy: string,
    ): Promise<OrderManagement> {
        try {
            // 입력 데이터 검증
            OrderManagementValidationHandler.validateUpdateData(updateOrderManagementDto);

            // 기존 주문 정보 조회
            const existingOrder = await this.orderManagementRepository.findOne({
                where: { id }
            });

            if (!existingOrder) {
                throw new NotFoundException(`ID ${id}인 주문을 찾을 수 없습니다.`);
            }

            // 수정 가능한 필드들만 업데이트
            const updateData: Partial<OrderManagement> = {};

            // 기본 정보 업데이트
            if (updateOrderManagementDto.customerCode !== undefined) {
                updateData.customerCode = updateOrderManagementDto.customerCode;
            }
            if (updateOrderManagementDto.customerName !== undefined) {
                updateData.customerName = updateOrderManagementDto.customerName;
            }
            if (updateOrderManagementDto.projectCode !== undefined) {
                updateData.projectCode = updateOrderManagementDto.projectCode;
            }
            if (updateOrderManagementDto.projectName !== undefined) {
                updateData.projectName = updateOrderManagementDto.projectName;
            }
            if (updateOrderManagementDto.productCode !== undefined) {
                updateData.productCode = updateOrderManagementDto.productCode;
            }
            if (updateOrderManagementDto.productName !== undefined) {
                updateData.productName = updateOrderManagementDto.productName;
            }
            if (updateOrderManagementDto.orderType !== undefined) {
                updateData.orderType = updateOrderManagementDto.orderType;
            }
            if (updateOrderManagementDto.quantity !== undefined) {
                updateData.quantity = updateOrderManagementDto.quantity;
            }
            if (updateOrderManagementDto.unitPrice !== undefined) {
                updateData.unitPrice = updateOrderManagementDto.unitPrice.toString();
            }
            if (updateOrderManagementDto.supplyPrice !== undefined) {
                updateData.supplyPrice = updateOrderManagementDto.supplyPrice.toString();
            }
            if (updateOrderManagementDto.vat !== undefined) {
                updateData.vat = updateOrderManagementDto.vat.toString();
            }
            if (updateOrderManagementDto.total !== undefined) {
                updateData.total = updateOrderManagementDto.total.toString();
            }
            if (updateOrderManagementDto.orderDate !== undefined) {
                updateData.orderDate = new Date(updateOrderManagementDto.orderDate);
            }
            if (updateOrderManagementDto.deliveryDate !== undefined) {
                updateData.deliveryDate = new Date(updateOrderManagementDto.deliveryDate);
            }
            if (updateOrderManagementDto.estimateCode !== undefined) {
                updateData.estimateCode = updateOrderManagementDto.estimateCode;
            }
            if (updateOrderManagementDto.remark !== undefined) {
                updateData.remark = updateOrderManagementDto.remark;
            }

            // 수정자 정보 업데이트
            updateData.updatedBy = updatedBy;
            updateData.updatedAt = new Date();

            // 주문 정보 업데이트
            await this.orderManagementRepository.update(id, updateData);

            // 업데이트된 주문 정보 조회
            const updatedOrder = await this.orderManagementRepository.findOne({
                where: { id }
            });

            if (!updatedOrder) {
                throw new Error('주문 정보 업데이트 후 조회에 실패했습니다.');
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '주문관리 수정',
                action: 'UPDATE_SUCCESS',
                username: updatedBy,
                targetId: id.toString(),
                targetName: `${updatedOrder.orderCode} - ${updatedOrder.customerName}`,
                details: `주문 정보 수정 성공: ${updatedOrder.orderCode} (고객: ${updatedOrder.customerName}, 제품: ${updatedOrder.productName})`,
            });

            return updatedOrder;
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '주문관리 수정',
                action: 'UPDATE_FAIL',
                username: updatedBy,
                targetId: id.toString(),
                targetName: `주문 ID: ${id}`,
                details: `주문 정보 수정 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }

    /**
     * 주문 타입을 수정합니다.
     * @param id 주문 ID
     * @param orderType 새로운 주문 타입
     * @param updatedBy 수정자
     * @returns 수정된 주문 정보
     */
    async updateOrderType(
        id: number,
        orderType: string,
        updatedBy: string,
    ): Promise<OrderManagement> {
        try {
            // 입력 데이터 검증
            OrderManagementValidationHandler.validateOrderType(orderType);

            // 기존 주문 정보 조회
            const existingOrder = await this.orderManagementRepository.findOne({
                where: { id }
            });

            if (!existingOrder) {
                throw new NotFoundException(`ID ${id}인 주문을 찾을 수 없습니다.`);
            }

            // 주문 타입 업데이트
            await this.orderManagementRepository.update(id, {
                orderType,
                updatedBy,
                updatedAt: new Date(),
            });

            // 업데이트된 주문 정보 조회
            const updatedOrder = await this.orderManagementRepository.findOne({
                where: { id }
            });

            if (!updatedOrder) {
                throw new Error('주문 타입 업데이트 후 조회에 실패했습니다.');
            }

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '주문관리 타입 수정',
                action: 'TYPE_UPDATE_SUCCESS',
                username: updatedBy,
                targetId: id.toString(),
                targetName: `${updatedOrder.orderCode} - ${updatedOrder.customerName}`,
                details: `주문 타입 수정: ${existingOrder.orderType} → ${orderType}`,
            });

            return updatedOrder;
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '주문관리 타입 수정',
                action: 'TYPE_UPDATE_FAIL',
                username: updatedBy,
                targetId: id.toString(),
                targetName: `주문 ID: ${id}`,
                details: `주문 타입 수정 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }


}
