import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { ApiException } from '@/common/exceptions/api.exception';

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
        return await this.notificationRepository.manager.transaction(async (transactionalEntityManager) => {
            const notification = await transactionalEntityManager.findOne(Notification, {
                where: { id: notificationId }
            });

            if (!notification) {
                throw ApiException.notFound('알림을 찾을 수 없습니다.');
            }

            // 이미 읽음 처리된 알림인지 확인
            if (notification.status === 'READ') {
                return {
                    success: true,
                    message: '이미 읽음 처리된 알림입니다.',
                    notification: notification
                };
            }

            // 알림 상태 업데이트
            await transactionalEntityManager.update(Notification, 
                { id: notificationId },
                { 
                    status: 'READ',
                    checkDate: new Date()
                }
            );

            // 업데이트된 알림 조회
            const updatedNotification = await transactionalEntityManager.findOne(Notification, {
                where: { id: notificationId }
            });

            return {
                success: true,
                message: '알림을 읽음 처리했습니다.',
                notification: updatedNotification
            };
        });
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

    /**
     * 알림을 승인 처리합니다.
     */
    async approveNotification(notificationId: number, approver: string) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId }
            });

            if (!notification) {
                throw new Error('알림을 찾을 수 없습니다.');
            }

            notification.status = 'APPROVED';
            notification.checkDate = new Date();
            notification.receiver = approver; // 승인자로 업데이트

            const updatedNotification = await this.notificationRepository.save(notification);

            return {
                success: true,
                message: '알림을 승인 처리했습니다.',
                notification: updatedNotification
            };
        } catch (error) {
            throw new Error(`알림 승인 처리 실패: ${error.message}`);
        }
    }

    /**
     * 알림을 거부 처리합니다.
     */
    async rejectNotification(notificationId: number, rejector: string, reason?: string) {
        try {
            const notification = await this.notificationRepository.findOne({
                where: { id: notificationId }
            });

            if (!notification) {
                throw new Error('알림을 찾을 수 없습니다.');
            }

            notification.status = 'REJECTED';
            notification.checkDate = new Date();
            notification.receiver = rejector; // 거부자로 업데이트
            if (reason) {
                notification.notificationContent += ` (거부 사유: ${reason})`;
            }

            const updatedNotification = await this.notificationRepository.save(notification);

            return {
                success: true,
                message: '알림을 거부 처리했습니다.',
                notification: updatedNotification
            };
        } catch (error) {
            throw new Error(`알림 거부 처리 실패: ${error.message}`);
        }
    }

    /**
     * 승인 대기 중인 알림을 조회합니다.
     */
    async getPendingNotifications() {
        try {
            const notifications = await this.notificationRepository.find({
                where: { status: 'UNREAD' },
                order: { createdAt: 'DESC' }
            });

            return {
                success: true,
                message: '승인 대기 중인 알림 목록을 성공적으로 조회했습니다.',
                notifications: notifications,
                count: notifications.length
            };
        } catch (error) {
            throw new Error(`승인 대기 알림 조회 실패: ${error.message}`);
        }
    }
}
