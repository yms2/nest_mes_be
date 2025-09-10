import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrderManagementTemplateService } from '../services/ordermanagement-template.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../../../../common/decorators/auth.decorator';


@ApiTags('수주관리 엑셀')
@Controller('ordermanagement-info')
export class OrderManagementTemplateController {
    constructor(
        private readonly orderManagementTemplateService: OrderManagementTemplateService
        
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '수주관리 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.orderManagementTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('수주관리 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }
}