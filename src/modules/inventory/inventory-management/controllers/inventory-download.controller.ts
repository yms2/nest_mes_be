import { Controller, Get, Query, Res, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DevAuth } from 'src/common/decorators/dev-auth.decorator';
import { InventoryManagementService } from '../services/inventory-management.service';
import { InventoryDownloadService } from '../services/inventory-download.service';

@DevAuth()
@ApiTags('재고현황 엑셀')
@Controller('inventory/download')
@ApiBearerAuth()
export class InventoryDownloadController {
    constructor(
        private readonly inventoryManagementService: InventoryManagementService,
        private readonly inventoryDownloadService: InventoryDownloadService,
    ) {}

    private safeParseInt(value: any, defaultValue: number): number {
        if (!value) return defaultValue;
        const parsed = parseInt(String(value), 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    @Get('download-excel')
    @ApiOperation({ 
        summary: '재고현황 엑셀 다운로드',
        description: '재고현황 데이터를 엑셀 파일로 다운로드합니다.'
    })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (재고명, 재고코드, 품목구분 등)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'inventoryCode', required: false, description: '재고코드 (포함 검색)' })
    @ApiQuery({ name: 'inventoryName', required: false, description: '재고명 (포함 검색)' })
    @ApiQuery({ name: 'inventoryType', required: false, description: '품목구분 (포함 검색)' })
    @ApiQuery({ name: 'inventoryLocation', required: false, description: '재고위치 (포함 검색)' })
    @ApiQuery({ name: 'inventoryStatus', required: false, description: '재고상태 (포함 검색)' })
    @ApiResponse({ 
        status: 200, 
        description: '재고현황 엑셀 파일이 성공적으로 다운로드되었습니다.',
    })
    async downloadExcel(@Res() res: Response, @Query() query: any) {
        const { 
            keyword, 
            page, 
            limit, 
            inventoryCode, 
            inventoryName, 
            inventoryType, 
            inventoryLocation, 
            inventoryStatus 
        } = query;
        
        const pageNum = this.safeParseInt(page, 1);
        const limitNum = this.safeParseInt(limit, 99999);

        let result;
        let searchKeyword = '';

        // 통합 검색 (모든 필드에서)
        if (keyword && keyword.trim()) {
            searchKeyword = keyword.trim();
            result = await this.inventoryManagementService.findAllInventories();
            // 클라이언트 사이드에서 필터링 (간단한 구현)
            if (result && result.length > 0) {
                result = result.filter(inventory => 
                    inventory.inventoryCode?.includes(searchKeyword) ||
                    inventory.inventoryName?.includes(searchKeyword) ||
                    inventory.inventoryType?.includes(searchKeyword) ||
                    inventory.inventoryLocation?.includes(searchKeyword) ||
                    inventory.inventoryStatus?.includes(searchKeyword)
                );
            }
        } 
        // 특정 필드 검색
        else if (inventoryCode && inventoryCode.trim()) {
            searchKeyword = inventoryCode.trim();
            result = await this.inventoryManagementService.findAllInventories();
            if (result && result.length > 0) {
                result = result.filter(inventory => 
                    inventory.inventoryCode?.includes(searchKeyword)
                );
            }
        } else if (inventoryName && inventoryName.trim()) {
            searchKeyword = inventoryName.trim();
            result = await this.inventoryManagementService.findAllInventories();
            if (result && result.length > 0) {
                result = result.filter(inventory => 
                    inventory.inventoryName?.includes(searchKeyword)
                );
            }
        } else if (inventoryType && inventoryType.trim()) {
            searchKeyword = inventoryType.trim();
            result = await this.inventoryManagementService.findAllInventories();
            if (result && result.length > 0) {
                result = result.filter(inventory => 
                    inventory.inventoryType?.includes(searchKeyword)
                );
            }
        } else if (inventoryLocation && inventoryLocation.trim()) {
            searchKeyword = inventoryLocation.trim();
            result = await this.inventoryManagementService.findAllInventories();
            if (result && result.length > 0) {
                result = result.filter(inventory => 
                    inventory.inventoryLocation?.includes(searchKeyword)
                );
            }
        } else if (inventoryStatus && inventoryStatus.trim()) {
            searchKeyword = inventoryStatus.trim();
            result = await this.inventoryManagementService.findAllInventories();
            if (result && result.length > 0) {
                result = result.filter(inventory => 
                    inventory.inventoryStatus?.includes(searchKeyword)
                );
            }
        } 
        // 전체 조회
        else {
            result = await this.inventoryManagementService.findAllInventories();
        }

        // 페이지네이션 적용
        if (result && result.length > 0) {
            const startIndex = (pageNum - 1) * limitNum;
            const endIndex = startIndex + limitNum;
            result = result.slice(startIndex, endIndex);
        }

        if (!result || result.length === 0) {
            await this.inventoryDownloadService.exportEmptyInventoryInfos(res, searchKeyword);
            return;
        }

        await this.inventoryDownloadService.exportInventoryInfos(result, res, searchKeyword);
    }
}
