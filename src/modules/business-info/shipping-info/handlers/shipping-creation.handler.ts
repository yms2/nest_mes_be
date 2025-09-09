import { Injectable } from '@nestjs/common';
import { Shipping } from '../entities/shipping.entity';
import { OrderManagement } from '../../ordermanagement-info/entities/ordermanagement.entity';

@Injectable()
export class ShippingCreationHandler {
    /**
     * 출하코드 자동 생성
     */
    async generateShippingCode(shippingRepository: any): Promise<string> {
        const today = new Date();
        const dateStr = today.getFullYear().toString() + 
                       (today.getMonth() + 1).toString().padStart(2, '0') + 
                       today.getDate().toString().padStart(2, '0');
        
        // 오늘 날짜로 생성된 출하코드 개수 조회
        const count = await shippingRepository
            .createQueryBuilder('shipping')
            .where('shipping.shippingCode LIKE :pattern', { pattern: `SHP${dateStr}%` })
            .getCount();
        
        // 순번 생성 (3자리, 0으로 패딩)
        const sequence = (count + 1).toString().padStart(3, '0');
        
        return `SHP${dateStr}${sequence}`;
    }

    /**
     * 출하 데이터 생성
     */
    createShippingData(
        orderData: OrderManagement,
        shippingCode: string,
        shippingOrderQuantity: number,
        employeeCode?: string,
        employeeName?: string,
        remark?: string,
        username: string = 'system'
    ): Partial<Shipping> {
        // 수주 데이터에서 가격 정보 추출 (문자열을 숫자로 변환)
        const orderSupplyPrice = parseInt(orderData.supplyPrice) || 0;
        const orderVat = parseInt(orderData.vat) || 0;
        const orderTotal = parseInt(orderData.total) || 0;
        const orderQuantity = orderData.quantity || 1; // 수주 수량
        
        // 지시수량에 비례한 가격 계산
        const ratio = orderQuantity > 0 ? shippingOrderQuantity / orderQuantity : 0;
        const supplyPrice = Math.round(orderSupplyPrice * ratio);
        const vat = Math.round(orderVat * ratio);
        const total = Math.round(orderTotal * ratio);
        
        return {
            shippingCode,
            shippingDate: new Date(),
            orderCode: orderData.orderCode,
            inventoryQuantity: orderData.quantity, // 수주 수량을 재고 수량으로 설정
            shippingOrderQuantity,
            shippingStatus: shippingOrderQuantity > 0 ? '지시완료' : '지시대기',
            supplyPrice: supplyPrice.toString(),
            vat: vat.toString(),
            total: total.toString(),
            employeeCode: employeeCode || '',
            employeeName: employeeName || '',
            remark: remark || '',
            createdBy: username
        };
    }

    /**
     * 수주별 출하 등록 수량 계산
     */
    async calculateShippedQuantity(
        shippingRepository: any,
        orderCode: string
    ): Promise<{ shippedQuantity: number; remainingQuantity: number }> {
        // 해당 수주코드로 등록된 출하들의 총 지시수량 합계
        const totalShippedQuantity = await shippingRepository
            .createQueryBuilder('shipping')
            .select('SUM(shipping.shippingOrderQuantity)', 'totalShipped')
            .where('shipping.orderCode = :orderCode', { orderCode })
            .getRawOne();

        const shippedQuantity = parseInt(totalShippedQuantity?.totalShipped) || 0;
        
        return {
            shippedQuantity,
            remainingQuantity: 0 // 이 값은 호출하는 곳에서 orderQuantity와 함께 계산
        };
    }

    /**
     * 출하 가능한 수주 필터링
     */
    filterAvailableOrders(
        orders: any[],
        ordersWithShippedQuantity: any[]
    ): any[] {
        return ordersWithShippedQuantity.filter(order => order.remainingQuantity > 0);
    }
}
