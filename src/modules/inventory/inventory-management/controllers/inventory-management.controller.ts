import { Controller, Get, Put, Param, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryManagementService } from '../services/inventory-management.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ChangeQuantityDto, MultipleQuantityChangeDto } from '../dto/quantity-change.dto';

@ApiTags('재고 관리')
@Controller('inventory/management')
@DevAuth()
@ApiBearerAuth()
export class InventoryManagementController {
  constructor(
    private readonly inventoryManagementService: InventoryManagementService,
  ) {}

  @Get('all')
  @ApiOperation({ 
    summary: '모든 재고 조회',
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
              inventoryUnit: 10000,
              inventoryLocation: 1000000,
              safeInventory: 1000000,
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


  async findAllInventories(@Query() query: any) {
    const {
      page = 1,
      limit = 10,
      search,
      productType,
      productName,

    } = query;

    return this.inventoryManagementService.findAllInventories({
      page: parseInt(page),
      limit: parseInt(limit),
      search,

      productType,
      productName,

    });
  }

  @Get('by-type/:productType')
  @ApiOperation({ 
    summary: '품목구분별 재고 조회',
    description: '특정 품목구분의 재고 목록을 조회합니다.'
  })
  @ApiParam({ name: 'productType', description: '품목구분', example: '완제품' })
  @ApiResponse({ 
    status: 200, 
    description: '해당 품목구분의 재고 목록을 반환합니다.',
  })
  async findInventoriesByType(@Param('productType') productType: string) {
    return this.inventoryManagementService.findInventoriesByType(productType);
  }

  @Get('find/:inventoryCode')
  @ApiOperation({ 
    summary: '재고 조회',
    description: '재고 코드로 재고 정보를 조회합니다.'
  })
  @ApiParam({ name: 'inventoryCode', description: '재고 코드', example: 'PRD001' })
  @ApiResponse({ 
    status: 200, 
    description: '재고 정보를 반환합니다.',
  })
  async findInventoryByCode(@Param('inventoryCode') inventoryCode: string) {
    return this.inventoryManagementService.findInventoryByCode(inventoryCode);
  }

  @Put('quantity/change')
  @ApiOperation({ 
    summary: '재고 수량 변경 (증감)',
    description: '재고 수량을 증감시킵니다. (양수: 증가, 음수: 감소)'
  })
  @ApiResponse({ 
    status: 200, 
    description: '재고 수량이 성공적으로 변경되었습니다.',
  })
  @ApiResponse({ 
    status: 400, 
    description: '수량 변경 후 재고가 음수가 될 수 없습니다.',
  })
  @ApiResponse({ 
    status: 404, 
    description: '해당 재고 코드의 재고를 찾을 수 없습니다.',
  })
  async changeInventoryQuantity(
    @Body() changeQuantityDto: ChangeQuantityDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.userId || 'system';
    return this.inventoryManagementService.changeInventoryQuantity(changeQuantityDto, updatedBy);
  }

  @Put('quantity/change-multiple')
  @ApiOperation({ 
    summary: '여러 재고 수량 일괄 변경 (증감)',
    description: '여러 재고의 수량을 일괄로 증감시킵니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '재고 수량들이 성공적으로 변경되었습니다.',
  })
  async changeMultipleInventoryQuantities(
    @Body() multipleQuantityChangeDto: MultipleQuantityChangeDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.userId || 'system';
    return this.inventoryManagementService.changeMultipleInventoryQuantities(multipleQuantityChangeDto, updatedBy);
  }

  @Put('sync/all')
  @ApiOperation({ 
    summary: '모든 재고의 품목 정보 동기화',
    description: '모든 재고의 품목 정보를 일괄로 동기화합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '모든 재고 정보가 성공적으로 동기화되었습니다.',
  })
  async syncAllInventoriesFromProducts(@Request() req: any) {
    const updatedBy = req.user?.userId || 'system';
    return this.inventoryManagementService.syncAllInventoriesFromProducts(updatedBy);
  }

}
