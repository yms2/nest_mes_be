import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { NotificationCreateService } from '../services/notification-create.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('알림 관리')
@Controller('notification')
export class NotificationCreateController {
    constructor(private readonly notificationCreateService: NotificationCreateService) {}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: '알림 생성',
        description: '새로운 알림을 생성합니다.'
    })
    @ApiResponse({ 
        status: 201, 
        description: '알림 생성 성공'
    })
    async createNotification(@Body() notificationData: {
        notificationCode?: string;
        notificationType: string;
        notificationTitle: string;
        notificationContent: string;
        sender?: string;
        receiver?: string;
        status?: string;
    }) {
        return await this.notificationCreateService.createNotification(notificationData);
    }

    // @Post('order-notification')
    // @HttpCode(HttpStatus.CREATED)
    // @ApiOperation({ 
    //     summary: '발주 알림 생성',
    //     description: '발주 등록 시 알림을 생성합니다.'
    // })
    // @ApiResponse({ 
    //     status: 201, 
    //     description: '발주 알림 생성 성공'
    // })
    // async createOrderNotification(@Body() orderInfo: {
    //     orderCode: string;
    //     orderName: string;
    //     customerName?: string;
    //     createdBy: string;
    // }) {
    //     return await this.notificationCreateService.createOrderNotification(orderInfo);
    // }
}
