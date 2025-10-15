import { Controller, Get, Query, Request, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { OrderManagementReadService } from '../services/ordermanagement-read.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('수주관리')
@Controller('order-management')
@DevAuth()
@ApiBearerAuth()
export class OrderManagementReadController {
    constructor(private readonly orderManagementReadService: OrderManagementReadService        
    ) {}

    @Get()
    @ApiOperation({ 
        summary: '수주 목록 조회',
        description: '수주 목록을 조회합니다.' 
    })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수', example: 10 })
    @ApiQuery({ name: 'search', type: String, required: false, description: '검색 키워드 (수주코드, 고객명, 프로젝트명, 제품명, 수주유형)', example: '삼성전자' })
    @ApiQuery({ name: 'startDate', type: String, required: false, description: '수주일 시작일 (YYYY-MM-DD)', example: '2025-01-01' })
    @ApiQuery({ name: 'endDate', type: String, required: false, description: '수주일 종료일 (YYYY-MM-DD)', example: '2025-01-31' })
    @ApiQuery({ name: 'customerName', type: String, required: false, description: '고객명 (포함 검색)', example: '삼성전자' })
    @ApiQuery({ name: 'projectName', type: String, required: false, description: '프로젝트명 (포함 검색)', example: '스마트폰 개발' })
    @ApiQuery({ name: 'productName', type: String, required: false, description: '제품명 (포함 검색)', example: '갤럭시 S25' })
    @ApiQuery({ name: 'orderType', type: String, required: false, description: '수주유형 (포함 검색)', example: '신규' })
    async getAllOrderManagement(
        @Request() req, 
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 10, 
        @Query('search') search?: string, 
        @Query('startDate') startDate?: string, 
        @Query('endDate') endDate?: string,
        @Query('customerName') customerName?: string,
        @Query('projectName') projectName?: string,
        @Query('productName') productName?: string,
        @Query('orderType') orderType?: string
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.orderManagementReadService.getAllOrderManagement(
                page,
                limit,
                username,
                search,
                startDate,
                endDate,
                customerName,
                projectName,
                productName,
                orderType,
            );

            return ApiResponseBuilder.success(
                result,
                '수주 목록을 성공적으로 조회했습니다.',
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '수주 목록 조회에 실패했습니다.',
            );
        }
    }

    @Get('active')
    @ApiOperation({ 
        summary: '활성 수주 목록 조회',
        description: '출하가 되거나 생산계획이 내려진 수주를 제외한 활성 수주 목록을 조회합니다.' 
    })
    @ApiQuery({ name: 'page', type: Number, required: false, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', type: Number, required: false, description: '페이지당 항목 수', example: 10 })
    @ApiQuery({ name: 'search', type: String, required: false, description: '검색 키워드 (수주코드, 고객명, 프로젝트명, 제품명, 수주유형)' })
    @ApiQuery({ name: 'startDate', type: String, required: false, description: '수주일 시작일 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', type: String, required: false, description: '수주일 종료일 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'customerName', type: String, required: false, description: '고객명 (포함 검색)' })
    @ApiQuery({ name: 'projectName', type: String, required: false, description: '프로젝트명 (포함 검색)' })
    @ApiQuery({ name: 'productName', type: String, required: false, description: '제품명 (포함 검색)' })
    @ApiQuery({ name: 'orderType', type: String, required: false, description: '수주유형 (포함 검색)' })
    @ApiResponse({ 
        status: 200, 
        description: '활성 수주 목록 조회 성공',
        schema: {
            example: {
                success: true,
                message: '활성 수주 목록을 성공적으로 조회했습니다.',
                data: {
                    orderManagement: [
                        {
                            id: 1,
                            orderCode: 'ORD001',
                            customerName: '삼성전자',
                            projectName: '스마트폰 개발',
                            productName: '갤럭시 S25',
                            orderType: '신규',
                            quantity: 100,
                            orderDate: '2025-01-01',
                            deliveryDate: '2025-01-15'
                        }
                    ],
                    total: 1,
                    page: 1,
                    limit: 10
                },
                timestamp: '2025-01-15T10:30:00Z'
            }
        }
    })
    async getActiveOrderManagement(
        @Request() req, 
        @Query('page') page: number = 1, 
        @Query('limit') limit: number = 10, 
        @Query('search') search?: string, 
        @Query('startDate') startDate?: string, 
        @Query('endDate') endDate?: string,
        @Query('customerName') customerName?: string,
        @Query('projectName') projectName?: string,
        @Query('productName') productName?: string,
        @Query('orderType') orderType?: string
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.orderManagementReadService.getActiveOrderManagement(
                page,
                limit,
                username,
                search,
                startDate,
                endDate,
                customerName,
                projectName,
                productName,
                orderType,
            );

            return ApiResponseBuilder.success(
                result,
                '활성 수주 목록을 성공적으로 조회했습니다.',
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '활성 수주 목록 조회에 실패했습니다.',
            );
        }
    }

    @Get(':id')
    @ApiOperation({ 
        summary: '수주 상세 조회',
        description: 'ID를 통해 수주 상세 정보를 조회합니다.' 
    })
    @ApiParam({ 
        name: 'id', 
        description: '조회할 수주의 ID', 
        example: 1,
        type: Number
    })
    @ApiResponse({ 
        status: 200, 
        description: '수주 상세 조회 성공',
        schema: {
            example: {
                success: true,
                message: '수주 상세 정보를 성공적으로 조회했습니다.',
                data: {
                    id: 1,
                    orderCode: 'ORD001',
                    customerCode: 'CUS001',
                    customerName: '삼성전자',
                    projectCode: 'PRJ001',
                    projectName: '스마트폰 개발',
                    productCode: 'PRD001',
                    productName: '갤럭시 S25',
                    orderType: '신규',
                    quantity: 100,
                    unitPrice: '1000',
                    supplyPrice: '100000',
                    vat: '10000',
                    total: '110000',
                    orderDate: '2025-01-01',
                    deliveryDate: '2025-01-15',
                    estimateCode: 'EST001',
                    remark: '긴급 주문',
                    createdBy: 'admin',
                    updatedBy: 'admin',
                    createdAt: '2025-01-01T00:00:00Z',
                    updatedAt: '2025-01-01T00:00:00Z'
                },
                timestamp: '2025-01-15T10:30:00Z'
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: '수주를 찾을 수 없음',
        schema: {
            example: {
                success: false,
                message: 'ID 1인 수주를 찾을 수 없습니다.',
                data: null,
                timestamp: '2025-01-15T10:30:00Z'
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: '인증 실패',
        schema: {
            example: {
                success: false,
                message: 'Unauthorized',
                data: null,
                timestamp: '2025-01-15T10:30:00Z'
            }
        }
    })
    async getOrderManagementById(
        @Request() req,
        @Param('id') id: string
    ): Promise<any> {
        try {
            const username = req.user?.username || 'unknown';
            const result = await this.orderManagementReadService.getOrderManagementById(id, username);

            return ApiResponseBuilder.success(
                result,
                '수주 상세 정보를 성공적으로 조회했습니다.',
            );
        } catch (error) {
            return ApiResponseBuilder.error(
                error.message || '수주 상세 조회에 실패했습니다.',
            );
        }
    }
}

    