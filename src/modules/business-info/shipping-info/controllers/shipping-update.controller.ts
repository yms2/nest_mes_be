import { Controller, Put, Patch, Body, Param, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ShippingUpdateService } from '../services/shipping-update.service';
import { UpdateShippingDto } from '../dto/update-shipping.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';

@ApiTags('출하관리')
@Controller('shipping-info')
@DevAuth()
@ApiBearerAuth()
export class ShippingUpdateController {
    constructor(
        private readonly shippingUpdateService: ShippingUpdateService,
    ) {}

    @Put(':id')
    @ApiOperation({ 
        summary: '출하 정보 수정', 
        description: '특정 출하의 정보를 수정합니다.' 
    })
    @ApiParam({ name: 'id', type: Number, required: true, description: '수정할 출하의 ID', example: 1 })
    @ApiBody({ type: UpdateShippingDto })
    @ApiResponse({ status: 200, description: '출하 정보 수정 성공' })
    @ApiResponse({ status: 404, description: '출하 정보를 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async updateShipping(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateShippingDto: UpdateShippingDto
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.shippingUpdateService.updateShipping(id, updateShippingDto, username);
            
            return ApiResponseBuilder.success(
                result,
                '출하 정보를 성공적으로 수정했습니다.',
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '출하 정보 수정에 실패했습니다.',
            );
        }
    }

    @Patch('status')
    @ApiOperation({ 
        summary: '출하 상태 일괄 수정', 
        description: '여러 출하의 상태를 일괄로 수정합니다.' 
    })
    @ApiBody({ 
        schema: {
            type: 'object',
            properties: {
                ids: { type: 'array', items: { type: 'number' }, description: '출하 ID 배열', example: [1, 2, 3] },
                status: { type: 'string', description: '새로운 상태', example: '지시완료' }
            },
            required: ['ids', 'status']
        }
    })
    @ApiResponse({ status: 200, description: '출하 상태 일괄 수정 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async updateShippingStatus(
        @Request() req,
        @Body() body: { ids: number[]; status: string }
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const { ids, status } = body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return ApiResponseBuilder.error('출하 ID 배열이 필요합니다.');
            }
            
            if (!status) {
                return ApiResponseBuilder.error('상태 값이 필요합니다.');
            }

            const result = await this.shippingUpdateService.updateShippingStatus(ids, status, username);
            
            return ApiResponseBuilder.success(
                result,
                `출하 상태를 성공적으로 수정했습니다. (성공: ${result.updatedCount}개, 실패: ${result.failedIds.length}개)`,
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '출하 상태 일괄 수정에 실패했습니다.',
            );
        }
    }
}
