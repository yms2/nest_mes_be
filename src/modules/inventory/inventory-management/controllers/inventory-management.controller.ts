import { Controller, Post, Get, Put, Param, Body, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { InventoryManagementService } from '../services/inventory-management.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ChangeQuantityDto, SetQuantityDto, MultipleQuantityChangeDto, MultipleQuantitySetDto } from '../dto/quantity-change.dto';

@ApiTags('재고 관리')
@Controller('inventory/management')
@DevAuth()
@ApiBearerAuth()
export class InventoryManagementController {
  constructor(
    private readonly inventoryManagementService: InventoryManagementService,
  ) {}

  @Post('create-all-products')
  @ApiOperation({ 
    summary: '모든 품목을 재고로 등록',
    description: '등록된 모든 품목을 재고로 등록합니다. 이미 재고로 등록된 품목은 건너뜁니다.'
  })
  @ApiResponse({ 
    status: 201, 
    description: '모든 품목의 재고 생성이 완료되었습니다.',
  })
  async createAllProductsAsInventory(@Request() req: any) {
    const createdBy = req.user?.userId || 'system';
    return this.inventoryManagementService.createAllProductsAsInventory(createdBy);
  }

  @Get('all')
  @ApiOperation({ 
    summary: '모든 재고 조회',
    description: '등록된 모든 재고 정보를 조회합니다.'
  })
  @ApiResponse({ 
    status: 200, 
    description: '모든 재고 정보를 반환합니다.',
  })
  async findAllInventories() {
    return this.inventoryManagementService.findAllInventories();
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

}
