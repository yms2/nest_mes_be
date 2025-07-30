import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../../../../common/decorators/auth.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessInfoReadService } from '../services/business-info-read.service';
import { ExcelExportService } from '../services/business-download.service';
import { ExcelTemplateService } from '../services/business-template.service';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { BusinessInfoSearchService } from '../services/business-info-search.service';

@Auth()
@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessExcelController {
  constructor(
    private readonly businessInfoService: BusinessInfoReadService,
    private readonly excelExportService: ExcelExportService,
    private readonly excelTemplateService: ExcelTemplateService,
    private readonly businessInfoSearchService: BusinessInfoSearchService,
  ) {}

  @Get('download-template')
  @ApiOperation({ summary: '사업장 정보 엑셀 템플릿 다운로드' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.excelTemplateService.generateUploadTemplate();
    const fileName = encodeURIComponent('사업장정보 양식.xlsx');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.end(buffer);
  }

  @Get('download-excel')
  @ApiOperation({ summary: '사업장 정보 엑셀 전체 다운로드' })
  async downloadExcel(
    @Query() query: ReadBusinessInfoDto,
    @Res() res: Response,
  ) {
    const result = await this.businessInfoService.getAllBusinessInfo();
    await this.excelExportService.exportBusinessInfos(result.data, res);
  }

  @Get('download-search-excel')
  @ApiOperation({ summary: '검색 조건 엑셀 다운로드' })
  async downloadSearchExcel(
    @Query('keyword') keyword: string,
    @Res() res: Response,
  ) {
    // 전체 검색을 위해 limit을 매우 큰 수로 지정
    const result = await this.businessInfoSearchService.searchBusinessInfo(keyword || '', 1, 99999);
    await this.excelExportService.exportBusinessInfos(result.data, res);

    console.log(result.data);
  }
} 