import { Controller, Delete, Param, ParseIntPipe, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EstimateManagementDeleteService } from '../services/estimatemanagement-delete.service';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { DevEstimateInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('견적관리')
@Controller('estimate-management')
export class EstimateManagementDeleteController {
  constructor(
    private readonly estimateManagementDeleteService: EstimateManagementDeleteService,
  ) {}

  @Delete(':id')
  @DevEstimateInfoAuth.delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '견적 삭제',
    description: '견적을 완전히 삭제합니다 (세부품목 포함).',
  })
  @ApiParam({ name: 'id', description: '견적 ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '견적 삭제 성공',
    type: EstimateManagement,
  })
  @ApiResponse({
    status: 400,
    description: '승인완료된 견적은 삭제할 수 없음',
  })
  @ApiResponse({
    status: 404,
    description: '견적을 찾을 수 없음',
  })
  async deleteEstimate(@Param('id', ParseIntPipe) id: number): Promise<EstimateManagement> {
    // TODO: 실제 사용자명을 가져오는 로직 필요
    const username = 'system';
    return await this.estimateManagementDeleteService.deleteEstimate(id, username);
  }

  @Delete(':id/details')
  @DevEstimateInfoAuth.delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '견적 세부품목 삭제',
    description: '견적의 특정 세부품목들을 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: '견적 ID', type: Number })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        detailIds: {
          type: 'array',
          items: { type: 'number' },
          description: '삭제할 세부품목 ID 배열',
          example: [1, 2, 3],
        },
      },
    },
    description: '삭제할 세부품목 정보',
    examples: {
      example1: {
        summary: '세부품목 삭제',
        value: {
          detailIds: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '세부품목 삭제 성공',
    type: EstimateManagement,
  })
  @ApiResponse({
    status: 400,
    description: '승인완료된 견적의 세부품목은 삭제할 수 없음',
  })
  @ApiResponse({
    status: 404,
    description: '견적 또는 세부품목을 찾을 수 없음',
  })
  async deleteEstimateDetails(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { detailIds: number[] },
  ): Promise<EstimateManagement> {
    // TODO: 실제 사용자명을 가져오는 로직 필요
    const username = 'system';
    return await this.estimateManagementDeleteService.deleteEstimateDetails(id, body.detailIds, username);
  }

  @Delete('batch')
  @DevEstimateInfoAuth.delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '견적 일괄 삭제',
    description: '여러 견적을 일괄 삭제합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          description: '삭제할 견적 ID 배열',
          example: [1, 2, 3],
        },
      },
    },
    description: '삭제할 견적 정보',
    examples: {
      example1: {
        summary: '견적 일괄 삭제',
        value: {
          ids: [1, 2, 3],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '견적 일괄 삭제 성공',
    type: [EstimateManagement],
  })
  @ApiResponse({
    status: 400,
    description: '일부 견적이 삭제할 수 없는 상태',
  })
  async deleteMultipleEstimates(@Body() body: { ids: number[] }): Promise<EstimateManagement[]> {
    // TODO: 실제 사용자명을 가져오는 로직 필요
    const username = 'system';
    return await this.estimateManagementDeleteService.deleteMultipleEstimates(body.ids, username);
  }
}
