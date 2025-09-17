import {
  Controller,
  Get,
  Param,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionInstructionReadService } from '../services/production-instruction-read.service';
import { QueryProductionInstructionDto } from '../dto/query-production-instruction.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 지시')
@Controller('production-instruction/read')
@DevAuth()
export class ProductionInstructionReadController {
  constructor(
    private readonly productionInstructionReadService: ProductionInstructionReadService,
  ) {}

  @Get()
  @ApiOperation({
    summary: '생산 지시 목록 조회',
    description: '생산 지시 목록을 조회합니다. 다양한 필터 조건을 지원합니다.',
  })
  @ApiResponse({ status: 200, description: '생산 지시 목록을 성공적으로 조회했습니다.' })
  async getProductionInstructions(
    @Query(ValidationPipe) query: QueryProductionInstructionDto,
  ) {
    try {
      const result = await this.productionInstructionReadService.getAllProductionInstructions(
        query.page || 1, 
        20, 
        query
      );

      return ApiResponseBuilder.success(result, '생산 지시 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
