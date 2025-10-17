import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { InventorySummaryService } from '../services/inventory-summary.service';
import { InventorySummaryQueryDto, InventorySummaryResponseDto } from '../dto/inventory-summary.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('재고 현황')
@Controller('inventory/summary')
@DevAuth()
@ApiBearerAuth()
export class InventorySummaryController {
  constructor(
    private readonly inventorySummaryService: InventorySummaryService,
  ) {}

  @Get('period')
  @ApiOperation({ 
    summary: '기간별 재고 현황 조회',
    description: '지정된 기간 동안의 재고 현황을 조회합니다. 기간 이전 재고, 입고, 출고, 조정 내역, 현재 재고를 포함합니다.'
  })
  @ApiQuery({ 
    name: 'startDate', 
    description: '시작 날짜 (YYYY-MM-DD)',
    required: true 
  })
  @ApiQuery({ 
    name: 'endDate', 
    description: '종료 날짜 (YYYY-MM-DD)',
    required: true 
  })
  @ApiQuery({ 
    name: 'inventoryCode', 
    description: '재고 코드 (선택사항)',
    required: false 
  })
  @ApiQuery({ 
    name: 'inventoryName', 
    description: '재고명 (부분 검색 가능)',
    required: false 
  })
  @ApiQuery({ 
    name: 'page', 
    description: '페이지 번호',
    required: false 
  })
  @ApiQuery({ 
    name: 'limit', 
    description: '페이지당 항목 수',
    required: false 
  })
  @ApiResponse({ 
    status: 200, 
    description: '기간별 재고 현황을 반환합니다.',
    type: InventorySummaryResponseDto
  })
  async getInventorySummary(@Query() queryDto: InventorySummaryQueryDto): Promise<InventorySummaryResponseDto> {
    return this.inventorySummaryService.getInventorySummary(queryDto);
  }

  @Get('detail/:inventoryCode')
  @ApiOperation({ 
    summary: '특정 재고 상세 현황 조회',
    description: '특정 재고의 기간별 상세 현황을 조회합니다.'
  })
  @ApiParam({ 
    name: 'inventoryCode', 
    description: '재고 코드'
  })
  @ApiQuery({ 
    name: 'startDate', 
    description: '시작 날짜 (YYYY-MM-DD)',
    required: true 
  })
  @ApiQuery({ 
    name: 'endDate', 
    description: '종료 날짜 (YYYY-MM-DD)',
    required: true 
  })
  @ApiResponse({ 
    status: 200, 
    description: '특정 재고의 상세 현황을 반환합니다.'
  })
  async getInventoryDetailSummary(
    @Param('inventoryCode') inventoryCode: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.inventorySummaryService.getInventoryDetailSummary(inventoryCode, startDate, endDate);
  }

  @Get('monthly/:year/:month')
  @ApiOperation({ 
    summary: '월말 재고 현황 조회',
    description: '특정 월의 월말 재고 현황을 조회합니다.'
  })
  @ApiParam({ 
    name: 'year', 
    description: '년도'
  })
  @ApiParam({ 
    name: 'month', 
    description: '월 (1-12)'
  })
  @ApiQuery({ 
    name: 'inventoryCode', 
    description: '재고 코드 (선택사항)',
    required: false 
  })
  @ApiResponse({ 
    status: 200, 
    description: '월말 재고 현황을 반환합니다.',
    type: InventorySummaryResponseDto
  })
  async getMonthlyInventorySummary(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @Query('inventoryCode') inventoryCode?: string,
  ): Promise<InventorySummaryResponseDto> {
    return this.inventorySummaryService.getMonthlyInventorySummary(year, month, inventoryCode);
  }

  @Get('current')
  @ApiOperation({ 
    summary: '현재 재고 현황 조회',
    description: '현재 시점의 재고 현황을 조회합니다. (최근 30일 기준)'
  })
  @ApiQuery({ 
    name: 'inventoryCode', 
    description: '재고 코드 (선택사항)',
    required: false 
  })
  @ApiQuery({ 
    name: 'inventoryName', 
    description: '재고명 (부분 검색 가능)',
    required: false 
  })
  @ApiResponse({ 
    status: 200, 
    description: '현재 재고 현황을 반환합니다.',
    type: InventorySummaryResponseDto
  })
  async getCurrentInventorySummary(
    @Query('inventoryCode') inventoryCode?: string,
    @Query('inventoryName') inventoryName?: string,
  ): Promise<InventorySummaryResponseDto> {
    // 최근 30일 기준으로 조회
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const queryDto: InventorySummaryQueryDto = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      inventoryCode,
      inventoryName,
      page: 1,
      limit: 1000
    };

    return this.inventorySummaryService.getInventorySummary(queryDto);
  }
}
