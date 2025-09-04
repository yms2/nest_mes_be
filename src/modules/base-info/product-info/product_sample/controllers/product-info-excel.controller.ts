import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../../../../../common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductInfoReadService } from '../services/product-info-read.service';
import { ProductInfoTemplateService } from '../services/product-info-template.service';
import { ProductInfoSearchService } from '../services/product-info-search.service';
import { ProductDownloadService } from '../services/product-download.service';

@Auth()
@ApiTags('ProductInfo')
@Controller('product-info')
export class ProductInfoExcelController {
    constructor(
        private readonly productInfoService: ProductInfoReadService,
        private readonly productInfoTemplateService: ProductInfoTemplateService,
        private readonly productInfoSearchService: ProductInfoSearchService,
        private readonly productDownloadService: ProductDownloadService,
    ) {}

    @ApiOperation({ summary: '품목정보 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.productInfoTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('품목정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }
    
    @Get('download-excel')
    @ApiOperation({ summary: '품목정보 엑셀 다운로드 (키워드 있으면 검색 결과, 없으면 전체)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'productName', required: false, description: '품명 (포함 검색)' })
    async downloadExcel(
        @Res() res: Response,
        @Query('keyword') keyword?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('productName') productName?: string,
    ) {
        let result;

        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 99999;

        // 품명으로 검색 (해당 필드에서만)
        if (productName && productName.trim()) {
            result = await this.productInfoSearchService.searchProductInfo(productName.trim(), pageNum, limitNum);
        }
        // 통합 검색 (모든 필드에서)
        else if (keyword && keyword.trim()) {
            result = await this.productInfoSearchService.searchProductInfo(keyword.trim(), pageNum, limitNum);
        } else {
            result = await this.productInfoService.getAllProductInfo(pageNum, limitNum);
        }

        await this.productDownloadService.exportProductInfos(result.data, res); 
    }
}