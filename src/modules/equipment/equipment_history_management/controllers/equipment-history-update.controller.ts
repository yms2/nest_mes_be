import { Controller, Put, Patch, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { EquipmentHistoryUpdateService } from '../services/equipment-history-update.service';
import { UpdateEquipmentHistoryDto } from '../dto/update-equipment-history.dto';
import { EquipmentHistory } from '../entities/equipment-history.entity';

@DevAuth()
@ApiTags('설비 이력 관리')
@Controller('equipment-history')
export class EquipmentHistoryUpdateController {
  constructor(
    private readonly equipmentHistoryUpdateService: EquipmentHistoryUpdateService,
  ) {}

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비 이력 수정 (ID)',
    description: 'ID로 설비 이력을 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '설비 이력 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '설비 이력 수정 성공',
    type: EquipmentHistory,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 404,
    description: '설비 이력을 찾을 수 없음',
  })
  async updateEquipmentHistory(
    @Param('id') id: number,
    @Body() updateDto: UpdateEquipmentHistoryDto,
  ): Promise<EquipmentHistory> {
    return this.equipmentHistoryUpdateService.updateEquipmentHistory(id, updateDto);
  }
  
}
