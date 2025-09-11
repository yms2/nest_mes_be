import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryAdjustmentLogService } from '../services/inventory-adjustment-log.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('재고 로그')
@Controller('inventory/logs')
@DevAuth()
@ApiBearerAuth()
export class InventoryLogsController {
  constructor(
    private readonly inventoryAdjustmentLogService: InventoryAdjustmentLogService,
  ) {}

  @Get('adjustment-logs/:inventoryCode')
  @ApiOperation({ 
    summary: '재고 조정 이력 조회',
    description: '특정 재고의 조정 이력을 조회합니다.'
  })
  @ApiParam({ name: 'inventoryCode', description: '재고 코드', example: 'PRD001' })
  @ApiQuery({ name: 'limit', description: '조회 개수 제한', required: false, example: 50 })
  @ApiResponse({ 
    status: 200, 
    description: '재고 조정 이력을 반환합니다.',
  })
  async getInventoryAdjustmentLogs(
    @Param('inventoryCode') inventoryCode: string,
    @Query('limit') limit?: number,
  ) {
    return this.inventoryAdjustmentLogService.getInventoryAdjustmentLogs(inventoryCode, limit);
  }

  @Get('adjustment-logs')
  @ApiOperation({ 
    summary: '모든 재고 조정 이력 조회',
    description: '모든 재고의 조정 이력을 조회합니다.'
  })
  @ApiQuery({ name: 'limit', description: '조회 개수 제한', required: false, example: 100 })
  @ApiQuery({ name: 'offset', description: '오프셋', required: false, example: 0 })
  @ApiResponse({ 
    status: 200, 
    description: '모든 재고 조정 이력을 반환합니다.',
  })
  async getAllAdjustmentLogs(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.inventoryAdjustmentLogService.getAllAdjustmentLogs(limit, offset);
  }

  @Get('adjustment-logs/date-range')
  @ApiOperation({ 
    summary: '기간별 이력 조회',
    description: '특정 기간의 재고 조정 이력을 조회합니다.'
  })
  @ApiQuery({ name: 'startDate', description: '시작 날짜', required: true, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: '종료 날짜', required: true, example: '2024-12-31' })
  @ApiQuery({ name: 'limit', description: '조회 개수 제한', required: false, example: 100 })
  @ApiResponse({ 
    status: 200, 
    description: '기간별 이력을 반환합니다.',
  })
  async getLogsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit?: number,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.inventoryAdjustmentLogService.getLogsByDateRange(start, end, limit);
  }


}
