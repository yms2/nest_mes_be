import { Controller, Get, Query, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { ApiTags } from "@nestjs/swagger";
import { QualityCriteriaReadService } from "../services/quality-criteria-read.service";
import { ApiResponseBuilder } from "@/common/interfaces/api-response.interface";

@ApiTags('품질기준정보')
@Controller('quality-criteria')
@DevAuth()
@ApiBearerAuth()
export class CriteriaReadController {
    constructor(private readonly qualityCriteriaReadService: QualityCriteriaReadService) {}

    @Get()
    @ApiOperation({ summary: '품질기준정보 조회' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수', example: 10 })
    @ApiQuery({ name: 'search', type: String, required: false, description: '검색 키워드 (품질기준 코드, 품질기준 이름, 품질기준 타입, 품질기준 설명)', example: 'CRI001' })
    @ApiQuery({ name: 'criteriaName', type: String, required: false, description: '품질기준 이름 (포함 검색)', example: '품질기준 이름' })
    @ApiQuery({ name: 'criteriaType', type: String, required: false, description: '품질기준 타입 (포함 검색)', example: '품질기준 타입' })
    @ApiQuery({ name: 'criteriaDescription', type: String, required: false, description: '품질기준 설명 (포함 검색)', example: '품질기준 설명' })

    async getAllCriteria(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('criteriaName') criteriaName?: string,
        @Query('criteriaType') criteriaType?: string,
        @Query('criteriaDescription') criteriaDescription?: string,
    ) {
        const username = req.user?.username || 'unknown';
        const result = await this.qualityCriteriaReadService.getAllCriteria(
            page, 
            limit, 
            username, 
            search, 
            criteriaName, 
            criteriaType, 
            criteriaDescription,
        );
        return ApiResponseBuilder.success(
            result, 
            '품질기준정보 조회 성공',
        );
    } catch (error) {
        return ApiResponseBuilder.error(
            error.message || '품질기준정보 조회 실패',
        );
    }


}
