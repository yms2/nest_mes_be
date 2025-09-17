import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductionResultDownloadService } from '../services/production-result-download.service';
import { QueryProductionResultDto } from '../dto/query-production-result.dto';

@ApiTags('생산실적 다운로드')
@Controller('production-result/download')
export class ProductionResultDownloadController {
  constructor(
    private readonly productionResultDownloadService: ProductionResultDownloadService,
  ) {}

  @Get('excel')
  @ApiOperation({ 
    summary: '생산실적 엑셀 다운로드',
    description: '생산실적 데이터를 엑셀 파일로 다운로드합니다.'
  })
  @ApiQuery({ name: 'productionInstructionCode', required: false, description: '생산지시코드' })
  @ApiQuery({ name: 'productCode', required: false, description: '품목코드' })
  @ApiQuery({ name: 'productName', required: false, description: '품목명' })
  @ApiQuery({ name: 'productType', required: false, description: '품목구분' })
  @ApiQuery({ name: 'employeeCode', required: false, description: '담당자코드' })
  @ApiQuery({ name: 'employeeName', required: false, description: '담당자명' })
  @ApiQuery({ name: 'productionStatus', required: false, description: '생산상태' })
  @ApiQuery({ name: 'startDateFrom', required: false, description: '시작일(From)' })
  @ApiQuery({ name: 'startDateTo', required: false, description: '시작일(To)' })
  @ApiQuery({ name: 'completionDateFrom', required: false, description: '완료일(From)' })
  @ApiQuery({ name: 'completionDateTo', required: false, description: '완료일(To)' })
  async downloadExcel(
    @Query() query: QueryProductionResultDto,
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.productionResultDownloadService.downloadExcel(query);
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `생산실적_${timestamp}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.length.toString(),
      });

      res.send(buffer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '엑셀 다운로드 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }
}
