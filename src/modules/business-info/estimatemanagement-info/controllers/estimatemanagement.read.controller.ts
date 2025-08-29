import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EstimateManagementReadService } from '../services/estimatemanagement-read.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('견적관리 조회')
@Controller('estimate-management')
@Auth()
@ApiBearerAuth()
export class EstimateManagementReadController {
  constructor(
    private readonly estimateManagementReadService: EstimateManagementReadService,
  ) {}

  @Get()
  @ApiOperation({ 
    summary: '견적 목록 조회', 
    description: '모든 견적 목록을 페이지네이션과 함께 조회합니다.' 
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
              estimateDate: '2025-08-25',
              customerName: '삼성전자',
              projectName: '스마트폰 개발',
              productName: '갤럭시 S25',
              estimateStatus: '견적중',
              estimatePrice: 50000000,
              estimateDetails: [
                {
                  id: 1,
                  detailCode: 'DET1001',
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Request() req,
  ): Promise<any> {
    try {
      const username = req.user?.username || 'unknown';
      const result = await this.estimateManagementReadService.getAllEstimates(
        page,
        limit,
        username,
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

  @Get(':id')
  @ApiOperation({ 
    summary: '견적 상세 조회', 
    description: 'ID로 견적을 조회합니다.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: '견적 ID',
    example: 1
  })
  @ApiResponse({ 
    status: 200, 
    description: '견적 조회 성공',
    schema: {
      example: {
        success: true,
        message: '견적을 성공적으로 조회했습니다.',
        data: {
          id: 1,
          estimateCode: 'EST20250825001',
          estimateDate: '2025-08-25',
          estimateVersion: 1,
          customerCode: 'CUST001',
          customerName: '삼성전자',
          projectCode: 'PROJ001',
          projectName: '스마트폰 개발',
          productCode: 'PROD001',
          productName: '갤럭시 S25',
          productQuantity: 1000,
          estimateStatus: '견적중',
          estimatePrice: 50000000,
          employeeCode: 'EMP001',
          employeeName: '김철수',
          estimateRemark: '긴급 견적',
          estimateDetails: [
            {
              id: 1,
              estimateId: 1,
              detailCode: 'DET1001',
              itemCode: 'ITEM001',
              itemName: 'CPU 프로세서',
              itemSpecification: 'Intel Core i7-12700K',
              unit: '개',
              quantity: 10.00,
              unitPrice: 150000.00,
              totalPrice: 1500000.00
            }
          ]
        },
        timestamp: '2025-08-25T01:52:59.940Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: '견적을 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: 'ID 1인 견적을 찾을 수 없습니다.',
        data: null,
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
  async getEstimateById(
    @Param('id') id: number,
    @Request() req,
  ): Promise<any> {
    try {
      const username = req.user?.username || 'unknown';
      const estimate = await this.estimateManagementReadService.getEstimateById(
        id,
        username,
      );
      
      return ApiResponseBuilder.success(
        estimate,
        '견적을 성공적으로 조회했습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || '견적 조회에 실패했습니다.',
      );
    }
  }
}
