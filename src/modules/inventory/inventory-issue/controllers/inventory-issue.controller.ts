import { Controller, Post, Get, Body, Query, Param, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { InventoryIssueService } from '../services/inventory-issue.service';
import { CreateInventoryIssueDto } from '../dto/create-inventory-issue.dto';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('불출 관리')
@Controller('inventory/issue')
@DevAuth()
export class InventoryIssueController {
    constructor(
        private readonly inventoryIssueService: InventoryIssueService,
    ) {}

    @Post()
    @ApiOperation({
        summary: '불출 정보 등록',
        description: '새로운 불출 정보를 등록합니다.'
    })
    @ApiBody({ type: CreateInventoryIssueDto })
    @ApiResponse({ status: 201, description: '불출 정보가 성공적으로 등록되었습니다.' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
    async createInventoryIssue(@Body(ValidationPipe) createInventoryIssueDto: CreateInventoryIssueDto) {
        return await this.inventoryIssueService.createInventoryIssue(createInventoryIssueDto, 'dev-user');
    }

    @Get('list')
    @ApiOperation({
        summary: '불출 내역 목록 조회',
        description: '등록된 불출 내역들의 목록을 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiQuery({ name: 'search', required: false, description: '통합 검색어 (품목명, 담당자명)' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명' })
    @ApiQuery({ name: 'employeeName', required: false, description: '담당자명' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명' })
    @ApiQuery({ name: 'warehouseName', required: false, description: '창고명' })
    @ApiQuery({ name: 'approvalStatus', required: false, description: '승인 상태 (대기, 승인, 반려)' })
    @ApiResponse({ status: 200, description: '불출 내역 목록을 성공적으로 조회했습니다.' })
    async getInventoryIssueList(@Query() searchParams: any) {
        const result = await this.inventoryIssueService.getInventoryIssueList(searchParams);
        
        return {
            success: true,
            message: '불출 내역 목록을 성공적으로 조회했습니다.',
            data: result,
            timestamp: new Date().toISOString()
        };
    }

    // 승인 API는 불필요하므로 제거 (불출 등록 시 바로 재고 차감)
    // @Post('approve/:issueCode')
    // @ApiOperation({
    //     summary: '불출 승인',
    //     description: '불출 정보를 승인하고 재고를 차감합니다.'
    // })
    // @ApiParam({ name: 'issueCode', description: '불출 코드' })
    // @ApiResponse({ status: 200, description: '불출이 성공적으로 승인되었습니다.' })
    // @ApiResponse({ status: 404, description: '불출 정보를 찾을 수 없습니다.' })
    // @ApiResponse({ status: 400, description: '이미 승인된 불출 정보입니다.' })
    // async approveInventoryIssue(@Param('issueCode') issueCode: string) {
    //     console.log(`[불출승인 컨트롤러] API 호출됨: issueCode=${issueCode}`);
    //     
    //     try {
    //         const result = await this.inventoryIssueService.approveInventoryIssue(issueCode, 'dev-user');
    //         console.log(`[불출승인 컨트롤러] 승인 완료:`, result);
    //         return result;
    //     } catch (error) {
    //         console.error(`[불출승인 컨트롤러] 승인 실패:`, error);
    //         throw error;
    //     }
    // }
}
