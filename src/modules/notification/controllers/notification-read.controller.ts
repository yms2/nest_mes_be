import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
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

    @Get('type/:type')
    @ApiOperation({ 
        summary: '타입별 알림 조회',
        description: '특정 타입의 알림을 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '타입별 알림 조회 성공'
    })
    async getNotificationsByType(@Param('type') type: string) {
        return await this.notificationReadService.getNotificationsByType(type);
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
}
