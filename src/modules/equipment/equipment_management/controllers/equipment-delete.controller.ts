import { Controller, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EquipmentDeleteService } from '../services/equipment-delete.service';
import { DeleteEquipmentDto } from '../dto/delete-equipment.dto';
import { Equipment } from '../entities/equipment.entity';
import { DevEquipmentInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('설비 관리')
@Controller('equipment')
export class EquipmentDeleteController {
  constructor(
    private readonly equipmentDeleteService: EquipmentDeleteService,
  ) {}

  @Delete(':equipmentCode')
  @DevEquipmentInfoAuth.delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비 삭제',
    description: '지정된 설비를 삭제합니다.',
  })
  @ApiParam({
    name: 'equipmentCode',
    description: '삭제할 설비 코드',
    example: 'EQ001',
  })
  @ApiBody({
    type: DeleteEquipmentDto,
    description: '삭제 정보 (선택사항)',
    required: false,
    examples: {
      example1: {
        summary: '삭제 사유와 담당자 포함',
        value: {
          deleteReason: '노후화로 인한 폐기',
          deleteWorker: '김철수',
        },
      },
      example2: {
        summary: '삭제 정보 없음',
        value: {},
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '설비 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '장비 EQ001가 성공적으로 삭제되었습니다.',
        },
        deletedEquipment: {
          $ref: '#/components/schemas/Equipment',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '설비를 찾을 수 없음',
  })
  async deleteEquipment(
    @Param('equipmentCode') equipmentCode: string,
    @Body() deleteEquipmentDto?: DeleteEquipmentDto,
  ): Promise<{ message: string; deletedEquipment: Equipment }> {
    return this.equipmentDeleteService.deleteEquipment(equipmentCode, deleteEquipmentDto);
  }

  @Delete('batch/delete')
  @DevEquipmentInfoAuth.delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비 일괄 삭제',
    description: '여러 설비를 한 번에 삭제합니다.',
  })
  @ApiBody({
    description: '삭제할 설비 코드 목록과 삭제 정보',
    schema: {
      type: 'object',
      properties: {
        equipmentCodes: {
          type: 'array',
          items: { type: 'string' },
          description: '삭제할 설비 코드 배열',
          example: ['EQ001', 'EQ002', 'EQ003'],
        },
        deleteReason: {
          type: 'string',
          description: '삭제 사유',
          example: '노후화로 인한 폐기',
        },
        deleteWorker: {
          type: 'string',
          description: '삭제 담당자',
          example: '김철수',
        },
      },
      required: ['equipmentCodes'],
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
          example: '총 3개 중 3개 장비가 삭제되었습니다.',
        },
        deletedCount: {
          type: 'number',
          example: 3,
        },
        failedCodes: {
          type: 'array',
          items: { type: 'string' },
          example: [],
        },
      },
    },
  })
  async deleteMultipleEquipment(
    @Body() body: { equipmentCodes: string[]; deleteReason?: string; deleteWorker?: string },
  ): Promise<{ message: string; deletedCount: number; failedCodes: string[] }> {
    const { equipmentCodes, deleteReason, deleteWorker } = body;
    const deleteEquipmentDto = deleteReason || deleteWorker ? { deleteReason, deleteWorker } : undefined;
    
    return this.equipmentDeleteService.deleteMultipleEquipment(equipmentCodes, deleteEquipmentDto);
  }
}
