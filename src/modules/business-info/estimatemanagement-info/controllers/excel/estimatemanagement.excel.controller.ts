import { Controller, Get, Post, Query, Res, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { Auth } from '../../../../../common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EstimateManagementTemplateService } from '../../services/estimatemanagement-template.service';
import { EstimateManagementReadService } from '../../services/estimatemanagement-read.service';
import { EstimateManagementDownloadService } from '../../services/estimatemanagement-download.service';
import { EstimateManagementUploadService } from '../../services/estimatemanagement-upload.service';

@Auth()
@ApiTags('견적관리 엑셀')
@Controller('estimatemanagement-info')
export class EstimateManagementExcelController {
    constructor(
        private readonly estimateManagementReadService: EstimateManagementReadService,
        private readonly estimateManagementTemplateService: EstimateManagementTemplateService,
        private readonly estimateManagementDownloadService: EstimateManagementDownloadService,
        private readonly estimateManagementUploadService: EstimateManagementUploadService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '견적관리 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.estimateManagementTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('견적관리 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Get('download-excel')
    @ApiOperation({ summary: '견적관리 엑셀 다운로드 (키워드 있으면 검색 결과, 없으면 전체)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'estimateCode', required: false, description: '견적코드 (포함 검색)' })
    @ApiQuery({ name: 'estimateName', required: false, description: '견적명 (포함 검색)' })
    @ApiQuery({ name: 'customerName', required: false, description: '고객명 (포함 검색)' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명 (포함 검색)' })
    @ApiQuery({ name: 'estimateStatus', required: false, description: '견적상태 (포함 검색)' })
    async downloadExcel(
        @Res() res: Response,
        @Query() query: any,
    ) {
        const { keyword, page, limit, estimateCode, estimateName, customerName, projectName, estimateStatus } = query;
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 99999;

        let result;

        
        // 검색어가 있으면 검색 결과만, 없으면 전체 데이터
        if (keyword && keyword.trim()) {
            result = await this.estimateManagementReadService.getAllEstimates(1, 99999, 'system', keyword.trim());
        } else if (estimateName && estimateName.trim()) {
            result = await this.estimateManagementReadService.getAllEstimates(1, 99999, 'system', estimateName.trim());
        } else if (customerName && customerName.trim()) {
            result = await this.estimateManagementReadService.getAllEstimates(1, 99999, 'system', customerName.trim());
        } else if (projectName && projectName.trim()) {
            result = await this.estimateManagementReadService.getAllEstimates(1, 99999, 'system', projectName.trim());
        } else {
            result = await this.estimateManagementReadService.getAllEstimates(1, 99999, 'system');
        }

        await this.estimateManagementDownloadService.exportEstimateInfos(result.estimates, res, keyword);
    }

    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '견적관리 엑셀 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: '견적관리 엑셀 파일',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '견적관리 엑셀 파일 (.xlsx)'
                }
            }
        }
    })
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request & { user: { username: string } }
    ) {
        if (!file) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
            throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        }

        const result = await this.estimateManagementUploadService.uploadEstimateManagement(file, req.user.username);
        
        return {
            success: true,
            message: `견적관리 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
            data: {
                success: result.success,
                failed: result.failed,
                errors: result.errors,
                totalProcessed: result.success + result.failed
            }
        };
    }
}
