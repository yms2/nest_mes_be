import { Controller, Post, Body, Get, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ShippingCreateService } from '../services/shipping-create.service';
import { CreateShippingDto } from '../dto/create-shipping.dto';
import { CreateShippingWithoutOrderDto } from '../dto/create-shipping-without-order.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('출하관리')
@Controller('shipping-info')
export class ShippingCreateController {
    constructor(
        private readonly shippingCreateService: ShippingCreateService,
    ) {}

    @Post('create-from-order')
    @ApiOperation({ summary: '수주코드로 출하 등록' })
    @ApiBody({ type: CreateShippingDto })
    @ApiResponse({ status: 201, description: '출하 등록 성공' })
    @ApiResponse({ status: 404, description: '수주 데이터를 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async createShippingFromOrder(
        @Body() createShippingDto: CreateShippingDto,
        @Request() req: Request & { user: { username: string } }
    ) {
        const { orderCode, shippingOrderQuantity, employeeCode, employeeName, remark } = createShippingDto;
        const username = req.user?.username || 'unknown';
        
        const result = await this.shippingCreateService.createShippingFromOrder(
            orderCode,
            shippingOrderQuantity,
            employeeCode,
            employeeName,
            remark,
            username
        );

        return {
            success: true,
            message: '출하지시가 성공적으로 등록되었습니다.',
            data: result
        };
    }

    @Get('available-orders')
    @ApiOperation({ summary: '출하 등록 가능한 수주코드 목록 조회' })
    @ApiResponse({ status: 200, description: '수주코드 목록 조회 성공' })
    async getAvailableOrderCodes(@Request() req: Request & { user: { username: string } }) {
        const username = req.user?.username || 'unknown';
        const orders = await this.shippingCreateService.getAvailableOrderCodes(username);
        
        return {
            success: true,
            message: '수주코드 목록을 성공적으로 조회했습니다.',
            data: orders
        };
    }

    //수주없이 출하 등록
    @Post('create-without-order')
    @ApiOperation({ summary: '수주없이 출하 등록' })
    @ApiBody({ type: CreateShippingWithoutOrderDto })
    @ApiResponse({ status: 201, description: '출하 등록 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    async createShippingWithoutOrder(
        @Body() createShippingWithoutOrderDto: CreateShippingWithoutOrderDto,
        @Request() req: Request & { user: { username: string } }
    ) {
        const { 
            shippingDate, 
            inventoryQuantity, 
            shippingOrderQuantity, 
            shippingStatus, 
            supplyPrice, 
            vat, 
            total, 
            employeeCode, 
            employeeName, 
            remark 
        } = createShippingWithoutOrderDto;
        const username = req.user?.username || 'unknown';
        
        const result = await this.shippingCreateService.createShippingWithoutOrder(
            shippingDate,
            inventoryQuantity,
            shippingOrderQuantity,
            shippingStatus,
            supplyPrice,
            vat,
            total,
            employeeCode,
            employeeName,
            remark,
            username
        );

        return {
            success: true,
            message: '수주없이 출하 등록 성공',
            data: result
        };
    }
}
