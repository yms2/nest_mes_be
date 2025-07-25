import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { BusinessInfoReadService } from '../services/business-info-read.service';
import { ExcelExportService } from '../services/business-download.service';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';

@Controller('business-info')
export class BusinessExcelDownloadController {
  constructor(
    private readonly businessInfoService: BusinessInfoReadService,
    private readonly excelExportService: ExcelExportService,
  ) {}

  @Get('download-excel')
  async downloadExcel(
    @Query() query: ReadBusinessInfoDto,
    @Res() res: Response,
  ) {
const result = await this.businessInfoService.getAllBusinessInfo();
await this.excelExportService.exportBusinessInfos(result.data, res);
  }
}