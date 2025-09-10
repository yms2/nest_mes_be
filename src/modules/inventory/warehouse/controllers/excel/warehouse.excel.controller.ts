import { BadRequestException, Controller, Get, Post, Query, Req, Res, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { WarehouseReadService } from '../../services/warehouse-read.service';
import { WarehouseDownloadService } from '../../services/warehouse-download.service';
import { WarehouseUploadService } from '../../services/warehouse-upload.service';

@DevAuth()
@ApiTags('창고관리 엑셀')
@Controller('warehouse')
export class WarehouseExcelController {
    constructor(
        private readonly warehouseReadService: WarehouseReadService,
        private readonly warehouseDownloadService: WarehouseDownloadService,
        private readonly warehouseUploadService: WarehouseUploadService,
    ) {}

    @Get('download-excel')
    @ApiOperation({ summary: '창고관리 엑셀 다운로드 (데이터 없으면 빈값, 있으면 있는 것만)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (선택사항)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'warehouseCode', required: false, description: '창고코드 (포함 검색)' })
    @ApiQuery({ name: 'warehouseName', required: false, description: '창고명 (포함 검색)' })
    @ApiQuery({ name: 'warehouseLocation', required: false, description: '창고위치 (포함 검색)' })
    @ApiQuery({ name: 'warehouseBigo', required: false, description: '창고비고 (포함 검색)' })
    async downloadExcel(@Res() res: Response, @Query() query: any) {
        const { keyword, page, limit, warehouseCode, warehouseName, warehouseLocation, warehouseBigo } = query;
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 99999;

        let result;
        let searchKeyword = '';

        if (keyword && keyword.trim()) {
            searchKeyword = keyword.trim();
            result = await this.warehouseReadService.getAllWarehouse(1, 99999, 'system', searchKeyword);
        } else if (warehouseCode && warehouseCode.trim()) {
            searchKeyword = warehouseCode.trim();
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

        if (!result.warehouse || result.warehouse.length === 0) {
            await this.warehouseDownloadService.exportEmptyWarehouseInfos(res, searchKeyword);
            return;
        }

        await this.warehouseDownloadService.exportWarehouseInfos(result.warehouse, res, searchKeyword);
    }

    @Post('upload-excel')
    @ApiOperation({ summary: '창고관리 엑셀 업로드' })
    @ApiBody({ type: 'multipart/form-data', schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
    async uploadExcel(@UploadedFile() file: Express.Multer.File, @Req() req: Request & { user: { username: string } }) {
        if (!file) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
            throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
        }

        const result = await this.warehouseUploadService.uploadWarehouse(file, req.user.username);

        if (!result) {
            throw new BadRequestException('업로드 처리 중 오류가 발생했습니다.');
        }

        return {
            success: true,
            message: `창고관리 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
            data: {
                success: result.success,
                failed: result.failed,
                errors: result.errors,
                totalProcessed: result.success + result.failed
            }
        };
    }
}