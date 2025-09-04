import { Controller, Delete, Param, Body, Request, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BomInfoDeleteService } from '../services/bom-info-delete.service';
import { ApiResponse as CustomApiResponse, ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { DevBomInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('BOM 등록/수정/삭제')
@Controller('bom-info')
export class BomInfoDeleteController {
  constructor(private readonly bomInfoDeleteService: BomInfoDeleteService) {}

  @Delete(':id')
  @DevBomInfoAuth.delete()
  @ApiOperation({
    summary: 'BOM 정보 삭제',
    description: '특정 ID의 BOM 정보를 삭제합니다. 하위 BOM이나 상위 BOM이 있는 경우 삭제할 수 없습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 BOM의 ID',
    example: 1,
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'BOM 삭제 성공',
    schema: {
      example: {
        success: true,
        message: 'BOM이 성공적으로 삭제되었습니다.',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'BOM을 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: 'ID 1인 BOM을 찾을 수 없습니다.',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '삭제할 수 없는 BOM',
    schema: {
      example: {
        success: false,
        message: '하위 BOM이 존재하여 삭제할 수 없습니다: PROD002',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 요청',
  })
  async deleteBom(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<CustomApiResponse<null>> {
    try {
      const username = req.user?.username || 'unknown';
      await this.bomInfoDeleteService.deleteBom(id, username);

      return ApiResponseBuilder.success(
        null,
        'BOM이 성공적으로 삭제되었습니다.'
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || 'BOM 삭제에 실패했습니다.'
      );
    }
  }

  @Delete('batch')
  @ApiOperation({
    summary: '여러 BOM 일괄 삭제',
    description: '여러 BOM을 한 번에 삭제합니다. 각 BOM에 대해 삭제 가능 여부를 검증합니다.',
  })
  @ApiBody({
    description: '삭제할 BOM ID 배열',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          example: [1, 2, 3],
          description: '삭제할 BOM ID 배열',
        },
      },
      required: ['ids'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '일괄 삭제 성공',
    schema: {
      example: {
        success: true,
        message: '모든 BOM이 성공적으로 삭제되었습니다.',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '일부 BOM 삭제 실패',
    schema: {
      example: {
        success: false,
        message: '일부 BOM 삭제에 실패했습니다:\nID 1: 하위 BOM이 존재하여 삭제할 수 없습니다: PROD002',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  async deleteMultipleBoms(
    @Body() body: { ids: number[] },
    @Request() req,
  ): Promise<CustomApiResponse<null>> {
    try {
      const username = req.user?.username || 'unknown';
      await this.bomInfoDeleteService.deleteMultipleBoms(body.ids, username);

      return ApiResponseBuilder.success(
        null,
        '모든 BOM이 성공적으로 삭제되었습니다.'
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || 'BOM 일괄 삭제에 실패했습니다.'
      );
    }
  }
}
