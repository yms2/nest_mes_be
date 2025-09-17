import {
  Controller,
  Get,
  Query,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ProductionInstructionReadService } from '../services/production-instruction-read.service';
import { ProductionInstructionDownloadService } from '../services/production-instruction-download.service';
import { QueryProductionInstructionDto } from '../dto/query-production-instruction.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('생산 지시')
@Controller('production-instruction/download')
@DevAuth()
export class ProductionInstructionDownloadController {
  constructor(
    private readonly productionInstructionReadService: ProductionInstructionReadService,
    private readonly productionInstructionDownloadService: ProductionInstructionDownloadService,
  ) {}

  @Get('excel')
  @ApiOperation({
    summary: '생산 지시 Excel 다운로드',
    description: '생산 지시 목록을 Excel 파일로 다운로드합니다.',
  })
  @ApiResponse({ status: 200, description: 'Excel 파일 다운로드가 성공했습니다.' })
  async downloadProductionInstructionsExcel(
    @Query(ValidationPipe) query: QueryProductionInstructionDto,
    @Res() res: Response,
  ) {
    try {
      // 모든 데이터 조회 (페이지네이션 없이)
      const result = await this.productionInstructionReadService.getAllProductionInstructions(
        1,
        10000, // 큰 수로 설정하여 모든 데이터 조회
        query
      );

      // Excel 파일 생성 및 다운로드
      await this.productionInstructionDownloadService.exportProductionInstructionInfos(
        result.data,
        res,
        query.customerName || query.projectName || query.productName || query.productType
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Excel 다운로드 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
}
