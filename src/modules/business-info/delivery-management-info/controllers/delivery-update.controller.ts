import { 
    Controller, 
    Put, 
    Delete, 
    Body, 
    Param, 
    Request,
    ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DeliveryUpdateService } from '../services/delivery-update.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { UpdateDeliveryDto } from '../dto/update-delivery.dto';

@ApiTags('납품관리')
@Controller('delivery-info')
@DevAuth()
@ApiBearerAuth()
export class DeliveryUpdateController {
    constructor(
        private readonly deliveryUpdateService: DeliveryUpdateService
    ) {}

    @Put(':deliveryCode')
    @ApiOperation({ 
        summary: '납품 정보 수정',
        description: '납품 코드를 기반으로 납품 정보를 수정합니다.'
    })
    @ApiParam({ name: 'deliveryCode', description: '납품 코드', example: 'DEL20250115001' })
    @ApiResponse({ 
        status: 200, 
        description: '납품 정보가 성공적으로 수정되었습니다.',
    })
    @ApiResponse({ 
        status: 404, 
        description: '납품을 찾을 수 없습니다.',
    })
    async updateDelivery(
        @Param('deliveryCode') deliveryCode: string,
        @Body() updateDeliveryDto: UpdateDeliveryDto,
        @Request() req: any
    ) {
        try {
            const username = req.user?.username || 'system';
            const updatedDelivery = await this.deliveryUpdateService.updateDelivery(
                deliveryCode,
                updateDeliveryDto,
                username
            );

            return ApiResponseBuilder.success(updatedDelivery, '납품 정보가 성공적으로 수정되었습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message, error.status || 500);
        }
    }

    @Delete(':id')
    @ApiOperation({ 
        summary: '납품 삭제',
        description: '납품 ID로 납품을 삭제합니다. (소프트 삭제)'
    })
    @ApiParam({ name: 'id', description: '납품 ID', example: 1 })
    @ApiResponse({ 
        status: 200, 
        description: '납품이 성공적으로 삭제되었습니다.',
    })
    @ApiResponse({ 
        status: 404, 
        description: '납품을 찾을 수 없습니다.',
    })
    async deleteDelivery(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: any
    ) {
        try {
            const username = req.user?.username || 'system';
            await this.deliveryUpdateService.deleteDeliveryById(id, username);
            return ApiResponseBuilder.success(null, '납품이 성공적으로 삭제되었습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message, error.status || 500);
        }
    }
}
