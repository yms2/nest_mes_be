import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { QualityInspectionDownloadService } from "../services/quality-inspection-download.service";
import { QualityInspectionService } from "../services/quality-inspection.service";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

@DevAuth()
@ApiTags('품질검사 엑셀')
@Controller('quality-inspection')
export class QualityInspectionDownloadController {
    constructor(
        private readonly downloadService: QualityInspectionDownloadService,
        private readonly inspectionService: QualityInspectionService,
    ) {}

    @Get('excel/download-excel')
    @ApiOperation({ summary: '품질검사 엑셀 다운로드' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (검사코드, 생산코드, 제품명)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'status', required: false, description: '검사 상태 (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)' })
    @ApiQuery({ name: 'result', required: false, description: '검사 결과 (PASS, FAIL)' })
    async downloadExcel(
        @Res() res: Response, 
        @Query() query: any
    ) {
        try {
            const { 
                keyword, 
                page, 
                limit, 
                status,
                result
            } = query;
            
            let result_data: any;
            let searchKeyword: string | undefined;
            
            // 페이지네이션 파라미터 처리
            const pageNum = this.safeParseInt(page, 1);
            const limitNum = this.safeParseInt(limit, 99999);

            //검색 조건에 따른 데이터 조회
            if (keyword && keyword.trim()) {
                searchKeyword = keyword.trim();
                result_data = await this.inspectionService.getInspections(
                    pageNum, limitNum, 'system', searchKeyword, status, result
                );
            } else {
                result_data = await this.inspectionService.getInspections(
                    pageNum, limitNum, 'system', '', status, result
                );
            }

            // 데이터가 있으면 있는 것만 다운로드
            if (result_data.success && result_data.data && result_data.data.inspections) {
                await this.downloadService.exportQualityInspections(
                    result_data.data.inspections, 
                    res, 
                    searchKeyword
                );
            } else {
                // 데이터가 없으면 빈 엑셀 파일 생성
                await this.downloadService.exportEmptyQualityInspections(res, searchKeyword);
            }
        } catch (error) {
            // 오류 발생 시 빈 엑셀 파일 생성
            await this.downloadService.exportEmptyQualityInspections(res, '오류 발생');
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
