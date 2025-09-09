import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from '../entities/shipping.entity';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';
import { logService } from 'src/modules/log/Services/log.service';
import { ShippingCreationHandler } from '../handlers/shipping-creation.handler';

@Injectable()
export class ShippingCreateService {
    constructor(
        @InjectRepository(Shipping)
        private readonly shippingRepository: Repository<Shipping>,
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
        private readonly shippingCreationHandler: ShippingCreationHandler,
    ) {}

    /**
     * 수주코드로 수주 데이터를 조회하여 출하 등록
     */
    async createShippingFromOrder(
        orderCode: string,
        shippingOrderQuantity: number,
        employeeCode?: string,
        employeeName?: string,
        remark?: string,
        username: string = 'system'
    ) {
        try {
            // 수주 데이터 조회
            const orderData = await this.getOrderDataByCode(orderCode);
            
            // 출하코드 자동 생성
            const shippingCode = await this.shippingCreationHandler.generateShippingCode(this.shippingRepository);
            
            // 출하 데이터 생성
            const shippingData = this.shippingCreationHandler.createShippingData(
                orderData,
                shippingCode,
                shippingOrderQuantity,
                employeeCode,
                employeeName,
                remark,
                username
            );
            
            // 출하 데이터 저장
            const savedShipping = await this.shippingRepository.save(shippingData);
            
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '출하관리 생성',
                action: 'CREATE_SUCCESS',
                username,
                targetId: savedShipping.id.toString(),
                targetName: savedShipping.shippingCode,
                details: `수주코드 ${orderCode}로부터 출하 등록: ${savedShipping.shippingCode}`,
            });
            
            return savedShipping;
            
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '출하관리 생성',
                action: 'CREATE_FAIL',
                username,
                targetId: '',
                targetName: orderCode,
                details: `출하 등록 실패: ${error.message}`,
            }).catch(() => {});
            
            throw error;
        }
    }

    /**
     * 수주코드로 수주 데이터 조회
     */
    private async getOrderDataByCode(orderCode: string): Promise<OrderManagement> {
        const orderData = await this.orderManagementRepository.findOne({
            where: { orderCode: orderCode.trim() }
        });
        
        if (!orderData) {
            throw new NotFoundException(`수주코드 '${orderCode}'에 해당하는 수주 데이터를 찾을 수 없습니다.`);
        }
        
        return orderData;
    }


    /**
     * 수주코드 목록 조회 (출하 등록용)
     */
    async getAvailableOrderCodes(username: string = 'system') {
        try {
            // 모든 수주 데이터 조회
            const orders = await this.orderManagementRepository.find({
                select: [
                    'orderCode', 
                    'customerName', 
                    'productName', 
                    'quantity', 
                    'orderDate', 
                    'orderType', 
                    'unitPrice', 
                    'supplyPrice', 
                    'vat', 
                    'total',
                    'customerCode',
                    'projectCode',
                    'projectName',
                    'productCode',
                    'deliveryDate',
                    'estimateCode',
                    'remark'
                ],
                order: { orderDate: 'DESC' }
            });

            // 각 수주에 대해 출하 등록된 수량 계산
            const ordersWithRemainingQuantity = await Promise.all(
                orders.map(async (order) => {
                    const { shippedQuantity } = await this.shippingCreationHandler.calculateShippedQuantity(
                        this.shippingRepository,
                        order.orderCode
                    );
                    const remainingQuantity = order.quantity - shippedQuantity;

                    return {
                        ...order,
                        remainingQuantity: Math.max(0, remainingQuantity), // 음수 방지
                        shippedQuantity
                    };
                })
            );

            // 출하 가능한 수주만 필터링 (남은 수량이 0보다 큰 것)
            const availableOrders = this.shippingCreationHandler.filterAvailableOrders(orders, ordersWithRemainingQuantity);
            
            await this.logService.createDetailedLog({
                moduleName: '출하관리 조회',
                action: 'READ_SUCCESS',
                username,
                targetId: '',
                targetName: '수주코드 목록',
                details: `출하 등록 가능한 수주코드 목록 조회: ${availableOrders.length}개`,
            });
            
            return availableOrders;
            
        } catch (error) {
            throw error;
        }
    }
}
