import { Controller, Get, Post, Put, Delete, Query, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { ProductCostKpiService, ProductCostData } from '../services/product-cost-kpi.service';
import { 
    ProductCostKpiQueryDto, 
    ProductCostKpiResponseDto, 
    ProductCostKpiDetailResponseDto, 
    ProductCostSavingSummaryDto,
    ProductCostInputDto,
    ProductCostDetailDto
} from '../dto/product-cost-kpi.dto';

@ApiTags('KPI - 제품원가')
@Controller('kpi/product-cost')
@DevAuth()
export class ProductCostKpiController {
    constructor(
        private readonly productCostKpiService: ProductCostKpiService,
    ) {}

    @Get()
    @ApiOperation({ 
        summary: '제품원가 KPI 조회',
        description: '제품원가 계산 및 절감 효과를 조회합니다. 원재료 단가, 외주/내재화 단가, 월 작업 수량을 기준으로 계산됩니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '제품원가 KPI 조회 성공',
        type: [ProductCostKpiResponseDto]
    })
    async getProductCostKpi(@Query() queryDto: ProductCostKpiQueryDto): Promise<ProductCostKpiResponseDto[]> {
        return await this.productCostKpiService.getProductCostKpi(queryDto);
    }

    @Get('detail')
    @ApiOperation({ 
        summary: '제품원가 KPI 상세 조회',
        description: '제품원가 KPI와 함께 상세 정보를 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '제품원가 KPI 상세 조회 성공',
        type: [ProductCostKpiDetailResponseDto]
    })
    async getProductCostKpiDetail(@Query() queryDto: ProductCostKpiQueryDto): Promise<ProductCostKpiDetailResponseDto[]> {
        return await this.productCostKpiService.getProductCostKpiDetail(queryDto);
    }

    @Get('summary')
    @ApiOperation({ 
        summary: '제품원가 절감 효과 요약 조회',
        description: '전체 제품원가 절감 효과 통계를 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '제품원가 절감 효과 요약 조회 성공',
        type: ProductCostSavingSummaryDto
    })
    async getProductCostSavingSummary(@Query() queryDto: ProductCostKpiQueryDto): Promise<ProductCostSavingSummaryDto> {
        return await this.productCostKpiService.getProductCostSavingSummary(queryDto);
    }

    @Get('list')
    @ApiOperation({ 
        summary: '제품원가 정보 목록 조회',
        description: '제품원가 기본 정보 목록을 조회합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '제품원가 정보 목록 조회 성공',
        type: [ProductCostDetailDto]
    })
    async getProductCostList(@Query() queryDto: ProductCostKpiQueryDto): Promise<ProductCostDetailDto[]> {
        return await this.productCostKpiService.getProductCostList(queryDto);
    }

    @Post()
    @ApiOperation({ 
        summary: '제품원가 정보 입력',
        description: '새로운 제품원가 정보를 입력합니다.'
    })
    @ApiResponse({ 
        status: 201, 
        description: '제품원가 정보 입력 성공'
    })
    async createProductCost(@Body() inputDto: ProductCostInputDto): Promise<ProductCostData> {
        return await this.productCostKpiService.createProductCost(inputDto);
    }

    @Put(':id')
    @ApiOperation({ 
        summary: '제품원가 정보 수정',
        description: '기존 제품원가 정보를 수정합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '제품원가 정보 수정 성공'
    })
    async updateProductCost(
        @Param('id', ParseIntPipe) id: number,
        @Body() inputDto: ProductCostInputDto
    ): Promise<ProductCostData> {
        return await this.productCostKpiService.updateProductCost(id, inputDto);
    }

    @Delete(':id')
    @ApiOperation({ 
        summary: '제품원가 정보 삭제',
        description: '제품원가 정보를 삭제합니다.'
    })
    @ApiResponse({ 
        status: 200, 
        description: '제품원가 정보 삭제 성공'
    })
    async deleteProductCost(@Param('id', ParseIntPipe) id: number): Promise<boolean> {
        return await this.productCostKpiService.deleteProductCost(id);
    }
}
