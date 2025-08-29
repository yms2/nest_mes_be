import { Controller, Put, Body, Param, Request, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BomInfoUpdateService } from '../services/bom-info-update.service';
import { UpdateBomDto } from '../dto/update-bom.dto';
import { BomInfo } from '../entities/bom-info.entity';
import { ApiResponse as CustomApiResponse, ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('BOM 등록/수정/삭제')
@Controller('bom-info')
@Auth()
export class BomInfoUpdateController {
  constructor(private readonly bomInfoUpdateService: BomInfoUpdateService) {}

  @Put(':id')
  @ApiOperation({
    summary: 'BOM 정보 수정',
    description: '기존 BOM 정보를 수정합니다. 상위품목, 하위품목, 수량, 단위를 변경할 수 있습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '수정할 BOM의 ID',
    example: 1,
    type: 'number',
  })
  @ApiBody({
    type: UpdateBomDto,
    description: 'BOM 수정 데이터',
    examples: {
      example1: {
        summary: '수량 및 단위 수정',
        description: 'BOM의 수량과 단위만 수정합니다.',
        value: {
          quantity: 10,
          unit: 'EA'
        } as UpdateBomDto
      },
      example2: {
        summary: '품목 관계 수정',
        description: '상위품목과 하위품목 관계를 수정합니다.',
        value: {
          parentProductCode: 'PROD002',
          childProductCode: 'PROD003',
          quantity: 5,
          unit: '개'
        } as UpdateBomDto
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'BOM 수정 성공',
    schema: {
      example: {
        success: true,
        message: 'BOM이 성공적으로 수정되었습니다.',
        data: {
          id: 1,
          parentProductCode: 'PROD001',
          childProductCode: 'PROD002',
          quantity: 10,
          unit: 'EA',
        },
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청 데이터',
    schema: {
      example: {
        success: false,
        message: '수량은 0보다 커야 합니다.',
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
    status: HttpStatus.CONFLICT,
    description: '중복된 BOM',
    schema: {
      example: {
        success: false,
        message: '이미 존재하는 BOM입니다: PROD001 → PROD002',
        data: null,
        timestamp: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '인증되지 않은 요청',
  })
  async updateBom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateBomDto,
    @Request() req,
  ): Promise<CustomApiResponse<BomInfo>> {
    try {
      const username = req.user?.username || 'unknown';
      const bom = await this.bomInfoUpdateService.updateBom(id, updateData, username);

      return ApiResponseBuilder.success(
        bom,
        'BOM이 성공적으로 수정되었습니다.'
      );
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || 'BOM 수정에 실패했습니다.'
      );
    }
  }
}
