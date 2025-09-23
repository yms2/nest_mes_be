import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { EquipmentHistoryCreateService } from '../services/equipment-history-create.service';
import { CreateEquipmentHistoryDto } from '../dto/create-equipment-history.dto';
import { EquipmentHistory } from '../entities/equipment-history.entity';

@DevAuth()
@ApiTags('설비 이력 관리')
@Controller('equipment-history')
export class EquipmentHistoryCreateController {
  constructor(
    private readonly equipmentHistoryCreateService: EquipmentHistoryCreateService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '설비 이력 등록',
    description: '새로운 설비 이력을 등록합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '설비 이력 등록 성공',
    type: EquipmentHistory,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  async createEquipmentHistory(@Body() createEquipmentHistoryDto: CreateEquipmentHistoryDto): Promise<EquipmentHistory> {
    return this.equipmentHistoryCreateService.createEquipmentHistory(createEquipmentHistoryDto);
  }
}
