import {
  Controller,
  Get,
  Query,
  Param,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionResultReadService } from '../services/production-result-read.service';
import { QueryProductionResultDto } from '../dto/query-production-result.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 관리')
@Controller('production/result')
@DevAuth()
export class ProductionResultReadController {
  constructor(
    private readonly productionResultReadService: ProductionResultReadService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '생산실적 목록 조회',
    description: '생산실적 목록을 조회합니다. 다양한 필터 조건을 지원합니다.',
  })
  @ApiResponse({ status: 200, description: '생산실적 목록을 성공적으로 조회했습니다.' })
  async getProductionResults(
    @Query(ValidationPipe) query: QueryProductionResultDto,
  ) {
    try {
      const result = await this.productionResultReadService.getAllProductionResults(
        query.page || 1,
        query.limit || 20,
        query
      );

      return ApiResponseBuilder.success(result, '생산실적 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
