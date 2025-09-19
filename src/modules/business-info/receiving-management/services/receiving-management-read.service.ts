import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '../../order-info/entities/order-info.entity';
import { Receiving } from '../entities/receiving.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class ReceivingManagementReadService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        @InjectRepository(Receiving)
        private readonly receivingRepository: Repository<Receiving>,
        private readonly logService: logService,
    ) {}

    /**
     * 승인된 발주품목 조회
     * @param searchParams 검색 조건
     * @returns 승인된 발주품목 목록
     */
    async getApprovedOrderItems(searchParams: {
        page?: number;
        limit?: number;
        search?: string;
        productCode?: string;
        customerCode?: string;
        startDate?: string;
        endDate?: string;
    } = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                productCode,
                customerCode,
                startDate,
                endDate
            } = searchParams;

            // 1단계: 모든 승인된 발주품목 조회
            const baseQuery = this.orderInfoRepository
                .createQueryBuilder('oi')
                .leftJoin('product_info', 'pi', 'oi.parentProductCode = pi.product_code')
                .select([
                    'oi.orderCode as orderCode',
                    'oi.customerCode as customerCode',
                    'oi.customerName as customerName',
                    'oi.projectCode as projectCode',
                    'oi.projectName as projectName',
                    'oi.projectVersion as projectVersion',
                    'oi.orderDate as orderDate',
                    'oi.deliveryDate as deliveryDate',
                    'oi.productCode as productCode',
                    'oi.productName as productName',
                    'oi.orderQuantity as quantity',
                    'oi.parentProductCode as parentProductCode',
                    'pi.product_name as parentProductName',
                    'oi.unitPrice as unitPrice',
                    'oi.totalAmount as totalAmount',
                    'oi.remark as remark',
                    'oi.approvalInfo as approvalInfo'
                ])
                .where('oi.approvalInfo = :status', { status: '승인' });

            // 검색 조건 추가
            if (search) {
                baseQuery.andWhere(
                    '(oi.orderCode LIKE :search OR oi.customerName LIKE :search OR oi.productName LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            if (productCode) {
                baseQuery.andWhere('oi.productCode = :productCode', { productCode });
            }

            if (customerCode) {
                baseQuery.andWhere('oi.customerCode = :customerCode', { customerCode });
            }

            if (startDate) {
                baseQuery.andWhere('oi.orderDate >= :startDate', { startDate });
            }

            if (endDate) {
                baseQuery.andWhere('oi.orderDate <= :endDate', { endDate });
            }

            // 2단계: 모든 발주품목 조회
            const allOrderItems = await baseQuery.getRawMany();

            // 3단계: 각 발주품목별 입고 수량 조회
            const orderItemsWithReceivedQuantity = await Promise.all(
                allOrderItems.map(async (item) => {
                    const receivedQuantity = await this.receivingRepository
                        .createQueryBuilder('r')
                        .select('COALESCE(SUM(r.quantity), 0)', 'totalReceived')
                        .where('r.orderCode = :orderCode', { orderCode: item.orderCode })
                        .andWhere('r.productCode = :productCode', { productCode: item.productCode })
                        .getRawOne();

                    const totalReceived = parseInt(receivedQuantity?.totalReceived || '0');
                    const orderQuantity = parseInt(item.quantity || '0');
                    const remainingQuantity = orderQuantity - totalReceived;

                    return {
                        ...item,
                        receivedQuantity: totalReceived,
                        remainingQuantity: remainingQuantity,
                        quantity: orderQuantity
                    };
                })
            );

            // 4단계: 미입고 수량이 있는 항목만 필터링
            const filteredItems = orderItemsWithReceivedQuantity.filter(
                item => item.remainingQuantity > 0
            );

            // 5단계: 정렬
            filteredItems.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

            // 6단계: 페이지네이션
            const total = filteredItems.length;
            const offset = (page - 1) * limit;
            const results = filteredItems.slice(offset, offset + limit);

            // 결과 데이터 변환 (이미 계산된 값들을 사용)
            const data = results.map((row: any) => ({
                parentProductCode: row.parentProductCode || '',
                parentProductName: row.parentProductName || '',
                orderCode: row.orderCode,
                customerCode: row.customerCode,
                customerName: row.customerName,
                projectCode: row.projectCode,
                projectName: row.projectName,
                projectVersion: row.projectVersion,
                orderDate: row.orderDate,
                deliveryDate: row.deliveryDate,
                productCode: row.productCode,
                productName: row.productName,
                quantity: row.quantity, // 발주 수량
                receivedQuantity: row.receivedQuantity, // 입고 수량
                remainingQuantity: row.remainingQuantity, // 미입고 수량
                unitPrice: parseFloat(row.unitPrice) || 0,
                totalAmount: parseInt(row.totalAmount) || 0,
                remark: row.remark || '',
                approvalInfo: row.approvalInfo
            }));

            const totalPages = Math.ceil(total / limit);

            return {
                data,
                total,
                page,
                limit,
                totalPages
            };

        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '입고관리 발주품목 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: 'approved-order-items',
                targetName: '승인된 발주품목',
                details: `승인된 발주품목 조회 실패: ${error.message}`,
            });
            throw error;
        }
    }
}
