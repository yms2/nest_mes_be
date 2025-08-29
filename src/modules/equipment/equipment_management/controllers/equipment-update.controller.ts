import { Controller, Put, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EquipmentUpdateService } from '../services/equipment-update.service';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';
import { Equipment } from '../entities/equipment.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('설비 관리')
@Controller('equipment')
export class EquipmentUpdateController {
  constructor(
    private readonly equipmentUpdateService: EquipmentUpdateService,
  ) {}

  @Put(':equipmentCode')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비 정보 수정',
    description: '기존 설비 정보를 수정합니다. 수정하지 않을 필드는 제외하면 됩니다.',
  })
  @ApiParam({
    name: 'equipmentCode',
    description: '수정할 설비 코드',
    example: 'EQ001',
  })
  @ApiBody({
    type: UpdateEquipmentDto,
    description: '수정할 설비 정보 (변경할 필드만 포함)',
    examples: {
      example1: {
        summary: '설비명과 담당자만 수정',
        value: {
          equipmentName: 'CNC 머신 (수정됨)',
          equipmentWorker: '이영희',
        },
      },
      example2: {
        summary: '여러 필드 동시 수정',
        value: {
          equipmentName: 'CNC 머신 (수정됨)',
          equipmentModel: 'XK-2001',
          equipmentPurchasePrice: 55000000,
          equipmentHistory: '2024년 수리 완료, 성능 개선',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '설비 수정 성공',
    type: Equipment,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 404,
    description: '설비를 찾을 수 없음',
  })
  async updateEquipment(
    @Param('equipmentCode') equipmentCode: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ): Promise<Equipment> {
    return this.equipmentUpdateService.updateEquipment(equipmentCode, updateEquipmentDto);
  }
}
