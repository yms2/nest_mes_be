import { Controller, Delete, Param, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ShippingDeleteService } from '../services/shipping-delete.service';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';

@ApiTags('출하관리')
@Controller('shipping-info')
@DevAuth()
@ApiBearerAuth()
export class ShippingDeleteController {
    constructor(
        private readonly shippingDeleteService: ShippingDeleteService,
    ) {}

    @Delete(':id')
    @ApiOperation({ 
        summary: '출하 정보 삭제', 
        description: '특정 출하의 정보를 삭제합니다.' 
    })
    @ApiParam({ name: 'id', type: Number, required: true, description: '삭제할 출하의 ID', example: 1 })
    @ApiResponse({ status: 200, description: '출하 정보 삭제 성공' })
    @ApiResponse({ status: 404, description: '출하 정보를 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async deleteShipping(
        @Request() req,
        @Param('id') id: number
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.shippingDeleteService.deleteShipping(id, username);
            
            return ApiResponseBuilder.success(
                result,
                result.message,
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '출하 정보 삭제에 실패했습니다.',
            );
        }
    }

    @Delete('batch')
    @ApiOperation({ 
        summary: '출하 정보 일괄 삭제', 
        description: '여러 출하의 정보를 일괄로 삭제합니다.' 
    })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                ids: { type: 'array', items: { type: 'number' }, description: '출하 ID 배열', example: [1, 2, 3] }
            },
            required: ['ids']
        }
    })
    @ApiResponse({ status: 200, description: '출하 정보 일괄 삭제 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async deleteMultipleShipping(
        @Request() req,
        @Body() body: { ids: number[] }
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const { ids } = body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return ApiResponseBuilder.error('출하 ID 배열이 필요합니다.');
            }

            const result = await this.shippingDeleteService.deleteMultipleShipping(ids, username);
            
            return ApiResponseBuilder.success(
                result,
                result.message,
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '출하 정보 일괄 삭제에 실패했습니다.',
            );
        }
    }
}
