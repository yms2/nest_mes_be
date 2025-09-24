import { Controller, Get, Param, Patch, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { NotificationReadService } from '../services/notification-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('알림 조회')
@Controller('notification')
export class NotificationReadController {
    constructor(private readonly notificationReadService: NotificationReadService) {}

    @Get('list')
    @ApiOperation({ 
        summary: '모든 알림 조회',
        description: '모든 알림 목록을 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '알림 목록 조회 성공'
    })
    async getAllNotifications() {
        return await this.notificationReadService.getAllNotifications();
    }

    @Get('unread')
    @ApiOperation({ 
        summary: '읽지 않은 알림 조회',
        description: '읽지 않은 알림만 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '읽지 않은 알림 조회 성공'
    })
    async getUnreadNotifications() {
        return await this.notificationReadService.getUnreadNotifications();
    }
    @Patch('read/:id')
    @ApiOperation({ 
        summary: '알림 읽음 처리',
        description: '특정 알림을 읽음 처리합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '알림 읽음 처리 성공'
    })
    async markAsRead(@Param('id') id: string) {
        return await this.notificationReadService.markAsRead(parseInt(id));
    }

    @Patch('read-all')
    @ApiOperation({ 
        summary: '모든 알림 읽음 처리',
        description: '모든 알림을 읽음 처리합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '모든 알림 읽음 처리 성공'
    })
    async markAllAsRead() {
        return await this.notificationReadService.markAllAsRead();
    }

    @Get('pending')
    @ApiOperation({ 
        summary: '승인 대기 알림 조회',
        description: '승인 대기 중인 알림을 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '승인 대기 알림 조회 성공'
    })
    async getPendingNotifications() {
        return await this.notificationReadService.getPendingNotifications();
    }

    @Patch('approve/:id')
    @ApiOperation({ 
        summary: '알림 승인',
        description: '특정 알림을 승인 처리합니다.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                approver: { type: 'string', description: '승인자' }
            },
            required: ['approver']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '알림 승인 성공'
    })
    async approveNotification(
        @Param('id') id: string,
        @Body('approver') approver: string
    ) {
        return await this.notificationReadService.approveNotification(parseInt(id), approver);
    }

    @Patch('reject/:id')
    @ApiOperation({ 
        summary: '알림 거부',
        description: '특정 알림을 거부 처리합니다.'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                rejector: { type: 'string', description: '거부자' },
                reason: { type: 'string', description: '거부 사유 (선택사항)' }
            },
            required: ['rejector']
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: '알림 거부 성공'
    })
    async rejectNotification(
        @Param('id') id: string,
        @Body('rejector') rejector: string,
        @Body('reason') reason?: string
    ) {
        return await this.notificationReadService.rejectNotification(parseInt(id), rejector, reason);
    }
}
