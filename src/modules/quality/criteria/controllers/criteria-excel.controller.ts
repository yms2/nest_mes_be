import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Controller, Get, Post, Req, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { Response } from "express";
import { QualityCriteriaTemplateService } from "../services/quality-criteria-template.service";
import { QualityCriteriaUploadService } from "../services/quality-criteria-upload.service";
import { ApiOperation, ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

@DevAuth()
@ApiTags('품질기준정보 엑셀')
@Controller('quality-criteria')
export class CriteriaExcelController {
    constructor(
        private readonly qualityCriteriaTemplateService: QualityCriteriaTemplateService,
        private readonly qualityCriteriaUploadService: QualityCriteriaUploadService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '품질기준정보 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.qualityCriteriaTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('품질기준정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Post('upload-excel')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: '품질기준정보 엑셀 업로드' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '품질기준정보 엑셀 파일'
                }
            }
        }
    })
    async uploadExcel(
        @UploadedFile() file: Express.Multer.File, 
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.qualityCriteriaUploadService.uploadQualityCriteria(file, username);
    }
}