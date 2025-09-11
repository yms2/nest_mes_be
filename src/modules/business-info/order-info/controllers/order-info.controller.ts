import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OrderInfoService } from '../services/order-info.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('발주관리')
@Controller('order-info')
export class OrderInfoController {
    constructor(
        private readonly orderInfoService: OrderInfoService,
    ) {}

    @Get('bom-by-order/:orderCode')
    @ApiOperation({ 
        summary: '수주 코드로 BOM 조회',
        description: '수주 코드를 기반으로 BOM을 전개하고 발주 정보를 생성합니다.'
    })
    @ApiParam({ name: 'orderCode', description: '수주 코드', example: 'ORD20250101001' })
    @ApiResponse({ 
        status: 200, 
        description: 'BOM 조회 성공',
        schema: {
            type: 'object',
            properties: {
                orderManagement: { type: 'object', description: '수주 정보' },
                bomItems: { type: 'array', description: 'BOM 아이템 목록' },
                purchaseOrderItems: { type: 'array', description: '발주 아이템 목록' },
                summary: { type: 'object', description: '요약 정보' }
            }
        }
    })
    async getBomByOrderCode(@Param('orderCode') orderCode: string) {
        return await this.orderInfoService.getBomByOrderCode(orderCode);
    }

}
