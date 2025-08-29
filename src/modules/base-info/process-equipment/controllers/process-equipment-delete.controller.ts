import { Controller, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProcessEquipmentDeleteService } from '../services/process-equipment-delete.service';
import { DeleteProcessEquipmentDto } from '../dto/delete-process-equipment.dto';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('공정 설비 관리')
@Controller('process-equipment')
export class ProcessEquipmentDeleteController {
  constructor(
    private readonly processEquipmentDeleteService: ProcessEquipmentDeleteService,
  ) {}

  @Delete('batch/ids')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '공정 설비 일괄 삭제 (ID로)',
    description: '여러 공정 설비를 ID로 한 번에 삭제합니다.',
  })
  @ApiBody({
    description: '삭제할 공정 설비 ID 목록과 삭제 정보',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'number' },
          description: '삭제할 공정 설비 ID 배열',
          example: [1, 2, 3],
        },
      },
      required: ['ids'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '일괄 삭제 완료',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '총 3개 중 3개 공정 설비가 삭제되었습니다.',
        },
        deletedCount: {
          type: 'number',
          example: 3,
        },
        failedIds: {
          type: 'array',
          items: { type: 'number' },
          example: [],
        },
      },
    },
  })
  async deleteMultipleProcessEquipmentByIds(
    @Body() body: { ids: number[]; deleteReason?: string; deleteWorker?: string },
  ): Promise<{ message: string; deletedCount: number; failedIds: number[] }> {
    const { ids, deleteReason, deleteWorker } = body;
    const deleteProcessEquipmentDto = deleteReason || deleteWorker ? { deleteReason, deleteWorker } : undefined;
    
    return this.processEquipmentDeleteService.deleteMultipleProcessEquipmentByIds(ids, deleteProcessEquipmentDto);
  }

}
