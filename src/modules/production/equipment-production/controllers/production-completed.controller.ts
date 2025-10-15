import {
  Controller,
  Get,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProductionResultReadService } from '../services/production-result-read.service';
import { QueryProductionResultDto } from '../dto/query-production-result.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 관리')
@Controller('production/completed')
@DevAuth()
export class ProductionCompletedController {
  constructor(
    private readonly productionResultReadService: ProductionResultReadService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '완료된 생산 목록 조회',
    description: '완료된 생산 목록을 조회합니다. 페이지네이션과 필터 조건을 지원합니다.',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 50 })
  @ApiQuery({ name: 'customerName', required: false, description: '고객사명' })
  @ApiQuery({ name: 'productName', required: false, description: '제품명' })
  @ApiQuery({ name: 'startDateFrom', required: false, description: '시작일 시작 범위 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'startDateTo', required: false, description: '시작일 종료 범위 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'completionDateFrom', required: false, description: '완료일 시작 범위 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'completionDateTo', required: false, description: '완료일 종료 범위 (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '완료된 생산 목록을 성공적으로 조회했습니다.' })
  async getCompletedProductions(
    @Query(ValidationPipe) query: QueryProductionResultDto,
  ) {
    try {
      const result = await this.productionResultReadService.getAllProductionResults(
        query.page || 1,
        query.limit || 50,
        query
      );

      return ApiResponseBuilder.success(result, '완료된 생산 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}


