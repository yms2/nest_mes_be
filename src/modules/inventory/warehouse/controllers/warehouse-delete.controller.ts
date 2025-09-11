import { Controller, Delete, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WarehouseDeleteService } from '../services/warehouse-delete.service';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevWarehouseAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { Request } from 'express';

@ApiTags('창고관리')
@Controller('warehouse')
@DevWarehouseAuth.delete()
export class WarehouseDeleteController {
    constructor(
        private readonly warehouseDeleteService: WarehouseDeleteService,
    ) {}

    @Delete(':id')
    @ApiOperation({ summary: '창고 삭제', description: '창고를 삭제합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '창고 ID' })
    @ApiResponse({ status: 200, description: '창고 삭제 성공' })
    @ApiResponse({ status: 404, description: '창고 정보를 찾을 수 없음' })
    @ApiResponse({ status: 400, description: '잘못된 요청' })
    @ApiResponse({ status: 500, description: '서버 오류' })
    async deleteWarehouse(
        @Req() req: Request & { user: { username: string } },
        @Param('id') id: number
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.warehouseDeleteService.deleteWarehouse(id, username);
            return ApiResponseBuilder.success(result, '창고 삭제 성공');
        } catch (error) {
            return ApiResponseBuilder.error(error.message || '창고 삭제 실패');
        }
    }
}
