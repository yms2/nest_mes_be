import {
  Controller,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionInstructionDeleteService } from '../services/production-instruction-delete.service';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 지시')
@Controller('production-instruction/delete')
@DevAuth()
export class ProductionInstructionDeleteController {
  constructor(
    private readonly productionInstructionDeleteService: ProductionInstructionDeleteService,
  ) {}

  @Delete(':id')
  @ApiOperation({
    summary: '생산 지시 삭제',
    description: '생산 지시를 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '생산 지시 ID' })
  @ApiResponse({ status: 200, description: '생산 지시를 성공적으로 삭제했습니다.' })
  @ApiResponse({ status: 404, description: '생산 지시를 찾을 수 없습니다.' })
  async deleteProductionInstruction(
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      await this.productionInstructionDeleteService.deleteProductionInstruction(id);

      return ApiResponseBuilder.success(null, '생산 지시를 성공적으로 삭제했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Delete('batch')
  @ApiOperation({
    summary: '생산 지시 일괄 삭제',
    description: '여러 생산 지시를 한 번에 삭제합니다.',
  })
  @ApiResponse({ status: 200, description: '생산 지시들을 성공적으로 삭제했습니다.' })
  async deleteProductionInstructions(
    @Body() ids: number[],
  ) {
    try {
      const result = await this.productionInstructionDeleteService.deleteProductionInstructions(ids);

      return ApiResponseBuilder.success(result, '생산 지시들을 성공적으로 삭제했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
