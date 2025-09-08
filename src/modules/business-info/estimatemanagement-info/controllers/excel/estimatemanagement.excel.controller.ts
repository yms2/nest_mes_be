import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EstimateManagementTemplateService } from '../../services/estimatemanagement-template.service';


@Auth()
@ApiTags('견적관리')
@Controller('estimate-management')
export class EstimateManagementExcelController {
    constructor(
        private readonly estimateManagementTemplateService: EstimateManagementTemplateService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '견적관리 양식', description: '견적관리 양식을 엑셀 파일로 다운로드합니다.' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.estimateManagementTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('견적관리 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Get('download-excel')
    @ApiOperation({ summary: '견적관리 엑셀 다운로드', description: '견적관리 엑셀 다운로드합니다.' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    async downloadExcel(
        @Res() res: Response,
        @Query('keyword') keyword?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        let result;

        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 99999;
        
    }
}
