import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { WarehouseReadService } from '../services/warehouse-read.service';
import { DevWarehouseAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('창고관리')
@Controller('warehouse')
@DevWarehouseAuth.read()
@ApiBearerAuth()

export class WarehouseReadController {
    constructor(private readonly warehouseReadService: WarehouseReadService) {}

    @Get()
    @ApiOperation({ summary: '창고 목록 조회', description: '창고 목록을 조회합니다.' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수', example: 10 })
    @ApiQuery({ name: 'warehouseName', type: String, required: false, description: '창고명 (포함 검색)' })
    @ApiQuery({ name: 'warehouseLocation', type: String, required: false, description: '창고 위치 (포함 검색)' })
    @ApiQuery({ name: 'warehouseBigo', type: String, required: false, description: '창고 비고 (포함 검색)' })
    @ApiQuery({ name: 'warehouseZone', type: String, required: false, description: '창고 구역 (포함 검색)' })
    async getAllWarehouse(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('warehouseName') warehouseName?: string,
        @Query('warehouseLocation') warehouseLocation?: string,
        @Query('warehouseBigo') warehouseBigo?: string,
        @Query('warehouseZone') warehouseZone?: string,
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.warehouseReadService.getAllWarehouse(
                page,
                limit,
                username,
                warehouseName,
                warehouseLocation,
                warehouseBigo,
                warehouseZone,
            );

            return ApiResponseBuilder.success(result, '창고 목록을 성공적으로 조회했습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message || '창고 목록 조회에 실패했습니다.');
        }
    }

    @Get(':id')
    @ApiOperation({ summary: '창고 상세 조회', description: '창고 상세 정보를 조회합니다.' })
    @ApiParam({ name: 'id', type: Number, description: '창고 ID' })
    @ApiResponse({
        status: 200,
        description: '창고 상세 정보를 성공적으로 조회했습니다.',
        schema: {
            example: {
                id: 1,
                name: '창고1',
                location: '서울',
                note: '창고1',
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: '창고를 찾을 수 없음',
        schema: {
            example: {
                success: false,
                message: 'ID 1인 창고를 찾을 수 없습니다.',
                data: null,
                timestamp: '2025-01-15T10:30:00Z'
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                data: null,
                timestamp: '2025-01-15T10:30:00Z'
            }
        }
    })
    async getWarehouseById(
        @Request() req, 
        @Param('id') id: number
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.warehouseReadService.getWarehouseById(id, username);
            return ApiResponseBuilder.success(result, '창고 상세 정보를 성공적으로 조회했습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message || '창고 상세 조회에 실패했습니다.');
        }
    }

    @Get('zones/grouped')
    @ApiOperation({ summary: '창고별 구역 그룹핑 조회', description: '창고별로 구역을 그룹핑하여 조회합니다. 구역이 없으면 "전체"로 표시됩니다.' })
    async getWarehouseWithZones(@Request() req): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.warehouseReadService.getWarehouseWithZones(username);
            return ApiResponseBuilder.success(result, '창고 구역 그룹핑 정보를 성공적으로 조회했습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message || '창고 구역 그룹핑 조회에 실패했습니다.');
        }
    }

    @Get('zones/:warehouseName')
    @ApiOperation({ summary: '특정 창고의 구역 목록 조회', description: '특정 창고의 모든 구역을 조회합니다.' })
    @ApiParam({ name: 'warehouseName', type: String, description: '창고명' })
    async getWarehouseZones(
        @Request() req,
        @Param('warehouseName') warehouseName: string
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.warehouseReadService.getWarehouseZones(warehouseName, username);
            return ApiResponseBuilder.success(result, `${warehouseName} 창고의 구역 목록을 성공적으로 조회했습니다.`);
        } catch (error) {
            return ApiResponseBuilder.error(error.message || '창고 구역 목록 조회에 실패했습니다.');
        }
    }
}