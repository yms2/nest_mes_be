import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ProductionDefectDownloadService } from '../services/production-defect-download.service';

@ApiTags('불량현황 다운로드')
@Controller('production-defect/download')
export class ProductionDefectDownloadController {
    constructor(
        private readonly productionDefectDownloadService: ProductionDefectDownloadService
    ) {}

    @Get('excel')
    @ApiOperation({ 
        summary: '불량현황 엑셀 다운로드',
        description: '불량현황 데이터를 엑셀 파일로 다운로드합니다. 품목, 생산 정보가 포함됩니다.'
    })
    @ApiQuery({ name: 'search', required: false, description: '검색 키워드 (불량코드, 사유, 사원코드, 사원명, 비고)' })
    async downloadExcel(
        @Query('search') search: string,
        @Res() res: Response,
    ) {
        try {
            const buffer = await this.productionDefectDownloadService.downloadExcel(search);
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            const filename = search 
                ? `불량현황_검색결과_${search}_${timestamp}.xlsx`
                : `불량현황_전체목록_${timestamp}.xlsx`;
            
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
