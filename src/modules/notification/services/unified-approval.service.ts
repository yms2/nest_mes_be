import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '@/modules/business-info/order-info/entities/order-info.entity';
import { QualityInspection } from '@/modules/quality/inspection/entities/quality-inspection.entity';
import { OrderManagement } from '@/modules/business-info/ordermanagement-info/entities/ordermanagement.entity';
import { logService } from '@/modules/log/Services/log.service';

@Injectable()
export class UnifiedApprovalService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        @InjectRepository(QualityInspection)
        private readonly inspectionRepository: Repository<QualityInspection>,
        @InjectRepository(OrderManagement)
        private readonly orderManagementRepository: Repository<OrderManagement>,
        private readonly logService: logService,
    ) {}

    /**
     * 모든 승인 대기 항목을 통합 조회합니다.
     */
    async getAllPendingApprovals(page: number = 1, limit: number = 20, username: string = 'system') {
        try {
            const offset = (page - 1) * limit;

            // 1. 발주 승인 대기 목록
            const [pendingOrders, orderTotal] = await this.orderInfoRepository.findAndCount({
                where: { approvalInfo: '대기' },
                order: { createdAt: 'DESC' },
                skip: offset,
                take: limit
            });

            // 2. 품질검사 승인 대기 목록
            const [pendingInspections, inspectionTotal] = await this.inspectionRepository.findAndCount({
                where: { inspectionStatus: 'PENDING' },
                order: { createdAt: 'DESC' },
                skip: offset,
                take: limit
            });

            // 3. 수주 승인 대기 목록 (approvalInfo가 있는 경우)
            const [pendingOrderManagement, orderManagementTotal] = await this.orderManagementRepository.findAndCount({
                where: { approvalInfo: '대기' },
                order: { createdAt: 'DESC' },
                skip: offset,
                take: limit
            });

            // 통합 데이터 생성
            const unifiedData: any[] = [];

            // 발주 데이터 추가
            pendingOrders.forEach(order => {
                unifiedData.push({
                    id: order.id,
                    type: 'ORDER',
                    typeName: '발주',
                    code: order.orderCode,
                    name: order.productName,
                    quantity: order.orderQuantity,
                    amount: order.totalAmount,
                    status: order.approvalInfo,
                    createdBy: order.createdBy,
                    createdAt: order.createdAt,
                    details: {
                        customerName: order.customerName,
                        projectName: order.projectName,
                        deliveryDate: order.deliveryDate
                    }
                });
            });

            // 품질검사 데이터 추가
            pendingInspections.forEach(inspection => {
                unifiedData.push({
                    id: inspection.id,
                    type: 'INSPECTION',
                    typeName: '품질검사',
                    code: inspection.inspectionCode,
                    name: inspection.productName,
                    quantity: inspection.inspectionQuantity,
                    amount: null,
                    status: inspection.inspectionStatus,
                    createdBy: inspection.createdBy,
                    createdAt: inspection.createdAt,
                    details: {
                        productionCode: inspection.productionCode,
                        inspector: inspection.inspector,
                        inspectionDate: inspection.inspectionDate
                    }
                });
            });

            // 수주 데이터 추가
            pendingOrderManagement.forEach(orderManagement => {
                unifiedData.push({
                    id: orderManagement.id,
                    type: 'ORDER_MANAGEMENT',
                    typeName: '수주',
                    code: orderManagement.orderCode,
                    name: orderManagement.projectName,
                    quantity: orderManagement.quantity,
                    amount: orderManagement.total,
                    status: orderManagement.approvalInfo,
                    createdBy: orderManagement.createdBy,
                    createdAt: orderManagement.createdAt,
                    details: {
                        customerName: orderManagement.customerName,
                        productName: orderManagement.productName,
                        deliveryDate: orderManagement.deliveryDate
                    }
                });
            });

            // 생성일시 기준으로 정렬
            unifiedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // 페이지네이션 적용
            const totalItems = orderTotal + inspectionTotal + orderManagementTotal;
            const paginatedData = unifiedData.slice(offset, offset + limit);

            // 통계 정보
            const statistics = {
                total: totalItems,
                orders: orderTotal,
                inspections: inspectionTotal,
                orderManagement: orderManagementTotal,
                byType: {
                    ORDER: pendingOrders.length,
                    INSPECTION: pendingInspections.length,
                    ORDER_MANAGEMENT: pendingOrderManagement.length
                }
            };

            await this.logService.createDetailedLog({
                moduleName: '통합 승인 대기',
                action: 'READ_ALL_PENDING_SUCCESS',
                username,
                targetId: '',
                targetName: '통합 승인 대기 목록',
                details: `통합 승인 대기 조회: 총 ${totalItems}개 (발주: ${orderTotal}, 품질검사: ${inspectionTotal}, 수주: ${orderManagementTotal})`,
            });

            return {
                success: true,
                message: '통합 승인 대기 목록을 성공적으로 조회했습니다.',
                data: {
                    items: paginatedData,
                    statistics,
                    pagination: {
                        page,
                        limit,
                        total: totalItems,
                        totalPages: Math.ceil(totalItems / limit),
                    },
                },
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '통합 승인 대기',
                action: 'READ_ALL_PENDING_FAIL',
                username,
                targetId: '',
                targetName: '통합 승인 대기 목록',
                details: `통합 승인 대기 조회 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '통합 승인 대기 목록 조회 실패',
                error: error.message,
            };
        }
    }

    /**
     * 타입별 승인 대기 항목을 조회합니다.
     */
    async getPendingApprovalsByType(type: 'ORDER' | 'INSPECTION' | 'ORDER_MANAGEMENT', page: number = 1, limit: number = 20, username: string = 'system') {
        try {
            const offset = (page - 1) * limit;
            let items: any[] = [];
            let total = 0;

            switch (type) {
                case 'ORDER':
                    const [orders, orderTotal] = await this.orderInfoRepository.findAndCount({
                        where: { approvalInfo: '대기' },
                        order: { createdAt: 'DESC' },
                        skip: offset,
                        take: limit
                    });
                    items = orders.map(order => ({
                        id: order.id,
                        type: 'ORDER',
                        typeName: '발주',
                        code: order.orderCode,
                        name: order.productName,
                        quantity: order.orderQuantity,
                        amount: order.totalAmount,
                        status: order.approvalInfo,
                        createdBy: order.createdBy,
                        createdAt: order.createdAt,
                        details: {
                            customerName: order.customerName,
                            projectName: order.projectName,
                            deliveryDate: order.deliveryDate
                        }
                    }));
                    total = orderTotal;
                    break;

                case 'INSPECTION':
                    const [inspections, inspectionTotal] = await this.inspectionRepository.findAndCount({
                        where: { inspectionStatus: 'PENDING' },
                        order: { createdAt: 'DESC' },
                        skip: offset,
                        take: limit
                    });
                    items = inspections.map(inspection => ({
                        id: inspection.id,
                        type: 'INSPECTION',
                        typeName: '품질검사',
                        code: inspection.inspectionCode,
                        name: inspection.productName,
                        quantity: inspection.inspectionQuantity,
                        amount: null,
                        status: inspection.inspectionStatus,
                        createdBy: inspection.createdBy,
                        createdAt: inspection.createdAt,
                        details: {
                            productionCode: inspection.productionCode,
                            inspector: inspection.inspector,
                            inspectionDate: inspection.inspectionDate
                        }
                    }));
                    total = inspectionTotal;
                    break;

                case 'ORDER_MANAGEMENT':
                    const [orderManagement, orderManagementTotal] = await this.orderManagementRepository.findAndCount({
                        where: { approvalInfo: '대기' },
                        order: { createdAt: 'DESC' },
                        skip: offset,
                        take: limit
                    });
                    items = orderManagement.map(orderManagement => ({
                        id: orderManagement.id,
                        type: 'ORDER_MANAGEMENT',
                        typeName: '수주',
                        code: orderManagement.orderCode,
                        name: orderManagement.projectName,
                        quantity: orderManagement.quantity,
                        amount: orderManagement.total,
                        status: orderManagement.approvalInfo,
                        createdBy: orderManagement.createdBy,
                        createdAt: orderManagement.createdAt,
                        details: {
                            customerName: orderManagement.customerName,
                            productName: orderManagement.productName,
                            deliveryDate: orderManagement.deliveryDate
                        }
                    }));
                    total = orderManagementTotal;
                    break;
            }

            await this.logService.createDetailedLog({
                moduleName: '통합 승인 대기',
                action: 'READ_BY_TYPE_SUCCESS',
                username,
                targetId: '',
                targetName: `${type} 승인 대기 목록`,
                details: `${type} 승인 대기 조회: ${total}개`,
            });

            return {
                success: true,
                message: `${type} 승인 대기 목록을 성공적으로 조회했습니다.`,
                data: {
                    items,
                    type,
                    typeName: items.length > 0 ? items[0].typeName : '',
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '통합 승인 대기',
                action: 'READ_BY_TYPE_FAIL',
                username,
                targetId: '',
                targetName: `${type} 승인 대기 목록`,
                details: `${type} 승인 대기 조회 실패: ${error.message}`,
            });

            return {
                success: false,
                message: `${type} 승인 대기 목록 조회 실패`,
                error: error.message,
            };
        }
    }
}
