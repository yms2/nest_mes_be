import { Controller, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { EquipmentReadService } from '../services/equipment-read.service';
import { Equipment } from '../entities/equipment.entity';
import { DevEquipmentInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('설비 관리')
@Controller('equipment')
export class EquipmentReadController {
  constructor(
    private readonly equipmentReadService: EquipmentReadService,
  ) {}

  @Get('search')
  @DevEquipmentInfoAuth.read()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비 검색',
    description: '설비명, 모델, 담당자 등으로 설비를 검색합니다. 키워드를 입력하지 않으면 전체 설비를 조회합니다.',
  })
  @ApiQuery({
    name: 'keyword',
    description: '검색 키워드 (선택사항, 비어있으면 전체 조회)',
    required: false,
    type: String,
    example: 'CNC',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지당 항목 수',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '검색 결과',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Equipment' },
        },
        total: {
          type: 'number',
          description: '검색 결과 수',
        },
        page: {
          type: 'number',
          description: '현재 페이지 번호',
        },
        limit: {
          type: 'number',
          description: '페이지당 항목 수',
        },
      },
    },
  })
  async searchEquipment(
    @Query('keyword') keyword?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ data: Equipment[]; total: number; page: number; limit: number }> {
    return this.equipmentReadService.searchEquipment(keyword || '', page, limit);
  }
}
