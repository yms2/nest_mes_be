import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { Controller, Get, Query, Res } from "@nestjs/common";
import { QualityCriteriaDownloadService } from "../services/quality-criteria-download.service";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { QualityCriteriaReadService } from "../services";
import { ApiResponseBuilder } from "@/common/interfaces/api-response.interface";
import { Response } from "express";

@DevAuth()
@ApiTags('품질기준정보 엑셀')
@Controller('quality-criteria')
export class CriteriaDownloadController {

    constructor(
        private readonly qualityCriteriaDownloadService: QualityCriteriaDownloadService,
        private readonly qualityCriteriaReadService: QualityCriteriaReadService,
    ){}

    @Get('excel/download-excel')
    @ApiOperation({ summary: '품질기준정보 엑셀 다운로드' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (품질기준 코드, 품질기준 이름, 품질기준 타입, 품질기준 설명)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 99999)' })
    @ApiQuery({ name: 'criteriaName', required: false, description: '품질기준 이름 (포함 검색)' })
    @ApiQuery({ name: 'criteriaType', required: false, description: '품질기준 타입 (포함 검색)' })
    @ApiQuery({ name: 'criteriaDescription', required: false, description: '품질기준 설명 (포함 검색)' })
    async downloadExcel(@Res() res: Response, @Query() query: any) {
        try {
        const { 
            keyword, 
            page, 
            limit, 
            criteriaName,
            criteriaType, 
            criteriaDescription 
        } = query;
        
        let result: any;
        let searchKeyword: string | undefined;
        
            // 페이지네이션 파라미터 처리
            const pageNum = this.safeParseInt(page, 1);
            const limitNum = this.safeParseInt(limit, 99999);


        //검색 조건에 따른 데이터 조회
        if (keyword && keyword.trim()) {
            searchKeyword = keyword.trim();
            result = await this.qualityCriteriaReadService.getAllCriteria(
                pageNum, limitNum, 'system', searchKeyword, criteriaName, criteriaType, criteriaDescription
            );
        } else if (criteriaName && criteriaName.trim()) {
            searchKeyword = `품질기준 이름: ${criteriaName.trim()}`;
            result = await this.qualityCriteriaReadService.getAllCriteria(
                pageNum, limitNum, 'system', '', criteriaName.trim(), criteriaType, criteriaDescription
            );
        } else if (criteriaType && criteriaType.trim()) {
            searchKeyword = `품질기준 타입: ${criteriaType.trim()}`;
            result = await this.qualityCriteriaReadService.getAllCriteria(
                pageNum, limitNum, 'system', '', criteriaName, criteriaType.trim(), criteriaDescription
            );
        } else {
            result = await this.qualityCriteriaReadService.getAllCriteria(pageNum, limitNum, 'system', '', criteriaName, criteriaType, criteriaDescription);
        }
            // 데이터가 있으면 있는 것만 다운로드
            await this.qualityCriteriaDownloadService.exportQualityCriteria(result.qualityCriteria, res, searchKeyword);
        } catch (error) {
            // 오류 발생 시 빈 엑셀 파일 생성
            await this.qualityCriteriaDownloadService.exportEmptyQualityCriteria(res, '오류 발생');
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