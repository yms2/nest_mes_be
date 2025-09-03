import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderManagement } from '../entities/ordermanagement.entity';
import { CreateOrderManagementDto } from '../dto/ordermanagement-create.dto';
import { EstimateManagement } from '../../estimatemanagement-info/entities/estimatemanagement.entity';

@Injectable()
export class OrderManagementCreateService {
    constructor(
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        @InjectRepository(EstimateManagement)
        private readonly estimateRepository: Repository<EstimateManagement>,
    ) {}


    async createOrderManagement(
        createOrderManagementDto: CreateOrderManagementDto,
        createdBy: string,
    ): Promise<OrderManagement> {
        try {
            // 주문 코드 자동 생성 (ORD + 현재 날짜 + 3자리 순번)
            const today = new Date();
            const dateStr = today.getFullYear().toString() + 
                           (today.getMonth() + 1).toString().padStart(2, '0') + 
                           today.getDate().toString().padStart(2, '0');
            
            // 오늘 날짜의 마지막 주문 코드 조회
            const lastOrder = await this.orderManagementRepository
                .createQueryBuilder('order')
                .where('order.orderCode LIKE :orderCode', { orderCode: `ORD${dateStr}%` })
                .orderBy('order.orderCode', 'DESC')
                .getOne();

            let sequence = 1;
            if (lastOrder) {
                const lastSequence = parseInt(lastOrder.orderCode.slice(-3));
                sequence = lastSequence + 1;
            }

            const orderCode = `ORD${dateStr}${sequence.toString().padStart(3, '0')}`;

            // 주문관리 엔티티 생성
            const orderManagement = this.orderManagementRepository.create({
                ...createOrderManagementDto,
                orderCode,
                unitPrice: createOrderManagementDto.unitPrice.toString(),
                supplyPrice: createOrderManagementDto.supplyPrice.toString(),
                vat: createOrderManagementDto.vat.toString(),
                total: createOrderManagementDto.total.toString(),
                createdBy: createdBy, // BaseEntity의 createdBy 필드에 설정
            });

            // 데이터베이스에 저장
            const savedOrderManagement = await this.orderManagementRepository.save(orderManagement);

            // 견적 테이블에 수주 코드 업데이트
            if (createOrderManagementDto.estimateCode) {
                await this.updateEstimateWithOrderCode(
                    createOrderManagementDto.estimateCode, 
                    orderCode
                );
            }

            return savedOrderManagement;
        } catch (error) {
            throw new Error(`주문관리 등록 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    /**
     * 주문 코드 중복 확인
     * @param orderCode 주문 코드
     * @returns 중복 여부
     */
    async checkOrderCodeDuplicate(orderCode: string): Promise<boolean> {
        const existingOrder = await this.orderManagementRepository.findOne({
            where: { orderCode }
        });
        return !!existingOrder;
    }

    /**
     * 견적 테이블에 수주 코드 업데이트
     * @param estimateCode 견적 코드
     * @param orderCode 수주 코드
     */
    private async updateEstimateWithOrderCode(estimateCode: string, orderCode: string): Promise<void> {
        try {
            // 견적 코드로 견적 정보 조회
            const estimate = await this.estimateRepository.findOne({
                where: { estimateCode }
            });

            if (estimate) {
                // 견적에 수주 코드 업데이트
                estimate.ordermanagementCode = orderCode;
                await this.estimateRepository.save(estimate);
            }
        } catch (error) {
            console.error(`견적 테이블 업데이트 중 오류 발생: ${error.message}`);
            // 견적 업데이트 실패해도 수주 등록은 계속 진행
        }
    }
}