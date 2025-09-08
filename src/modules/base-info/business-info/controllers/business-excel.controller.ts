import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../../../../common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: '사업장 정보 엑셀 다운로드 (키워드 있으면 검색 결과, 없으면 전체)' })
  @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
  @ApiQuery({ name: 'businessNumber', required: false, description: '사업자등록번호 (포함 검색)' })
  @ApiQuery({ name: 'businessName', required: false, description: '사업자명 (포함 검색)' })
  async downloadExcel(
    @Res() res: Response,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('businessNumber') businessNumber?: string,
    @Query('businessName') businessName?: string,
  ) {
    let result;
    
    // 기본값 설정
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 99999;
    
    // 사업자등록번호로 검색 (해당 필드에서만)
    if (businessNumber && businessNumber.trim()) {
      result = await this.businessInfoSearchService.searchBusinessInfoByField('businessNumber', businessNumber.trim(), pageNum, limitNum);
    }
    // 사업자명으로 검색 (해당 필드에서만)
    else if (businessName && businessName.trim()) {
      result = await this.businessInfoSearchService.searchBusinessInfoByField('businessName', businessName.trim(), pageNum, limitNum);
    }
    // 통합 검색 (모든 필드에서)
    else if (keyword && keyword.trim()) {
      // 키워드가 있으면 검색 결과 다운로드
      result = await this.businessInfoSearchService.searchBusinessInfo(keyword.trim(), pageNum, limitNum);
    } else {
      // 키워드가 없으면 전체 다운로드
      result = await this.businessInfoService.getAllBusinessInfo(pageNum, limitNum);
    }
    
    // 엑셀 파일 다운로드만 처리
    await this.excelExportService.exportBusinessInfos(result.data, res);
  }
} 