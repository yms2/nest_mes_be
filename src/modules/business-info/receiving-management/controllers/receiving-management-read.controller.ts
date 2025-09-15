import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ReceivingManagementReadService } from '../services/receiving-management-read.service';

@ApiTags('입고관리 - 발주품목 조회')
@Controller('receiving-management')
export class ReceivingManagementReadController {
    constructor(
        private readonly receivingManagementReadService: ReceivingManagementReadService,
    ) {}

    /**
     * 승인된 발주품목 목록 조회
     */
    @Get('approved-order-items')
    @ApiOperation({
        summary: '승인된 발주품목 목록 조회',
        description: '입고를 위해 승인된 발주품목들의 목록을 조회합니다.'
    })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수 (기본값: 10)' })
    @ApiQuery({ name: 'search', required: false, description: '검색어 (발주코드, 거래처명, 품목명)' })
    @ApiQuery({ name: 'productCode', required: false, description: '품목 코드' })
    @ApiQuery({ name: 'customerCode', required: false, description: '거래처 코드' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
    async getApprovedOrderItems(@Query() searchParams: any) {
        const result = await this.receivingManagementReadService.getApprovedOrderItems(searchParams);
        
        return {
            success: true,
            message: '승인된 발주품목 목록을 성공적으로 조회했습니다.',
            data: result,
            timestamp: new Date().toISOString()
        };
    }

}
