import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { BomExcelService } from '../services/bom-info-excel.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('BOM')
@Controller('bom')
export class BomExcelController {
  constructor(private readonly bomExcelService: BomExcelService) {}

  @Get('template')
  @ApiOperation({ summary: 'BOM 양식', description: 'BOM 양식을 엑셀 파일로 다운로드합니다.' })
  async downloadBomTemplate(@Res() res: Response) {
    const fileBuffer = this.bomExcelService.generateBomTemplate();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="bom_template.xlsx"',
      'Content-Length': fileBuffer.length,
    });

    res.end(fileBuffer);
  }
}
