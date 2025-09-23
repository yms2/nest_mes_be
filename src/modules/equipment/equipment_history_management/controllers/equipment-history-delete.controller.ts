import { Controller, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { EquipmentHistoryDeleteService } from '../services/equipment-history-delete.service';

@DevAuth()
@ApiTags('설비 이력 관리')
@Controller('equipment-history')
export class EquipmentHistoryDeleteController {
  constructor(
    private readonly equipmentHistoryDeleteService: EquipmentHistoryDeleteService,
  ) {}

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비 이력 삭제 (ID)',
    description: 'ID로 설비 이력을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '설비 이력 ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: '설비 이력 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '설비 이력이 성공적으로 삭제되었습니다.' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '설비 이력을 찾을 수 없음',
  })
  async deleteEquipmentHistory(@Param('id') id: number): Promise<{ message: string }> {
    return this.equipmentHistoryDeleteService.deleteEquipmentHistory(id);
  }
}
