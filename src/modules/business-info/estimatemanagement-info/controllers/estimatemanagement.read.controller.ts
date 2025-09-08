import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EstimateManagementReadService } from '../services/estimatemanagement-read.service';
import { DevEstimateInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('견적관리')
@Controller('estimate-management')
@DevEstimateInfoAuth.read()
@ApiBearerAuth()
export class EstimateManagementReadController {
  constructor(
    private readonly estimateManagementReadService: EstimateManagementReadService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: '견적 목록 조회 (검색 기능 포함)', 
    description: '모든 견적 목록을 페이지네이션과 검색 기능과 함께 조회합니다.' 
  })
  @ApiQuery({ 
    name: 'page',  
    required: false, 
    description: '페이지 번호',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: '페이지당 항목 수',
    example: 10
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: '검색 키워드 (견적코드, 견적명, 고객명, 프로젝트명, 제품명)',
    example: '삼성전자'
  })
  @ApiQuery({ 
    name: 'startDate', 
    required: false, 
    description: '견적일 시작일 (YYYY-MM-DD)',
    example: '2025-01-01'
  })
  @ApiQuery({ 
    name: 'endDate', 
    required: false, 
    description: '견적일 종료일 (YYYY-MM-DD)',
    example: '2025-01-31'
  })
  @ApiResponse({ 
    status: 200, 
    description: '견적 목록 조회 성공',
    schema: {
      example: {
        success: true,
        message: '견적 목록을 성공적으로 조회했습니다.',
        data: {
          estimates: [
            {
              id: 1,
              estimateCode: 'EST20250825001',
              estimateName: '2025년 1분기 스마트폰 견적',
              estimateDate: '2025-08-25',
              customerName: '삼성전자',
              projectName: '스마트폰 개발',
              productName: '갤럭시 S25',
              estimateStatus: '견적중',
              estimatePrice: 50000000,
              estimateDetails: [
                {
                  id: 1,
                  detailCode: 'DET001',
                  itemName: 'CPU 프로세서',
                  quantity: 10.00,
                  totalPrice: 1500000.00
                }
              ]
            }
          ],
          total: 1,
          page: 1,
          limit: 10
        },
        timestamp: '2025-08-25T01:52:59.940Z'
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
        timestamp: '2025-08-25T01:52:59.940Z'
      }
    }
  })
  async getAllEstimates(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<any> {
    try {
      const username = req.user?.username || 'unknown';
      const result = await this.estimateManagementReadService.getAllEstimates(
        page,
        limit,
        username,
        search,
        startDate,
        endDate,
      );
      
      return ApiResponseBuilder.success(
        result,
        '견적 목록을 성공적으로 조회했습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || '견적 목록 조회에 실패했습니다.',
      );
    }
  }

  @Get('recent')
  @ApiOperation({ 
    summary: '최근 30일 내 견적 목록 조회',
    description: '최근 30일 내 견적 목록을 조회합니다.' 
  })
  async getRecentEstimates(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<any> {
    const username = req.user?.username || 'unknown';
    return await this.estimateManagementReadService.getRecentEstimates(page, limit, username);
  }

  @Get('expired')
  @ApiOperation({ 
    summary: '30일 경과 견적 목록 조회',
    description: '30일 경과 견적 목록을 조회합니다.' 
  })
  async getExpiredEstimates(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<any> {
    const username = req.user?.username || 'unknown';
    return await this.estimateManagementReadService.getExpiredEstimates(page, limit, username);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '견적 상세 조회',
    description: '견적 상세 정보를 조회합니다.' 
  })
  async getEstimateById(@Request() req, @Param('id') id: number): Promise<any> {
    const username = req.user?.username || 'unknown';
    return await this.estimateManagementReadService.getEstimateById(id, username);
  }
}
