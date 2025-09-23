import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { EquipmentHistoryReadService } from '../services/equipment-history-read.service';
import { QueryEquipmentHistoryDto } from '../dto/query-equipment-history.dto';
import { EquipmentHistory } from '../entities/equipment-history.entity';

@DevAuth()
@ApiTags('설비 이력 관리')
@Controller('equipment-history')
export class EquipmentHistoryReadController {
  constructor(
    private readonly equipmentHistoryReadService: EquipmentHistoryReadService,
  ) {}

  @Get('equipment/:equipmentCode')
  @ApiOperation({
    summary: '설비 코드로 이력 조회 및 검색',
    description: '특정 설비의 이력을 조회하고, 추가 검색 조건을 적용할 수 있습니다.',
  })
  @ApiParam({
    name: 'equipmentCode',
    description: '설비 코드',
    example: 'EQ001',
  })
  @ApiQuery({
    name: 'equipmentName',
    description: '설비명 (부분 검색)',
    required: false,
    example: 'CNC',
  })
  @ApiQuery({
    name: 'employeeName',
    description: '담당자명 (부분 검색)',
    required: false,
    example: '김철수',
  })
  @ApiQuery({
    name: 'equipmentHistory',
    description: '고장내역 (부분 검색)',
    required: false,
    example: '모터',
  })
  @ApiQuery({
    name: 'equipmentRepair',
    description: '수리내역 (부분 검색)',
    required: false,
    example: '교체',
  })
  @ApiResponse({
    status: 200,
    description: '설비 이력 조회 성공',
    type: [EquipmentHistory],
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 설비 코드',
  })
  async getEquipmentHistoryByCode(
    @Param('equipmentCode') equipmentCode: string,
    @Query('equipmentName') equipmentName?: string,
    @Query('employeeName') employeeName?: string,
    @Query('equipmentHistory') equipmentHistory?: string,
    @Query('equipmentRepair') equipmentRepair?: string,
  ): Promise<EquipmentHistory[]> {
    return this.equipmentHistoryReadService.getEquipmentHistoryByCodeWithSearch(
      equipmentCode,
      { equipmentName, employeeName, equipmentHistory, equipmentRepair }
    );
  }
}
