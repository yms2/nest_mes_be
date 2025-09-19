import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { WarehouseTemplateService } from '../../services/warehouse-template.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { WarehouseReadService } from '../../services/warehouse-read.service';
import { WarehouseDownloadService } from '../../services/warehouse-download.service';
import { Auth } from '@/common/decorators/auth.decorator';

@DevAuth()
@ApiTags('창고관리 엑셀')
@Controller('warehouse/excel')
export class WarehouseTemplateController {
    constructor(
        private readonly warehouseTemplateService: WarehouseTemplateService,
        private readonly warehouseDownloadService: WarehouseDownloadService,
        private readonly warehouseReadService: WarehouseReadService,
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
    
    @Get('download-excel')
    @ApiOperation({ 
        summary: '창고관리 엑셀 다운로드',
        description: '창고관리 데이터를 엑셀 파일로 다운로드합니다.'
    })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (창고명, 창고위치, 창고비고 등)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'warehouseName', required: false, description: '창고명 (포함 검색)' })
    @ApiQuery({ name: 'warehouseLocation', required: false, description: '창고위치 (포함 검색)' })
    @ApiQuery({ name: 'warehouseBigo', required: false, description: '창고비고 (포함 검색)' })
    @ApiResponse({ 
        status: 200, 
        description: '창고관리 엑셀 파일이 성공적으로 다운로드되었습니다.',
    })
    async downloadExcel(
        @Res() res: Response, 
        @Query() query: any,
    ) {
        try {
            const {
                keyword,
                page = 1,
                limit = 99999,
                warehouseName,
                warehouseLocation,
                warehouseBigo
            } = query;


            let result;
            let searchKeyword = '';
            // 페이지네이션 파라미터 처리
            const pageNum = this.safeParseInt(page, 1);
            const limitNum = this.safeParseInt(limit, 99999);

            // 검색 조건에 따른 데이터 조회

            if (keyword && keyword.trim()) {
                searchKeyword = keyword.trim();
                result = await this.warehouseReadService.getAllWarehouse(1, 99999, 'system', searchKeyword);
            } else if (warehouseName && warehouseName.trim()) {
                searchKeyword = warehouseName.trim();
                result = await this.warehouseReadService.getAllWarehouse(1, 99999, 'system', searchKeyword);
            } else if (warehouseLocation && warehouseLocation.trim()) {
                searchKeyword = warehouseLocation.trim();
                result = await this.warehouseReadService.getAllWarehouse(1, 99999, 'system', searchKeyword);
            } else if (warehouseBigo && warehouseBigo.trim()) {
                searchKeyword = warehouseBigo.trim();
                result = await this.warehouseReadService.getAllWarehouse(1, 99999, 'system', searchKeyword);
            } else {
                result = await this.warehouseReadService.getAllWarehouse(1, 99999, 'system');
            }

            // 데이터가 없으면 빈 엑셀 파일 생성
            if (!result.warehouse || result.warehouse.length === 0) {
                await this.warehouseDownloadService.exportEmptyWarehouseInfos(res, searchKeyword);
                return;
            }

            // 데이터가 있으면 있는 것만 다운로드
            await this.warehouseDownloadService.exportWarehouseInfos(result.warehouse, res, searchKeyword);
            
        } catch (error) {
            // 오류 발생 시 빈 엑셀 파일 생성
            await this.warehouseDownloadService.exportEmptyWarehouseInfos(res, '오류 발생');
        }
    }

    private safeParseInt(value: any, defaultValue: number): number {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        const parsed = parseInt(value.toString(), 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
}