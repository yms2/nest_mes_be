import { Controller, Get, Query, Request, Param } from '@nestjs/common';
import { ShippingReadService } from '../services/shipping-read.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';


@ApiTags('출하관리')
@Controller('shipping-info')
@DevAuth()
@ApiBearerAuth()
export class ShippingReadController {
    constructor(private readonly shippingReadService: ShippingReadService) {}

    @Get()
    @ApiOperation({ summary: '출하 목록 조회', description: '출하 목록을 조회합니다.' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수', example: 10 })
    @ApiQuery({ name: 'search', type: String, required: false, description: '검색 키워드 (출하코드, 출하일, 수주코드, 출하 지시 수량, 상태, 공급가액, 부가세, 합계, 사원코드, 사원명, 비고)', example: 'SHP001' })
    @ApiQuery({ name: 'startDate', type: String, required: false, description: '출하일 시작일 (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', type: String, required: false, description: '출하일 종료일 (YYYY-MM-DD)', example: '2025-01-31' })
    async getAllShipping(
        @Request() req,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('search') search?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ): Promise<any> {
        try {
        const username = req.user?.username || 'unknown';
        const result = await this.shippingReadService.getAllShipping(
            page,
            limit,
            username,
            search,
            startDate,
            endDate,
        );
        return ApiResponseBuilder.success(
            result, 
            '출하 목록을 성공적으로 조회했습니다.',
        );
    } catch (error) {
        return ApiResponseBuilder.error(
            error.message || '출하 목록 조회에 실패했습니다.',
            );  
        }
    }
    
    @Get('status/:status')
    @ApiOperation({ summary: '출하 상태별 조회', description: '특정 상태의 출하 목록을 조회합니다.' })
    @ApiParam({ name: 'status', type: String, required: true, description: '출하 상태 (지시대기, 지시완료)', example: '지시완료' })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수', example: 10 })
    async getShippingByStatus(
        @Request() req,
        @Param('status') status: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.shippingReadService.getShippingByStatus(status, page, limit, username);
            return ApiResponseBuilder.success(
                result,
                `${status} 상태의 출하 목록을 성공적으로 조회했습니다.`,
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '출하 상태별 조회에 실패했습니다.',
            );
        }
    }

    @Get(':id')
    @ApiOperation({ summary: '출하 상세 조회', description: '출하 상세 정보를 조회합니다.' })
    @ApiParam({ name: 'id', type: Number, required: true, description: '조회할 출하의 ID', example: 1 })
    async getShippingById(
        @Request() req,
        @Param('id') id: number
    ): Promise<any> {
        try {
        const username = req.user?.username || 'unknown';
        const result = await this.shippingReadService.getShippingById(id, username);
        return ApiResponseBuilder.success(
            result,
            '출하 상세 정보를 성공적으로 조회했습니다.',
        );
    } catch (error) {
        return ApiResponseBuilder.error(
            error.message || '출하 상세 조회에 실패했습니다.',
            );
        }
    }
}
