import { Controller, Post, Body, Request, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { EstimateManagementCreateService } from '../services/estimatemanagement-create.service';
import { CreateEstimateDto } from '../dto/estimatemanagement-create.dto';
import { CreateEstimateDetailDto } from '../dto/estimate-detail.dto';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { DevEstimateInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('견적관리')
@Controller('estimate-management')
@DevEstimateInfoAuth.create()
@ApiBearerAuth()
export class EstimateManagementCreateController {
  constructor(
    private readonly estimateManagementCreateService: EstimateManagementCreateService,
  ) {}

  @Post('with-details')
  @ApiOperation({ 
    summary: '견적과 세부품목 동시 등록', 
    description: '견적과 세부품목을 함께 등록합니다.' 
  })
  @ApiBody({ 
    description: '견적과 세부품목 등록 데이터',
    schema: {
      type: 'object',
      properties: {
        estimate: {
          type: 'object',
          description: '견적 정보',
          $ref: '#/components/schemas/CreateEstimateDto'
        },
        estimateDetails: {
          type: 'array',
          description: '세부품목 배열',
          items: {
            $ref: '#/components/schemas/CreateEstimateDetailDto'
          }
        }
      },
      required: ['estimate', 'estimateDetails']
    },
    examples: {
      example1: {
        summary: '견적과 세부품목 동시 등록',
        description: '견적 코드 자동 생성, 세부품목 코드 자동 생성',
        value: {
          estimate: {
            estimateDate: '2025-08-25',
            estimateVersion: 1,
            estimateName: '2025년 1분기 스마트폰 견적',
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
            estimateRemark: '긴급 견적'
          },
          estimateDetails: [
            {
              itemCode: 'ITEM001',
              itemName: 'CPU 프로세서',
              itemSpecification: 'Intel Core i7-12700K',
              unit: '개',
              quantity: 10.00,
              unitPrice: 150000.00,
              totalPrice: 1500000.00
            },
            {
              itemCode: 'ITEM002',
              itemName: '메모리',
              itemSpecification: 'DDR5 16GB',
              unit: '개',
              quantity: 20.00,
              unitPrice: 80000.00,
              totalPrice: 1600000.00
            },
            {
              itemCode: 'ITEM003',
              itemName: 'SSD',
              itemSpecification: '1TB NVMe',
              unit: '개',
              quantity: 5.00,
              unitPrice: 120000.00,
              totalPrice: 600000.00
            }
          ]
        }
      },
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '견적과 세부품목 등록 성공',
    schema: {
      example: {
        success: true,
        message: '견적과 세부품목이 성공적으로 등록되었습니다.',
        data: {
          id: 1,
          estimateCode: 'EST20250825001',
          estimateName: '2025년 1분기 스마트폰 견적',
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
          ordermanagementCode: '',
          termsOfPayment: '',
          estimateDetails: [
            {
              id: 1,
              estimateId: 1,
              detailCode: 'DET001',
              itemCode: 'ITEM001',
              itemName: 'CPU 프로세서',
              itemSpecification: 'Intel Core i7-12700K',
              unit: '개',
              quantity: 10.00,
              unitPrice: 150000.00,
              totalPrice: 1500000.00
            },
            {
              id: 2,
              estimateId: 1,
              detailCode: 'DET002',
              itemCode: 'ITEM002',
              itemName: '메모리',
              itemSpecification: 'DDR5 16GB',
              unit: '개',
              quantity: 20.00,
              unitPrice: 80000.00,
              totalPrice: 1600000.00
            }
          ]
        },
        timestamp: '2025-08-25T01:52:59.940Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청',
    schema: {
      example: {
        success: false,
        message: '세부품목 필수 필드가 누락되었습니다.',
        data: null,
        timestamp: '2025-08-25T01:52:59.940Z'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: '중복 견적',
    schema: {
      example: {
        success: false,
        message: '이미 존재하는 견적 코드입니다: EST20250825001',
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
  async createEstimateWithDetails(
    @Body() body: { estimate: CreateEstimateDto; estimateDetails: CreateEstimateDetailDto[] },
    @Request() req,
  ): Promise<any> {
    try {
      const username = req.user?.username || 'unknown';
      const { estimate, estimateDetails } = body;

      const result = await this.estimateManagementCreateService.createEstimateWithDetails(
        estimate,
        estimateDetails,
        username,
      );
      
      return ApiResponseBuilder.success(
        result,
        '견적과 세부품목이 성공적으로 등록되었습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || '견적과 세부품목 등록에 실패했습니다.',
      );
    }
  }

  @Post(':id/details')
  @ApiOperation({ 
    summary: '견적 ID로 세부품목 등록', 
    description: '기존 견적에 세부품목을 추가로 등록합니다.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: '견적 ID', 
    type: 'number',
    example: 1
  })
  @ApiBody({ 
    description: '세부품목 등록 데이터',
    schema: {
      type: 'object',
      properties: {
        estimateDetails: {
          type: 'array',
          description: '세부품목 배열',
          items: {
            $ref: '#/components/schemas/CreateEstimateDetailDto'
          }
        }
      },
      required: ['estimateDetails']
    },
    examples: {
      example1: {
        summary: '세부품목 등록',
        description: '견적 ID 1에 세부품목 추가 등록',
        value: {
          estimateDetails: [
            {
              itemCode: 'ITEM004',
              itemName: '그래픽카드',
              itemSpecification: 'RTX 4080',
              unit: '개',
              quantity: 2.00,
              unitPrice: 800000.00,
              totalPrice: 1600000.00
            },
            {
              itemCode: 'ITEM005',
              itemName: '파워서플라이',
              itemSpecification: '850W 80+ Gold',
              unit: '개',
              quantity: 1.00,
              unitPrice: 150000.00,
              totalPrice: 150000.00
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '세부품목 등록 성공',
    schema: {
      example: {
        success: true,
        message: '세부품목이 성공적으로 등록되었습니다.',
        data: [
          {
            id: 3,
            estimateId: 1,
            detailCode: 'DET003',
            itemCode: 'ITEM004',
            itemName: '그래픽카드',
            itemSpecification: 'RTX 4080',
            unit: '개',
            quantity: 2.00,
            unitPrice: 800000.00,
            totalPrice: 1600000.00
          },
          {
            id: 4,
            estimateId: 1,
            detailCode: 'DET004',
            itemCode: 'ITEM005',
            itemName: '파워서플라이',
            itemSpecification: '850W 80+ Gold',
            unit: '개',
            quantity: 1.00,
            unitPrice: 150000.00,
            totalPrice: 150000.00
          }
        ],
        timestamp: '2025-08-25T01:52:59.940Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청',
    schema: {
      example: {
        success: false,
        message: '견적 ID 999가 존재하지 않습니다.',
        data: null,
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
        message: '견적을 찾을 수 없습니다.',
        data: null,
        timestamp: '2025-08-25T01:52:59.940Z'
      }
    }
  })
  async createEstimateDetails(
    @Param('id') id: number,
    @Body() body: { estimateDetails: CreateEstimateDetailDto[] },
    @Request() req,
  ): Promise<any> {
    try {
      const username = req.user?.username || 'unknown';
      const { estimateDetails } = body;

      const result = await this.estimateManagementCreateService.createEstimateDetails(
        id,
        estimateDetails,
        username,
      );
      
      return ApiResponseBuilder.success(
        result,
        '세부품목이 성공적으로 등록되었습니다.',
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || '세부품목 등록에 실패했습니다.',
      );
    }
  }

}
