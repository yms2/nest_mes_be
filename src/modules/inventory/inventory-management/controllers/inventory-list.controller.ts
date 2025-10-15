import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InventoryManagementService } from '../services/inventory-management.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('재고 목록')
@Controller('inventory')
@DevAuth()
export class InventoryListController {
  constructor(
    private readonly inventoryManagementService: InventoryManagementService,
  ) {}

  @Get('list')
  @ApiOperation({ 
    summary: '재고 목록 조회',
    description: '등록된 모든 재고 정보를 조회합니다. 검색 및 필터링 기능을 제공합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '재고 정보를 반환합니다.',
    schema: {
      example: {
        success: true,
        message: '재고 정보를 성공적으로 조회했습니다.',
        data: {
          inventories: [
            {
              id: 1,
              inventoryName: '제품명',
              inventoryCode: 'P001',
              inventoryType: '완제품',
              inventoryQuantity: 100,
              inventoryUnit: 'EA',
              inventoryLocation: '창고A',
              safeInventory: 10,
              inventoryStatus: '정상',
              createdAt: '2025-01-12T00:00:00.000Z'
            }
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        },  
        timestamp: '2025-01-12T00:00:00.000Z'
      }
    }
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 10)' })
  @ApiQuery({ name: 'search', required: false, description: '검색 키워드 (품목명, 품목코드)' })
  @ApiQuery({ name: 'productType', required: false, description: '품목구분 (완제품, 반제품, 원자재)' })
  @ApiQuery({ name: 'productName', required: false, description: '품목명 (부분 검색 가능)' })
  async getInventoryList(@Query() query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      productType,
      productName,
    } = query;

    const result = await this.inventoryManagementService.findAllInventories({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      productType,
      productName,
    });

    return {
      success: true,
      message: '재고 정보를 성공적으로 조회했습니다.',
      data: result,
      timestamp: new Date().toISOString()
    };
  }
}
