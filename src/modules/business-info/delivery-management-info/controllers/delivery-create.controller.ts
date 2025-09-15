import { Controller, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryCreateService } from '../services/delivery-create.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { CreateDeliveryFromShippingDto, CreateDeliveryWithoutShippingDto } from '../dto/create-delivery.dto';

@ApiTags('납품관리')
@Controller('delivery-info')
@DevAuth()
@ApiBearerAuth()
export class DeliveryCreateController {
    constructor(
        private readonly deliveryCreateService: DeliveryCreateService
    ) {}

    @Post('from-shipping')
    @ApiOperation({ 
        summary: '출하코드로부터 납품 등록',
        description: '출하코드를 기반으로 납품을 등록합니다.'
    })
    @ApiResponse({ 
        status: 201, 
        description: '납품이 성공적으로 등록되었습니다.',
    })
    async createDeliveryFromShipping(
        @Body() createDeliveryDto: CreateDeliveryFromShippingDto,
        @Request() req: any
    ) {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.deliveryCreateService.createDeliveryFromShipping(
                createDeliveryDto.shippingCode,
                createDeliveryDto.deliveryQuantity,
                createDeliveryDto.deliveryDate,
                createDeliveryDto.deliveryStatus,
                createDeliveryDto.remark,
                username
            );
            
            return ApiResponseBuilder.success(
                result,
                '납품이 성공적으로 등록되었습니다.'
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '납품 등록에 실패했습니다.'
            );
        }
    }

    @Post('without-shipping')
    @ApiOperation({ 
        summary: '출하없이 납품 등록',
        description: '출하코드 없이 직접 납품을 등록합니다.'
    })
    @ApiResponse({ 
        status: 201, 
        description: '납품이 성공적으로 등록되었습니다.',
    })
    async createDeliveryWithoutShipping(
        @Body() createDeliveryDto: CreateDeliveryWithoutShippingDto,
        @Request() req: any
    ) {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.deliveryCreateService.createDeliveryWithoutShipping(
                createDeliveryDto.customerCode,
                createDeliveryDto.customerName,
                createDeliveryDto.productCode,
                createDeliveryDto.productName,
                createDeliveryDto.projectCode,
                createDeliveryDto.projectName,
                createDeliveryDto.deliveryQuantity,
                createDeliveryDto.deliveryDate,
                createDeliveryDto.deliveryStatus,
                createDeliveryDto.remark,
                username
            );
            
            return ApiResponseBuilder.success(
                result,
                '납품이 성공적으로 등록되었습니다.'
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '납품 등록에 실패했습니다.'
            );
        }
    }

    @Post('available-shipping-codes')
    @ApiOperation({ 
        summary: '납품 등록 가능한 출하코드 목록 조회',
        description: '납품 등록이 가능한 출하코드 목록을 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '출하코드 목록을 성공적으로 조회했습니다.',
    })
    async getAvailableShippingCodes(@Request() req: any) {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.deliveryCreateService.getAvailableShippingCodes(username);
            
            return ApiResponseBuilder.success(
                result,
                '납품 등록 가능한 출하코드 목록을 성공적으로 조회했습니다.'
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '출하코드 목록 조회에 실패했습니다.'
            );
        }
    }
}
