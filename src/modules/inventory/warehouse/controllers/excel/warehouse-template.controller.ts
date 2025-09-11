import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { WarehouseTemplateService } from '../../services/warehouse-template.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('창고정보 엑셀')
@Controller('warehouse')
export class WarehouseTemplateController {
    constructor(
        private readonly warehouseTemplateService: WarehouseTemplateService
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '창고정보 엑셀 템플릿 다운로드' })
    @ApiResponse({ status: 200, description: '창고정보 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.warehouseTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('창고정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }
}