import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionStartService } from '../services/production-start.service';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 관리')
@Controller('production/current')
@DevAuth()
export class ProductionCurrentController {
  constructor(
    private readonly productionStartService: ProductionStartService,
  ) {}

  @Get(':productionInstructionCode')
  @ApiOperation({
    summary: '현재 생산 정보 조회 (생산 지시 코드)',
    description: '생산 지시 코드로 현재 진행중인 생산 코드와 정보를 조회합니다.',
  })
  @ApiParam({ name: 'productionInstructionCode', description: '생산 지시 코드', example: 'PI000001' })
  @ApiResponse({ status: 200, description: '현재 생산 정보를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 404, description: '생산 정보를 찾을 수 없습니다.' })
  async getCurrentProduction(
    @Param('productionInstructionCode') productionInstructionCode: string,
  ) {
    try {
      const result = await this.productionStartService.getCurrentProduction(productionInstructionCode);

      return ApiResponseBuilder.success(result, '현재 생산 정보를 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}

