import { Controller, Delete, Param, ParseIntPipe, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EstimateManagementDeleteService } from '../services/estimatemanagement-delete.service';
import { EstimateManagement } from '../entities/estimatemanagement.entity';
import { DevEstimateInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';
import { DeleteMultipleEstimatesDto, DeleteEstimateDetailsDto } from '../dto/delete-estimate.dto';

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
  async deleteEstimate(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: { username: string } }
  ) {
    try {
      const result = await this.estimateManagementDeleteService.deleteEstimate(id, req.user.username);
    
      return ApiResponseBuilder.success(result, '견적 삭제 성공');
    } catch (error) {
      throw error;
    }
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
    type: DeleteEstimateDetailsDto,
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
    @Body() body: DeleteEstimateDetailsDto,
    @Req() req: Request & { user: { username: string } }
  ) {
    try {
      const result = await this.estimateManagementDeleteService.deleteEstimateDetails(id, body.detailIds, req.user.username);
      return ApiResponseBuilder.success(result, '세부품목 삭제 성공');
    } catch (error) {
      throw error;
    }
  }

  @Delete('batch')
  @DevEstimateInfoAuth.delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '견적 일괄 삭제',
    description: '여러 견적을 일괄 삭제합니다.',
  })
  @ApiBody({
    type: DeleteMultipleEstimatesDto,
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
  async deleteMultipleEstimates(
    @Body() body: DeleteMultipleEstimatesDto, 
    @Req() req: Request & { user: { username: string } } 
  ) {
    try {
      const result = await this.estimateManagementDeleteService.deleteMultipleEstimates(body.ids, req.user.username);
      return ApiResponseBuilder.success(result, '견적 일괄 삭제 성공');
    } catch (error) {
      throw error;
    }
  }
}
