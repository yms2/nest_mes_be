import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationCreateService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) {}

    /**
     * 알림을 생성합니다.
     */
    async createNotification(notificationData: {
        notificationCode?: string;
        notificationType: string;
        notificationTitle: string;
        notificationContent: string;
        sender?: string;
        receiver?: string;
        status?: string;
    }) {
        try {
            // 알림 코드 자동 생성 (없는 경우)
            if (!notificationData.notificationCode) {
                const count = await this.notificationRepository.count();
                notificationData.notificationCode = `NTF${String(count + 1).padStart(6, '0')}`;
            }

            // 알림 생성
            const notification = this.notificationRepository.create({
                ...notificationData,
                notificationDate: new Date(),
                status: notificationData.status || 'UNREAD',
            });

            // 알림 저장
            const savedNotification = await this.notificationRepository.save(notification);

            return {
                success: true,
                message: '알림이 성공적으로 생성되었습니다.',
                notification: savedNotification
            };

        } catch (error) {
            throw new Error(`알림 생성 실패: ${error.message}`);
        }
    }

    /**
     * 발주 등록 알림을 생성합니다.
     */
    async createOrderNotification(orderInfo: {
        orderCode: string;
        orderName: string;
        customerName?: string;
        createdBy: string;
    }) {
        return await this.createNotification({
            notificationType: 'ORDER_CREATE',
            notificationTitle: '새로운 발주가 등록되었습니다',
            notificationContent: `발주코드: ${orderInfo.orderCode}, 발주명: ${orderInfo.orderName}${orderInfo.customerName ? `, 고객: ${orderInfo.customerName}` : ''}`,
            sender: orderInfo.createdBy,
            receiver: '관리자',
            status: 'UNREAD'
        });
    }
}