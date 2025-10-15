import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderInfo } from '../entities/order-info.entity';
import { logService } from '@/modules/log/Services/log.service';
import { NotificationCreateService } from '@/modules/notification/services/notification-create.service';

@Injectable()
export class OrderApprovalService {
    constructor(
        @InjectRepository(OrderInfo)
        private readonly orderInfoRepository: Repository<OrderInfo>,
        private readonly logService: logService,
        private readonly notificationCreateService: NotificationCreateService,
    ) {}

    /**
     * 발주 승인 처리
     */
    async approveOrder(orderId: number, approver: string, username: string = 'system') {
        try {
            // 발주 정보 조회
            const orderInfo = await this.orderInfoRepository.findOne({
                where: { id: orderId }
            });

            if (!orderInfo) {
                throw new NotFoundException('발주 정보를 찾을 수 없습니다.');
            }

            if (orderInfo.approvalInfo === '승인') {
                throw new BadRequestException('이미 승인된 발주입니다.');
            }

            // 발주 승인 처리
            orderInfo.approvalInfo = '승인';
            orderInfo.updatedBy = username;

            const updatedOrderInfo = await this.orderInfoRepository.save(orderInfo);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 승인',
                action: 'APPROVE_SUCCESS',
                username: username,
                targetId: orderInfo.id.toString(),
                targetName: orderInfo.orderCode,
                details: `발주 승인 완료: ${orderInfo.orderCode} - ${orderInfo.productName}`,
            });

            // 승인 완료 알림 생성 (평직원용)
            try {
                await this.notificationCreateService.createApprovalCompleteNotification(
                    '발주관리',
                    orderInfo.orderCode,
                    `발주 ${orderInfo.orderCode} - ${orderInfo.productName}`,
                    orderInfo.createdBy || 'system', // 발주 등록자
                    '발주',
                    approver
                );
            } catch (notificationError) {
                console.error('승인 완료 알림 생성 실패:', notificationError);
            }

            return {
                success: true,
                message: '발주 승인이 완료되었습니다.',
                orderInfo: updatedOrderInfo,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '발주관리 승인',
                action: 'APPROVE_FAIL',
                username: username,
                targetId: orderId.toString(),
                targetName: '',
                details: `발주 승인 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '발주 승인 실패',
                error: error.message,
            };
        }
    }

    /**
     * 발주 거부 처리
     */
    async rejectOrder(orderId: number, rejector: string, reason: string, username: string = 'system') {
        try {
            // 발주 정보 조회
            const orderInfo = await this.orderInfoRepository.findOne({
                where: { id: orderId }
            });

            if (!orderInfo) {
                throw new NotFoundException('발주 정보를 찾을 수 없습니다.');
            }

            if (orderInfo.approvalInfo === '승인') {
                throw new BadRequestException('이미 승인된 발주는 거부할 수 없습니다.');
            }

            // 발주 거부 처리
            orderInfo.approvalInfo = '거부';
            orderInfo.remark = orderInfo.remark ? `${orderInfo.remark} (거부사유: ${reason})` : `거부사유: ${reason}`;
            orderInfo.updatedBy = username;

            const updatedOrderInfo = await this.orderInfoRepository.save(orderInfo);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '발주관리 거부',
                action: 'REJECT_SUCCESS',
                username: username,
                targetId: orderInfo.id.toString(),
                targetName: orderInfo.orderCode,
                details: `발주 거부: ${orderInfo.orderCode} - ${orderInfo.productName}, 거부사유: ${reason}`,
            });

            return {
                success: true,
                message: '발주 거부가 완료되었습니다.',
                orderInfo: updatedOrderInfo,
            };
        } catch (error) {
            await this.logService.createDetailedLog({
                moduleName: '발주관리 거부',
                action: 'REJECT_FAIL',
                username: username,
                targetId: orderId.toString(),
                targetName: '',
                details: `발주 거부 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '발주 거부 실패',
                error: error.message,
            };
        }
    }

    /**
     * 승인 대기 중인 발주 목록 조회
     */
    async getPendingOrders(page: number = 1, limit: number = 20, username: string = 'system') {
        try {
            const offset = (page - 1) * limit;

            const [orders, total] = await this.orderInfoRepository.findAndCount({
                where: { approvalInfo: '대기' },
                order: { createdAt: 'DESC' },
                skip: offset,
                take: limit
            });

            await this.logService.createDetailedLog({
                moduleName: '발주관리 승인대기',
                action: 'READ_PENDING_SUCCESS',
                username,
                targetId: '',
                targetName: '승인 대기 발주 목록',
                details: `승인 대기 발주 조회: ${total}개 중 ${orders.length}개`,
            });

            return {
                success: true,
                message: '승인 대기 발주 목록을 성공적으로 조회했습니다.',
                data: {
                    orders,
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
                moduleName: '발주관리 승인대기',
                action: 'READ_PENDING_FAIL',
                username,
                targetId: '',
                targetName: '승인 대기 발주 목록',
                details: `승인 대기 발주 조회 실패: ${error.message}`,
            });

            return {
                success: false,
                message: '승인 대기 발주 목록 조회 실패',
                error: error.message,
            };
        }
    }
}
