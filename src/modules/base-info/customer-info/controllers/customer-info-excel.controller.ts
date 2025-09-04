import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DevCustomerInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CustomerInfoSearchService } from '../services/customer-info-search.service';
import { CustomerInfoTemplateService } from '../services/customer-info-template.service';
import { CustomerInfoDownloadService } from '../services/customer-info-download.service';
import { CustomerInfoReadService } from '../services/customer-info-read.service';

@DevCustomerInfoAuth.read()
@ApiTags('CustomerInfo')
@Controller('customer-info')
export class CustomerInfoExcelController {
    constructor(
        private readonly excelTemplateService: CustomerInfoTemplateService,
        private readonly customerInfoSearchService: CustomerInfoSearchService,
        private readonly customerInfoService: CustomerInfoReadService,
        private readonly excelExportService: CustomerInfoDownloadService,
    ) {}

    @Get('download-template')
    @ApiOperation({summary: '거래처 정보 엑셀 템플릿 다운로드'})
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.excelTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('거래처정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Get('download-excel')
    @ApiOperation({summary: '거래처 정보 엑셀 다운로드 (키워드 있으면 검색 결과, 없으면 전체)'})
    @ApiQuery({name: 'keyword', required: false, description: '검색 키워드 (선택사항)'})
    @ApiQuery({name: 'page', required: false, description: '페이지 번호 (기본값: 1)'})
    @ApiQuery({name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)'})
    async downloadExcel(
        @Res() res: Response,
        @Query('keyword') keyword?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        let result;

        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 99999;

        if (keyword && keyword.trim()) {
            result = await this.customerInfoSearchService.searchCustomerInfo(keyword.trim(), pageNum, limitNum);
        } else {
            result = await this.customerInfoService.getAllCustomerInfo(pageNum, limitNum);
        }

        await this.excelExportService.exportCustomerInfos(result.data, res);
    }

}

