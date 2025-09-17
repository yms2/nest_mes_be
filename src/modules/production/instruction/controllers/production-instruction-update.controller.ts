import {
  Controller,
  Put,
  Param,
  Body,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionInstructionUpdateService } from '../services/production-instruction-update.service';
import { UpdateProductionInstructionDto } from '../dto/update-production-instruction.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 지시')
@Controller('production-instruction/update')
@DevAuth()
export class ProductionInstructionUpdateController {
  constructor(
    private readonly productionInstructionUpdateService: ProductionInstructionUpdateService,
  ) {}

  @Put(':id')
  @ApiOperation({
    summary: '생산 지시 수정',
    description: '생산 지시 정보를 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '생산 지시 ID' })
  @ApiResponse({ status: 200, description: '생산 지시를 성공적으로 수정했습니다.' })
  @ApiResponse({ status: 404, description: '생산 지시를 찾을 수 없습니다.' })
  async updateProductionInstruction(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateProductionInstructionDto,
  ) {
    try {
      const result = await this.productionInstructionUpdateService.updateProductionInstruction(id, updateDto);

      return ApiResponseBuilder.success(result, '생산 지시를 성공적으로 수정했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
