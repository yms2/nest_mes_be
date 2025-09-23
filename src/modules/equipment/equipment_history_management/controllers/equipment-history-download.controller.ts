import { Controller, Get, Param, Query, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { EquipmentHistoryDownloadService } from '../services/equipment-history-download.service';

@DevAuth()
@ApiTags('설비 이력 관리')
@Controller('equipment-history')
export class EquipmentHistoryDownloadController {
  constructor(
    private readonly equipmentHistoryDownloadService: EquipmentHistoryDownloadService,
  ) {}

  @Get('download/equipment/:equipmentCode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '설비별 이력 엑셀 다운로드',
    description: '특정 설비의 이력을 엑셀 파일로 다운로드합니다.',
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
  })
  @ApiQuery({
    name: 'employeeName',
    description: '담당자명 (부분 검색)',
    required: false,
  })
  @ApiQuery({
    name: 'equipmentHistory',
    description: '고장내역 (부분 검색)',
    required: false,
  })
  @ApiQuery({
    name: 'equipmentRepair',
    description: '수리내역 (부분 검색)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: '엑셀 파일 다운로드 성공',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (설비 코드 없음 또는 데이터 없음)',
  })
  async downloadEquipmentHistoryByCode(
    @Param('equipmentCode') equipmentCode: string,
    @Res() res: Response,
    @Query('equipmentName') equipmentName?: string,
    @Query('employeeName') employeeName?: string,
    @Query('equipmentHistory') equipmentHistory?: string,
    @Query('equipmentRepair') equipmentRepair?: string,
  ): Promise<void> {
    const searchConditions = {
      equipmentName,
      employeeName,
      equipmentHistory,
      equipmentRepair,
    };

    const { buffer, equipmentName: actualEquipmentName } = await this.equipmentHistoryDownloadService.downloadEquipmentHistoryByCode(
      equipmentCode,
      searchConditions,
    );

    const fileName = `설비이력_${actualEquipmentName || equipmentCode}_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      'Content-Length': buffer.length.toString(),
    });

    res.send(buffer);
  }
}
