import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { OrderCreateService } from '../services/order-create.service';
import { CreateOrderInfoDto } from '../dto/create-order-info.dto';

@DevAuth()
@ApiTags('발주관리')
@Controller('order-create')
export class OrderCreateController {
    constructor(private readonly orderCreateService: OrderCreateService) {}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: '발주 등록',
        description: '새로운 발주 정보를 등록합니다. customer_code와 customer_name을 포함합니다.'
    })
    @ApiBody({ type: CreateOrderInfoDto })
    @ApiResponse({ 
        status: 201, 
        description: '발주 등록 성공',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: '발주가 성공적으로 등록되었습니다.' },
                orderInfo: { type: 'object', description: '등록된 발주 정보' }
            }
        }
    })
    async createOrderInfo(@Body() createOrderInfoDto: CreateOrderInfoDto) {
        return await this.orderCreateService.createOrderInfo(createOrderInfoDto);
    }
}
