import {
  Controller,
  Post,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductionEndService } from '../services/production-end.service';
import { EndProductionDto } from '../dto/end-production.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 관리')
@Controller('production/end')
@DevAuth()
export class ProductionEndController {
  constructor(
    private readonly productionEndService: ProductionEndService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '생산 종료',
    description: '생산을 종료하고 생산수량, 불량수량, 불량사유를 등록합니다.',
  })
  @ApiResponse({ status: 200, description: '생산이 성공적으로 종료되었습니다.' })
  @ApiResponse({ status: 404, description: '생산을 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '재고 부족으로 생산을 완료할 수 없습니다.' })
  async endProduction(
    @Body(ValidationPipe) dto: EndProductionDto,
  ) {
    try {
      const result = await this.productionEndService.endProduction(dto, 'dev-user');

      return ApiResponseBuilder.success(result, '생산이 성공적으로 종료되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(error.message);
    }
  }
}
