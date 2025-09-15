import { 
    Controller, 
    Get, 
    Param, 
    Query,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DeliveryReadService } from '../services/delivery-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';

@ApiTags('납품관리')
@Controller('delivery-info')
@DevAuth()
@ApiBearerAuth()
export class DeliveryReadController {
    constructor(
        private readonly deliveryReadService: DeliveryReadService
    ) {}

    @Get()
    @ApiOperation({ 
        summary: '납품 목록 조회',
        description: '납품 목록을 조회합니다. (페이징 및 다양한 검색 조건 지원)'
    })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수', example: 10 })
    @ApiQuery({ name: 'search', required: false, description: '전체 검색어 (납품코드, 거래처, 품목, 프로젝트)', example: 'DEL' })
    @ApiQuery({ name: 'customerName', required: false, description: '거래처명', example: '삼성전자' })
    @ApiQuery({ name: 'productName', required: false, description: '품목명', example: '스마트폰' })
    @ApiQuery({ name: 'projectName', required: false, description: '프로젝트명', example: '갤럭시 프로젝트' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)', example: '2025-01-31' })

    @ApiResponse({ 
        status: 200, 
        description: '납품 목록이 성공적으로 조회되었습니다.',
    })
    async getAllDeliveries(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('search') search?: string,
        @Query('customerName') customerName?: string,
        @Query('productName') productName?: string,
        @Query('projectName') projectName?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,

    ) {
        try {
            const searchParams = {
                search,
                
                customerName,

                productName,

                projectName,

                startDate,
                endDate,

            };
            
            const result = await this.deliveryReadService.getAllDeliveries(page, limit, searchParams);
            return ApiResponseBuilder.success(result, '납품 목록이 성공적으로 조회되었습니다.');
        } catch (error) {
            return ApiResponseBuilder.error(error.message, error.status || 500);
        }
    }
}
