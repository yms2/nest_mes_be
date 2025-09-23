import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EquipmentTemplateService } from '../services/equipment-template.service';
import { EquipmentReadService } from '../services/equipment-read.service';
import { EquipmentDownloadService } from '../services/equipment-download.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@DevAuth()
@ApiTags('설비 관리')
@Controller('equipment')

export class EquipmentExcelController {
    constructor(
        private readonly equipmentTemplateService: EquipmentTemplateService,
        private readonly equipmentReadService: EquipmentReadService,
        private readonly equipmentDownloadService: EquipmentDownloadService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '설비정보 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.equipmentTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('설비정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Get('download-excel')
    @ApiOperation({ summary: '설비정보 엑셀 다운로드' })
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

        if (keyword && keyword.trim()) {
            result = await this.equipmentReadService.searchEquipment(keyword.trim(), pageNum, limitNum);
        } else {
            result = await this.equipmentReadService.getAllEquipment(pageNum, limitNum);
        }

        await this.equipmentDownloadService.exportEquipmentInfos(result.data, res);
    }
}