import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '../entities/order-info.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { UpdateOrderInfoDto } from '../dto/update-order-info.dto';

@Injectable()
export class OrderUpdateService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        private readonly logService: logService,
    ) {}

    /**
     * 발주 정보를 수정합니다.
     */
    async updateOrderInfo(id: number, updateOrderInfoDto: UpdateOrderInfoDto, username: string = 'system') {
        try {

            // 기존 발주 정보 조회
            const existingOrderInfo = await this.orderInfoRepository.findOne({ where: { id } });
            if (!existingOrderInfo) {
                throw new Error(`ID ${id}에 해당하는 발주 정보를 찾을 수 없습니다.`);
            }

            // 수정할 데이터 처리
            const processedData: any = {
                ...updateOrderInfoDto,
                updatedBy: username
            };

            // 날짜 필드가 있으면 변환
            if (updateOrderInfoDto.orderDate) {
                processedData.orderDate = this.convertToDate(updateOrderInfoDto.orderDate);
            }
            if (updateOrderInfoDto.deliveryDate) {
                processedData.deliveryDate = this.convertToDate(updateOrderInfoDto.deliveryDate);
            }

            // 수량이 변경되면 가격 재계산
            if (updateOrderInfoDto.orderQuantity && updateOrderInfoDto.orderQuantity !== existingOrderInfo.orderQuantity) {
                const unitPrice = updateOrderInfoDto.unitPrice || existingOrderInfo.unitPrice || 0;
                const supplyPrice = unitPrice * updateOrderInfoDto.orderQuantity;
                const vat = Math.round(supplyPrice * 0.1); // 부가세 10%
                const total = supplyPrice + vat;

                processedData.usePlanQuantity = updateOrderInfoDto.orderQuantity;
                processedData.supplyPrice = supplyPrice;
                processedData.vat = vat;
                processedData.total = total;
                processedData.totalAmount = total;
            }

            // 발주 정보 수정
            await this.orderInfoRepository.update(id, processedData);
            
            // 수정된 발주 정보 조회
            const updatedOrderInfo = await this.orderInfoRepository.findOne({ where: { id } });

            if (!updatedOrderInfo) {
                throw new Error('수정된 발주 정보를 조회할 수 없습니다.');
            }


            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 수정',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: id.toString(),
                targetName: updatedOrderInfo.orderName || '발주 정보',
                details: `발주 정보 수정 완료: ${updatedOrderInfo.orderCode}`,
            });

            return {
                success: true,
                message: '발주 정보가 성공적으로 수정되었습니다.',
                orderInfo: updatedOrderInfo
            };

        } catch (error) {
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 수정',
                action: 'UPDATE_FAILED',
                username,
                targetId: id.toString(),
                targetName: '발주 정보',
                details: `발주 정보 수정 실패: ${error.message}`,
            });

            throw error;
        }
    }

    /**
     * 발주 아이템을 수정합니다. (내부 메서드)
     */
    private async updatePurchaseOrderItem(id: number, updateData: any, username: string = 'system') {
        try {

            // 기존 발주 아이템 조회
            const existingItem = await this.orderInfoRepository.findOne({ where: { id } });
            if (!existingItem) {
                throw new Error(`ID ${id}에 해당하는 발주 아이템을 찾을 수 없습니다.`);
            }

            // 수정할 데이터 처리
            const processedData: any = {
                ...updateData,
                updatedBy: username
            };

            // 날짜 필드가 있으면 변환
            if (updateData.orderDate) {
                processedData.orderDate = this.convertToDate(updateData.orderDate);
            }
            if (updateData.deliveryDate) {
                processedData.deliveryDate = this.convertToDate(updateData.deliveryDate);
            }

            // 수량이 변경되면 가격 재계산
            if (updateData.orderQuantity && updateData.orderQuantity !== existingItem.orderQuantity) {
                const unitPrice = updateData.unitPrice || existingItem.unitPrice || 0;
                const supplyPrice = unitPrice * updateData.orderQuantity;
                const vat = Math.round(supplyPrice * 0.1); // 부가세 10%
                const total = supplyPrice + vat;

                processedData.usePlanQuantity = updateData.orderQuantity;
                processedData.supplyPrice = supplyPrice;
                processedData.vat = vat;
                processedData.total = total;
                processedData.totalAmount = total;
            }

            // 발주 아이템 수정
            await this.orderInfoRepository.update(id, processedData);
            
            // 수정된 발주 아이템 조회
            const updatedItem = await this.orderInfoRepository.findOne({ where: { id } });

            if (!updatedItem) {
                throw new Error('수정된 발주 아이템을 조회할 수 없습니다.');
            }


            return {
                success: true,
                message: '발주 아이템이 성공적으로 수정되었습니다.',
                updatedItem: updatedItem
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * 여러 발주 아이템을 일괄 수정합니다.
     */
    async updateMultiplePurchaseOrderItems(updateItems: Array<{id: number, data: any}>, username: string = 'system') {
        try {

            const updatedItems: any[] = [];
            const failedItems: any[] = [];

            for (const item of updateItems) {
                try {
                    const result = await this.updatePurchaseOrderItem(item.id, item.data, username);
                    updatedItems.push(result.updatedItem);
                } catch (error: any) {
                    failedItems.push({
                        id: item.id,
                        error: error.message
                    });
                }
            }


            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 일괄 수정',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: '일괄 수정',
                targetName: '발주 아이템',
                details: `발주 아이템 일괄 수정 완료: 성공 ${updatedItems.length}개, 실패 ${failedItems.length}개`,
            });

            return {
                success: true,
                message: `발주 아이템 일괄 수정 완료: 성공 ${updatedItems.length}개, 실패 ${failedItems.length}개`,
                updatedItems,
                failedItems,
                successCount: updatedItems.length,
                failCount: failedItems.length
            };

        } catch (error) {
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 일괄 수정',
                action: 'UPDATE_FAILED',
                username,
                targetId: '일괄 수정',
                targetName: '발주 아이템',
                details: `발주 아이템 일괄 수정 실패: ${error.message}`,
            });

            throw error;
        }
    }


    /**
     * 날짜 문자열을 Date 객체로 변환합니다.
     */
    private convertToDate(dateValue: any): Date | null {
        if (!dateValue) {
            return null;
        }

        // 이미 Date 객체인 경우
        if (dateValue instanceof Date) {
            return dateValue;
        }

        // 문자열인 경우
        if (typeof dateValue === 'string') {
            // ISO 8601 형식인지 확인
            if (dateValue.includes('T') || dateValue.includes('Z')) {
                return new Date(dateValue);
            }
            
            // YYYY-MM-DD 형식인지 확인
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                return new Date(dateValue + 'T00:00:00.000Z');
            }
            
            // 다른 형식의 날짜 문자열
            const parsedDate = new Date(dateValue);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }

        // 숫자인 경우 (타임스탬프)
        if (typeof dateValue === 'number') {
            return new Date(dateValue);
        }

        return null;
    }
}
