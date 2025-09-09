import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from '../entities/shipping.entity';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { UpdateShippingDto } from '../dto/update-shipping.dto';

@Injectable()
export class ShippingUpdateService {
    constructor(
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

    /**
     * 출하 정보 업데이트
     */
    async updateShipping(
        id: number,
        updateShippingDto: UpdateShippingDto,
        username: string
    ): Promise<Shipping> {
        try {
            // 출하 정보 조회
            const shipping = await this.shippingRepository.findOne({
                where: { id },
                relations: ['orderManagement']
            });

            if (!shipping) {
                throw new NotFoundException(`ID ${id}인 출하를 찾을 수 없습니다.`);
            }

            // 수량이 변경된 경우 가격 재계산
            if (updateShippingDto.shippingOrderQuantity !== undefined) {
                const newQuantity = updateShippingDto.shippingOrderQuantity;
                
                // 수주코드로 수주 정보 조회하여 단가 가져오기
                const orderData = await this.orderManagementRepository.findOne({
                    where: { orderCode: shipping.orderCode }
                });

                if (!orderData) {
                    throw new NotFoundException(`수주코드 '${shipping.orderCode}'에 해당하는 수주 정보를 찾을 수 없습니다.`);
                }

                // 단가 기준으로 계산
                const unitPrice = parseInt(orderData.unitPrice || '0') || 0;
                const newSupplyPrice = unitPrice * newQuantity;
                const newVat = Math.round(newSupplyPrice * 0.1); // 부가세 10%
                const newTotal = newSupplyPrice + newVat;

                // 가격 정보 업데이트 (항상 계산된 값으로 설정)
                updateShippingDto = {
                    ...updateShippingDto,
                    supplyPrice: newSupplyPrice.toString(),
                    vat: newVat.toString(),
                    total: newTotal.toString()
                } as any;
            }

            // 상태 업데이트 (수량에 따라 자동 설정)
            if (updateShippingDto.shippingOrderQuantity !== undefined) {
                updateShippingDto.shippingStatus = updateShippingDto.shippingOrderQuantity > 0 ? '지시완료' : '지시대기';
            }

            // 출하 정보 업데이트
            await this.shippingRepository.update(id, {
                ...updateShippingDto,
                updatedBy: username
            });

            // 업데이트된 출하 정보 조회
            const updatedShipping = await this.shippingRepository.findOne({
                where: { id },
                relations: ['orderManagement']
            });

            if (!updatedShipping) {
                throw new NotFoundException(`업데이트 후 출하 정보를 찾을 수 없습니다.`);
            }

            await this.logService.createDetailedLog({
                moduleName: '출하관리 수정',
                action: 'UPDATE_SUCCESS',
                username,
                targetId: id.toString(),
                targetName: updatedShipping.shippingCode,
                details: `출하 정보 수정: ${updatedShipping.shippingCode}`,
            });

            return updatedShipping;
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '출하관리 수정',
                action: 'UPDATE_FAIL',
                username,
                targetId: id.toString(),
                targetName: '출하 수정 실패',
                details: `출하 수정 실패: ${error.message}`,
            }).catch(() => {});

            throw error;
        }
    }

    /**
     * 출하 상태 일괄 업데이트
     */
    async updateShippingStatus(
        ids: number[],
        status: string,
        username: string
    ): Promise<{ updatedCount: number; failedIds: number[] }> {
        try {
            const failedIds: number[] = [];
            let updatedCount = 0;

            for (const id of ids) {
                try {
                    const shipping = await this.shippingRepository.findOne({ where: { id } });
                    if (!shipping) {
                        failedIds.push(id);
                        continue;
                    }

                    await this.shippingRepository.update(id, {
                        shippingStatus: status,
                        updatedBy: username
                    });
                    updatedCount++;
                } catch (error) {
                    failedIds.push(id);
                }
            }

            await this.logService.createDetailedLog({
                moduleName: '출하관리 일괄수정',
                action: 'BATCH_UPDATE_SUCCESS',
                username,
                targetId: '',
                targetName: '출하 상태 일괄 수정',
                details: `출하 상태 일괄 수정: ${updatedCount}개 성공, ${failedIds.length}개 실패`,
            });

            return { updatedCount, failedIds };
        } catch (error) {
            throw error;
        }
    }
}
