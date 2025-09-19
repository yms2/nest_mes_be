import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from "@nestjs/swagger";
import { DevAuth } from "@/common/decorators/dev-auth.decorator";
import { QualityInspectionService } from "../services/quality-inspection.service";
import { CreateInspectionDto } from "../dto/create-inspection.dto";
import { UpdateInspectionDto } from "../dto/update-inspection.dto";

@DevAuth()
@ApiTags('품질검사관리')
@Controller('quality-inspection')
export class QualityInspectionController {
    constructor(
        private readonly inspectionService: QualityInspectionService,
    ) {}

    @Get('production-completions')
    @ApiOperation({ summary: '생산완료 내역 조회 (품질검사 대상)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 10)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드 (생산코드, 제품명)' })
    @ApiResponse({ status: 200, description: '생산완료 내역 조회 성공' })
    async getProductionCompletions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('keyword') keyword?: string,
        @Req() req?: Request & { user: { username: string } }
    ) {
        const username = req?.user?.username || 'unknown';
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        
        return await this.inspectionService.getProductionCompletions(
            pageNum, 
            limitNum, 
            username, 
            keyword
        );
    }

    @Post('create')
    @ApiOperation({ summary: '품질검사 등록' })
    @ApiBody({ type: CreateInspectionDto })
    @ApiResponse({ status: 201, description: '품질검사 등록 성공' })
    @ApiResponse({ status: 400, description: '품질검사 등록 실패' })
    async createInspection(
        @Body() createDto: CreateInspectionDto,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.inspectionService.createInspection(createDto, username);
    }

    @Get('list')
    @ApiOperation({ summary: '품질검사 목록 조회' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 10)' })
    @ApiQuery({ name: 'keyword', required: false, description: '검색 키워드' })
    @ApiQuery({ name: 'status', required: false, description: '검사 상태 (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)' })
    @ApiQuery({ name: 'result', required: false, description: '검사 결과 (PASS, FAIL)' })
    @ApiResponse({ status: 200, description: '품질검사 목록 조회 성공' })
    async getInspections(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('keyword') keyword?: string,
        @Query('status') status?: string,
        @Query('result') result?: string,
        @Req() req?: Request & { user: { username: string } }
    ) {
        const username = req?.user?.username || 'unknown';
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        
        return await this.inspectionService.getInspections(
            pageNum, 
            limitNum, 
            username, 
            keyword, 
            status, 
            result
        );
    }

    @Get('detail/:id')
    @ApiOperation({ summary: '품질검사 상세 조회' })
    @ApiParam({ name: 'id', description: '품질검사 ID' })
    @ApiResponse({ status: 200, description: '품질검사 상세 조회 성공' })
    @ApiResponse({ status: 404, description: '품질검사를 찾을 수 없습니다' })
    async getInspectionById(@Param('id') id: string) {
        return await this.inspectionService.getInspectionById(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: '품질검사 수정' })
    @ApiParam({ name: 'id', description: '품질검사 ID' })
    @ApiBody({ type: UpdateInspectionDto })
    @ApiResponse({ status: 200, description: '품질검사 수정 성공' })
    @ApiResponse({ status: 400, description: '품질검사 수정 실패' })
    async updateInspection(
        @Param('id') id: string,
        @Body() updateDto: UpdateInspectionDto,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.inspectionService.updateInspection(id, updateDto, username);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: '품질검사 삭제' })
    @ApiParam({ name: 'id', description: '품질검사 ID' })
    @ApiResponse({ status: 200, description: '품질검사 삭제 성공' })
    @ApiResponse({ status: 400, description: '품질검사 삭제 실패' })
    async deleteInspection(
        @Param('id') id: string,
        @Req() req: Request & { user: { username: string } }
    ) {
        const username = req.user?.username || 'unknown';
        return await this.inspectionService.deleteInspection(id, username);
    }
}
