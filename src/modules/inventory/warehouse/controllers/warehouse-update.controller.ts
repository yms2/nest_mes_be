import { Controller, Put, Param, Body, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { WarehouseUpdateService } from '../services/warehouse-update.service';
import { CreateWarehouseDto } from '../dto/warehouse-create.dto';
import { DevWarehouseAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';

@ApiTags('창고관리')
@Controller('warehouse')
@DevWarehouseAuth.update()
export class WarehouseUpdateController {

    constructor(
        private readonly warehouseUpdateService: WarehouseUpdateService
    ) {}

    @Put(':id')
    @ApiOperation({ summary: '창고 정보 수정', description: '창고 정보를 수정합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '창고 ID' })
    @ApiBody({ type: CreateWarehouseDto })
    @ApiResponse({ status: 200, description: '창고 정보 수정 성공' })
    @ApiResponse({ status: 404, description: '창고 정보를 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async updateWarehouse(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateWarehouseDto: CreateWarehouseDto
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.warehouseUpdateService.updateWarehouse(id, updateWarehouseDto, username);
            return ApiResponseBuilder.success(result, '창고 정보를 성공적으로 수정했습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message || '창고 정보 수정에 실패했습니다.');
        }
    }
}