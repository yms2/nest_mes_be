import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductionStartService } from '../services/production-start.service';
import { StartProductionDto } from '../dto/start-production.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 관리')
@Controller('production/start')
@DevAuth()
export class ProductionStartController {
  constructor(
    private readonly productionStartService: ProductionStartService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '생산 시작',
    description: '생산 지시를 기반으로 생산을 시작합니다. BOM 공정을 자동으로 가져와 첫 번째 공정부터 시작합니다.',
  })
  @ApiResponse({ status: 201, description: '생산이 성공적으로 시작되었습니다.' })
  @ApiResponse({ status: 404, description: '생산 지시 또는 BOM 공정을 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '재고 부족으로 생산을 시작할 수 없습니다.' })
  async startProduction(
    @Body(ValidationPipe) dto: StartProductionDto,
  ) {
    try {
      const result = await this.productionStartService.startProduction(dto, 'dev-user');

      return ApiResponseBuilder.success(result, '생산이 성공적으로 시작되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }

  @Get('bom-processes/:productionInstructionCode')
  @ApiOperation({
    summary: 'BOM 공정 조회',
    description: '생산 지시에 해당하는 BOM 공정 목록을 조회합니다.',
  })
  @ApiParam({ name: 'productionInstructionCode', description: '생산 지시 코드' })
  @ApiResponse({ status: 200, description: 'BOM 공정 목록을 성공적으로 조회했습니다.' })
  async getBomProcesses(
    @Param('productionInstructionCode') productionInstructionCode: string,
  ) {
    try {
      const result = await this.productionStartService.getBomProcesses(productionInstructionCode);

      return ApiResponseBuilder.success(result, 'BOM 공정 목록을 성공적으로 조회했습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
