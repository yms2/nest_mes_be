import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../../../../../common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductInfoReadService } from '../services/product-info-read.service';
import { ProductInfoTemplateService } from '../services/product-info-template.service';
import { ProductInfoSearchService } from '../services/product-info-search.service';

@Auth()
@ApiTags('ProductInfo')
@Controller('product-info')
export class ProductInfoExcelController {
    constructor(
        private readonly productInfoService: ProductInfoReadService,
        private readonly productInfoTemplateService: ProductInfoTemplateService,
        private readonly productInfoSearchService: ProductInfoSearchService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '품목정보 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.productInfoTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('품목정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }
    
    
}