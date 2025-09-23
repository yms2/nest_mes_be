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

    /**
     * 입고내역 조회
     * @param searchParams 검색 조건
     * @returns 입고내역 목록
     */
    async getReceivingHistory(searchParams: {
        page?: number;
        limit?: number;
        search?: string;
        customerName?: string;
        productName?: string;
        projectName?: string;
        lotCode?: string;
        warehouseName?: string;
        approvalStatus?: string;
    } = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                customerName,
                productName,
                projectName,
                lotCode,
                warehouseName,
                approvalStatus
            } = searchParams;

            // 기본 쿼리 생성
            const query = this.receivingRepository
                .createQueryBuilder('r')
                .select([
                    'r.id as id',
                    'r.receivingCode as receivingCode',
                    'r.receivingDate as receivingDate',
                    'r.orderCode as orderCode',
                    'r.productCode as productCode',
                    'r.customerCode as customerCode',
                    'r.customerName as customerName',
                    'r.productName as productName',
                    'r.unit as unit',
                    'r.projectCode as projectCode',
                    'r.projectName as projectName',
                    'r.quantity as quantity',
                    'r.unreceivedQuantity as unreceivedQuantity',
                    'r.lotCode as lotCode',
                    'r.warehouseCode as warehouseCode',
                    'r.warehouseName as warehouseName',
                    'r.unitPrice as unitPrice',
                    'r.supplyPrice as supplyPrice',
                    'r.vat as vat',
                    'r.total as total',
                    'r.remark as remark',
                    'r.approvalStatus as approvalStatus',
                    'r.createdAt as createdAt',
                    'r.updatedAt as updatedAt'
                ])
                .orderBy('r.receivingDate', 'DESC')
                .addOrderBy('r.createdAt', 'DESC');

            // 통합 검색 (거래처명, 품목명)
            if (search) {
                query.andWhere(
                    '(r.customerName LIKE :search OR r.productName LIKE :search)',
                    { search: `%${search}%` }
                );
            }

            // 컬럼별 검색 조건

            if (customerName) {
                query.andWhere('r.customerName LIKE :customerName', { customerName: `%${customerName}%` });
            }

            if (productName) {
                query.andWhere('r.productName LIKE :productName', { productName: `%${productName}%` });
            }


            if (projectName) {
                query.andWhere('r.projectName LIKE :projectName', { projectName: `%${projectName}%` });
            }

            if (lotCode) {
                query.andWhere('r.lotCode LIKE :lotCode', { lotCode: `%${lotCode}%` });
            }

            if (warehouseName) {
                query.andWhere('r.warehouseName LIKE :warehouseName', { warehouseName: `%${warehouseName}%` });
            }

            if (approvalStatus) {
                query.andWhere('r.approvalStatus = :approvalStatus', { approvalStatus });
            }

            // 전체 개수 조회
            const total = await query.getCount();

            // 페이지네이션 적용
            const offset = (page - 1) * limit;
            const results = await query
                .offset(offset)
                .limit(limit)
                .getRawMany();

            // 결과 데이터 변환
            const data = results.map((row: any) => ({
                id: row.id,
                receivingCode: row.receivingCode,
                receivingDate: row.receivingDate,
                orderCode: row.orderCode,
                productCode: row.productCode,
                customerCode: row.customerCode,
                customerName: row.customerName,
                productName: row.productName,
                unit: row.unit,
                projectCode: row.projectCode,
                projectName: row.projectName,
                quantity: parseInt(row.quantity) || 0,
                unreceivedQuantity: parseInt(row.unreceivedQuantity) || 0,
                lotCode: row.lotCode,
                warehouseCode: row.warehouseCode,
                warehouseName: row.warehouseName,
                unitPrice: parseInt(row.unitPrice) || 0,
                supplyPrice: parseInt(row.supplyPrice) || 0,
                vat: parseInt(row.vat) || 0,
                total: parseInt(row.total) || 0,
                remark: row.remark || '',
                approvalStatus: row.approvalStatus,
                createdAt: row.createdAt,
                updatedAt: row.updatedAt
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
                moduleName: '입고관리 입고내역 조회',
                action: 'READ_FAILED',
                username: 'system',
                targetId: 'receiving-history',
                targetName: '입고내역',
                details: `입고내역 조회 실패: ${error.message}`,
            });
            throw error;
        }
    }
}
