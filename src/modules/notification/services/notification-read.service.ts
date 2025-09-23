import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationReadService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) {}

    /**
     * 모든 알림을 조회합니다.
     */
    async getAllNotifications() {
        try {
            const notifications = await this.notificationRepository.find({
                order: { createdAt: 'DESC' }
            });

            return {
                success: true,
                message: '알림 목록을 성공적으로 조회했습니다.',
                notifications: notifications
            };
        } catch (error) {
            throw new Error(`알림 조회 실패: ${error.message}`);
        }
    }

    /**
     * 읽지 않은 알림만 조회합니다.
     */
    async getUnreadNotifications() {
        try {
            const notifications = await this.notificationRepository.find({
                where: { status: 'UNREAD' },
                order: { createdAt: 'DESC' }
            });

            return {
                success: true,
                message: '읽지 않은 알림 목록을 성공적으로 조회했습니다.',
                notifications: notifications,
                count: notifications.length
            };
        } catch (error) {
            throw new Error(`읽지 않은 알림 조회 실패: ${error.message}`);
        }
    }

    /**
     * 특정 타입의 알림을 조회합니다.
     */
    async getNotificationsByType(notificationType: string) {
        try {
            const notifications = await this.notificationRepository.find({
                where: { notificationType },
                order: { createdAt: 'DESC' }
            });

            return {
                success: true,
                message: `${notificationType} 타입 알림 목록을 성공적으로 조회했습니다.`,
                notifications: notifications
            };
        } catch (error) {
            throw new Error(`${notificationType} 타입 알림 조회 실패: ${error.message}`);
        }
    }

    /**
     * 알림을 읽음 처리합니다.
     */
    async markAsRead(notificationId: number) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId }
            });

            if (!notification) {
                throw new Error('알림을 찾을 수 없습니다.');
            }

            notification.status = 'READ';
            notification.checkDate = new Date();

            const updatedNotification = await this.notificationRepository.save(notification);

            return {
                success: true,
                message: '알림을 읽음 처리했습니다.',
                notification: updatedNotification
            };
        } catch (error) {
            throw new Error(`알림 읽음 처리 실패: ${error.message}`);
        }
    }

    /**
     * 모든 알림을 읽음 처리합니다.
     */
    async markAllAsRead() {
        try {
            await this.notificationRepository.update(
                { status: 'UNREAD' },
                { 
                    status: 'READ',
                    checkDate: new Date()
                }
            );

            return {
                success: true,
                message: '모든 알림을 읽음 처리했습니다.'
            };
        } catch (error) {
            throw new Error(`모든 알림 읽음 처리 실패: ${error.message}`);
        }
    }
}
