import { Controller, Put, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EstimateManagementUpdateService } from '../services/estimatemanagement-update.service';
import { UpdateEstimateDto } from '../dto/estimatemanagement-create.dto';
import { CreateEstimateDetailDto } from '../dto/estimate-detail.dto';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';

@ApiTags('견적관리')
@Controller('estimate-management')
export class EstimateManagementUpdateController {
  constructor(
    private readonly estimateManagementUpdateService: EstimateManagementUpdateService,
  ) {}

  @Put(':id')
  @DevAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '견적 통합 수정',
    description: '견적 정보, 상태, 세부품목을 한 번에 수정합니다.',
  })
  @ApiParam({ name: 'id', description: '견적 ID', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        estimateInfo: {
          type: 'object',
          description: '견적 정보 수정 데이터',
          properties: {
            estimateCode: { type: 'string', example: 'EST20250825001' },
            estimateName: { type: 'string', example: '2025년 1분기 스마트폰 견적' },
            estimateDate: { type: 'string', format: 'date', example: '2025-08-25' },
            estimateVersion: { type: 'number', example: 2 },
            customerCode: { type: 'string', example: 'CUST001' },
            customerName: { type: 'string', example: '삼성전자' },
            projectCode: { type: 'string', example: 'PROJ001' },
            projectName: { type: 'string', example: '스마트폰 개발' },
            productCode: { type: 'string', example: 'PROD001' },
            productName: { type: 'string', example: '갤럭시 S25' },
            productQuantity: { type: 'number', example: 1000 },
            estimateStatus: { 
              type: 'string', 
              enum: ['견적중', '견적완료', '승인대기', '승인완료', '거절'],
              example: '견적완료'
            },
            estimatePrice: { type: 'number', example: 50000000 },
            employeeCode: { type: 'string', example: 'EMP001' },
            employeeName: { type: 'string', example: '김철수' },
            estimateRemark: { type: 'string', example: '긴급 견적' },
            ordermanagementCode: { type: 'string', example: 'ORD001' },
            termsOfPayment: { type: 'string', example: '30일 후 결제' }
          }
        },
        status: {
          type: 'string',
          enum: ['견적중', '견적완료', '승인대기', '승인완료', '거절'],
          description: '견적 상태',
          example: '견적완료',
        },
        details: {
          type: 'array',
          description: '견적 세부품목 수정 데이터',
          items: {
            type: 'object',
            properties: {
              estimateId: { type: 'number', example: 1 },
              detailCode: { type: 'string', example: 'DET001' },
              itemCode: { type: 'string', example: 'ITEM001' },
              itemName: { type: 'string', example: 'CPU 프로세서' },
              itemSpecification: { type: 'string', example: 'Intel Core i7-12700K' },
              unit: { type: 'string', example: '개' },
              quantity: { type: 'number', example: 10.5 },
              unitPrice: { type: 'number', example: 150000 },
              totalPrice: { type: 'number', example: 1500000 }
            }
          }
        },
        recalculatePrice: {
          type: 'boolean',
          description: '가격 재계산 여부',
          example: true,
        },
      },
    },
    description: '견적 통합 수정 정보',
    examples: {
      example1: {
        summary: '견적 정보, 상태, 세부품목 모두 수정',
        value: {
          estimateInfo: {
            estimateName: '2025년 1분기 스마트폰 견적 (수정)',
            estimateStatus: '견적완료',
            estimateRemark: '수정된 견적',
          },
          status: '승인대기',
          details: [
            {
              itemCode: 'ITEM001',
              itemName: '부품 A',
              quantity: 100,
              unitPrice: 50000,
              totalPrice: 5000000,
            },
          ],
          recalculatePrice: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '견적 통합 수정 성공',
    type: EstimateManagement,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 404,
    description: '견적을 찾을 수 없음',
  })
  @ApiResponse({
    status: 409,
    description: '견적 코드 중복',
  })
  async updateEstimateComprehensive(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: {
      estimateInfo?: UpdateEstimateDto;
      status?: string;
      details?: CreateEstimateDetailDto[];
      recalculatePrice?: boolean;
    },
  ): Promise<EstimateManagement> {
    // TODO: 실제 사용자명을 가져오는 로직 필요
    const username = 'system';
    return await this.estimateManagementUpdateService.updateEstimateComprehensive(id, updateData, username);
  }
}
