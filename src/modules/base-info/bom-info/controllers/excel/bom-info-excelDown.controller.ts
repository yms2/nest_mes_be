import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { BomInfoExcelDownloadService } from '../../services';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('BOM')
@Controller('bom')
export class BomInfoDownloadController {
  constructor(private readonly bomService: BomInfoExcelDownloadService) {}

  @Get('download')
  @ApiOperation({
    summary: 'BOM 다운로드',
    description: '등록된 BOM 데이터를 엑셀 파일로 다운로드합니다.',
  })
  async downloadBom(@Res() res: Response) {
    const fileBuffer = await this.bomService.downloadBomData();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="bom_data.xlsx"',
      'Content-Length': fileBuffer.length,
    });

    res.end(fileBuffer);
  }
}
