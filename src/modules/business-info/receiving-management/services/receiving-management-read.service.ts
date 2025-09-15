import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '../../order-info/entities/order-info.entity';
import { logService } from 'src/modules/log/Services/log.service';

@Injectable()
export class ReceivingManagementReadService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
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

            // QueryBuilder로 승인된 발주품목 조회 (OrderInfo 엔티티 사용)
            const queryBuilder = this.orderInfoRepository
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
                .where('oi.approvalInfo = :status', { status: '승인' })
                .orderBy('oi.orderDate', 'DESC');

            // 검색 조건 추가
            if (search) {
                queryBuilder.andWhere(
                    '(oi.orderCode LIKE :search OR oi.customerName LIKE :search OR oi.productName LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            if (productCode) {
                queryBuilder.andWhere('oi.productCode = :productCode', { productCode });
            }

            if (customerCode) {
                queryBuilder.andWhere('oi.customerCode = :customerCode', { customerCode });
            }

            if (startDate) {
                queryBuilder.andWhere('oi.orderDate >= :startDate', { startDate });
            }

            if (endDate) {
                queryBuilder.andWhere('oi.orderDate <= :endDate', { endDate });
            }

            // 전체 개수 조회
            const total = await queryBuilder.getCount();

            // 페이지네이션
            const offset = (page - 1) * limit;
            queryBuilder.skip(offset).take(limit);

            const results = await queryBuilder.getRawMany();

            // 결과 데이터 변환
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

                quantity: parseInt(row.quantity) || 0,
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
