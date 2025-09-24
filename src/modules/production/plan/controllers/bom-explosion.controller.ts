import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BomExplosionService } from '../services/bom-explosion.service';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('BOM 전개')
@Controller('bom-explosion')
@DevAuth()
export class BomExplosionController {
  constructor(private readonly bomExplosionService: BomExplosionService) {}

  @Get('order/:orderCode')
  @ApiOperation({
    summary: '수주 기반 BOM 전개',
    description: '수주 코드를 기반으로 BOM을 전개하여 필요한 부품과 수량을 계산합니다. 하위 구성품이 있는 품목만 조회됩니다.',
  })
  @ApiParam({ name: 'orderCode', description: '수주 코드', example: 'ORD20250101001' })
  @ApiResponse({ status: 200, description: 'BOM 전개를 성공적으로 완료했습니다.' })
  @ApiResponse({ status: 404, description: '수주를 찾을 수 없습니다.' })
  async explodeBomByOrderCode(@Param('orderCode') orderCode: string) {
    try {
      const result = await this.bomExplosionService.explodeBomByOrderCode(orderCode);
      
      // 하위 구성품이 있는 품목만 필터링하고 shortageItems를 제거하는 함수
      const filterItemsWithChildren = (items: any[]): any[] => {
        return items.filter(item => {
          const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;
          
          if (hasChildren) {
            // children도 재귀적으로 필터링
            item.children = filterItemsWithChildren(item.children);
            
            // shortageItems 제거
            if (item.shortageItems) {
              delete item.shortageItems;
            }
            
            return true;
          }
          return false;
        });
      };

      // BOM 아이템들을 필터링
      const filteredBomItems = filterItemsWithChildren(result.bomItems || []);
      
      // 필터링된 결과로 응답 구성
      const filteredResult = {
        ...result,
        bomItems: filteredBomItems
      };
      
      return ApiResponseBuilder.success(filteredResult, 'BOM 전개를 성공적으로 완료했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Get('product/:productCode')
  @ApiOperation({
    summary: '품목 기반 BOM 전개',
    description: '품목 코드와 수량을 기반으로 BOM을 전개합니다.',
  })
  @ApiParam({ name: 'productCode', description: '품목 코드', example: 'PRD001' })
  @ApiQuery({ name: 'quantity', description: '수량', example: 100, required: true })
  @ApiResponse({ status: 200, description: 'BOM 전개를 성공적으로 완료했습니다.' })
  @ApiResponse({ status: 404, description: '품목을 찾을 수 없습니다.' })
  async explodeBomByProduct(
    @Param('productCode') productCode: string,
    @Query('quantity') quantity: string,
  ) {
    try {
      const quantityNum = parseInt(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        return ApiResponseBuilder.error('유효하지 않은 수량입니다.');
      }

      const result = await this.bomExplosionService.explodeBom(productCode, quantityNum);
      return ApiResponseBuilder.success(result, 'BOM 전개를 성공적으로 완료했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Get('shortage/:orderCode')
  @ApiOperation({
    summary: '수주 기반 부족 재고 조회',
    description: '수주를 기반으로 BOM을 전개하여 부족한 재고를 조회합니다.',
  })
  @ApiParam({ name: 'orderCode', description: '수주 코드', example: 'ORD20250101001' })
  @ApiResponse({ status: 200, description: '부족 재고를 성공적으로 조회했습니다.' })
  async getShortageItemsByOrderCode(@Param('orderCode') orderCode: string) {
    try {
      const result = await this.bomExplosionService.explodeBomByOrderCode(orderCode);
      const shortageItems = result.shortageItems;
      
      return ApiResponseBuilder.success(
        {
          orderCode,
          shortageItems,
          totalShortageItems: shortageItems.length,
          shortageSummary: shortageItems.reduce((acc, item) => {
            acc[item.productCode] = (acc[item.productCode] || 0) + item.shortageQuantity;
            return acc;
          }, {} as Record<string, number>),
        },
        '부족 재고를 성공적으로 조회했습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Get('sufficient/:orderCode')
  @ApiOperation({
    summary: '수주 기반 충분한 재고 조회',
    description: '수주를 기반으로 BOM을 전개하여 재고가 충분한 품목을 조회합니다.',
  })
  @ApiParam({ name: 'orderCode', description: '수주 코드', example: 'ORD20250101001' })
  @ApiResponse({ status: 200, description: '충분한 재고를 성공적으로 조회했습니다.' })
  async getSufficientItemsByOrderCode(@Param('orderCode') orderCode: string) {
    try {
      const result = await this.bomExplosionService.explodeBomByOrderCode(orderCode);
      const sufficientItems = result.sufficientItems;
      
      return ApiResponseBuilder.success(
        {
          orderCode,
          sufficientItems,
          totalSufficientItems: sufficientItems.length,
          sufficientSummary: sufficientItems.reduce((acc, item) => {
            acc[item.productCode] = {
              requiredQuantity: item.requiredQuantity,
              stockQuantity: item.stockQuantity,
              surplusQuantity: item.stockQuantity - item.requiredQuantity,
            };
            return acc;
          }, {} as Record<string, any>),
        },
        '충분한 재고를 성공적으로 조회했습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
