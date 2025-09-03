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

            // 받은 데이터 그대로 업데이트
            const updateData: Partial<OrderManagement> = {
                ...updateOrderManagementDto,
                // 가격 필드들은 문자열로 변환
                unitPrice: updateOrderManagementDto.unitPrice?.toString(),
                supplyPrice: updateOrderManagementDto.supplyPrice?.toString(),
                vat: updateOrderManagementDto.vat?.toString(),
                total: updateOrderManagementDto.total?.toString(),
                // 날짜 필드들은 Date 객체로 변환
                orderDate: updateOrderManagementDto.orderDate ? new Date(updateOrderManagementDto.orderDate) : undefined,
                deliveryDate: updateOrderManagementDto.deliveryDate ? new Date(updateOrderManagementDto.deliveryDate) : undefined,
            };

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

            return updatedOrder;
        } catch (error) {
            throw error;
        }
    }

}
