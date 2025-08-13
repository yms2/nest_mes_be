import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Auth } from '../../../../common/decorators/auth.decorator';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ExcelTemplateService } from '../services/employee-template.service';
import { EmployeeReadService } from '../services/employee-read.service';
import { EmployeeSearchService } from '../services/employee-search.service';
import { ExcelExportService } from '../services/employee-download.service';

@Auth()
@ApiTags('EmployeeInfo')
@Controller('employee-info')
export class EmployeeExcelController {
    constructor(
        private readonly employeeReadService: EmployeeReadService,
        private readonly excelTemplateService: ExcelTemplateService,
        private readonly employeeSearchService: EmployeeSearchService,
        private readonly excelExportService: ExcelExportService,
    ) {}

    @Get('download-template')
    @ApiOperation({ summary: '직원 정보 엑셀 템플릿 다운로드' })
    async downloadTemplate(@Res() res: Response) {
        const buffer = await this.excelTemplateService.generateUploadTemplate();
        const fileName = encodeURIComponent('직원정보 양식.xlsx');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(buffer);
    }

    @Get('download-excel')
    @ApiOperation({ summary: '직원 정보 엑셀 다운로드 (키워드 있으면 검색 결과, 없으면 전체)' })
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
            result = await this.employeeSearchService.searchEmployee(keyword.trim(), pageNum, limitNum);
        } else {
            result = await this.employeeReadService.getAllEmployee(pageNum, limitNum);
        }

        await this.excelExportService.exportEmployeeInfos(result.data, res);
    }

}