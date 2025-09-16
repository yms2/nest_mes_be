import { Controller, Get, Res, Req } from '@nestjs/common';
import { ProductionPlanTemplateService } from '../services/production-plan-template.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { logService } from '@/modules/log/Services/log.service';

@ApiTags('생산계획 엑셀')
@Controller('production-plan')
export class ProductionPlanTemplateController {
    constructor(
        private readonly productionPlanTemplateService: ProductionPlanTemplateService,
        private readonly logService: logService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '생산계획 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response, @Req() req: Request & { user: { username: string } }) {
        try {
            const buffer = await this.productionPlanTemplateService.generateUploadTemplate();
            const fileName = encodeURIComponent('생산계획 양식.xlsx');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.end(buffer);

            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 엑셀',
                action: 'TEMPLATE_DOWNLOAD_SUCCESS',
                username: req.user.username,
                targetId: '',
                targetName: '생산계획 엑셀 템플릿',
                details: '생산계획 엑셀 템플릿을 다운로드했습니다.',
            });
        } catch (error) {
            // 로그 기록
            await this.logService.createDetailedLog({
                moduleName: '생산계획 엑셀',
                action: 'TEMPLATE_DOWNLOAD_FAIL',
                username: req.user.username,
                targetId: '',
                targetName: '생산계획 엑셀 템플릿',
                details: `템플릿 다운로드 실패: ${error.message}`,
            }).catch(() => {});
        }
    }
}