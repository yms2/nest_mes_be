import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProcessEquipmentReadService } from '../services/process-equipment-read.service';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('공정 설비 관리')
@Controller('process-equipment')
export class ProcessEquipmentReadController {
  constructor(private readonly processEquipmentReadService: ProcessEquipmentReadService) {}


  @Get('process/:processCode/equipment-array')
  @Auth()
  @ApiOperation({ summary: '공정별 설비 배열 조회', description: '특정 공정의 설비 정보를 배열로 조회합니다.' })
  @ApiParam({ name: 'processCode', description: '공정 코드', type: String })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({ status: 404, description: '공정 설비를 찾을 수 없음' })
  async getProcessWithEquipmentArray(@Param('processCode') processCode: string): Promise<any> {
    return await this.processEquipmentReadService.getProcessWithEquipmentArray(processCode);
  }


}
