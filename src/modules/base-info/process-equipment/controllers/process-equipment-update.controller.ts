import { Controller, Put, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ProcessEquipmentUpdateService } from '../services/process-equipment-update.service';
import { UpdateProcessEquipmentDto, UpdateMultipleProcessEquipmentDto } from '../dto/update-process-equipment.dto';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('공정 설비 관리')
@Controller('process-equipment')
export class ProcessEquipmentUpdateController {
  constructor(
    private readonly processEquipmentUpdateService: ProcessEquipmentUpdateService,
  ) {}

  @Put(':id')
  @Auth()
  @ApiOperation({ 
    summary: '공정 설비 정보 수정', 
    description: '기존 공정 설비 정보를 수정합니다. 공정 코드 또는 설비 코드를 변경할 수 있습니다.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: '공정 설비 ID', 
    type: Number,
    example: 1
  })
  @ApiBody({
    description: '수정할 공정 설비 정보',
    schema: {
      type: 'object',
      properties: {
        processCode: {
          type: 'string',
          description: '새로운 공정 코드 (선택사항)',
          example: 'PRC002',
          maxLength: 20
        },
        equipmentCode: {
          type: 'string',
          description: '새로운 설비 코드 (선택사항)',
          example: 'EQ002',
          maxLength: 20
        }
      },
      example: {
        processCode: 'PRC002',
        equipmentCode: 'EQ002'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '수정 성공',
    schema: {
      example: {
        success: true,
        message: '공정 설비 정보가 수정되었습니다.',
        data: {
          id: 1,
          processCode: 'PRC002',
          equipmentCode: 'EQ002',
          createdAt: '2025-01-08T00:00:00.000Z',
          updatedAt: '2025-01-08T00:00:00.000Z'
        },
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청',
    schema: {
      example: {
        success: false,
        message: '수정할 데이터가 없습니다. 공정 코드 또는 설비 코드 중 하나는 입력해야 합니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: '공정 설비를 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: 'ID 1에 해당하는 공정 설비를 찾을 수 없습니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: '중복된 공정-설비 조합',
    schema: {
      example: {
        success: false,
        message: '공정 코드 PRC002와 설비 코드 EQ002의 조합이 이미 존재합니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  async updateProcessEquipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProcessEquipmentDto,
    @Req() req: Request & { user: { username: string } },
  ): Promise<any> {
    try {
      const result = await this.processEquipmentUpdateService.updateProcessEquipment(
        id,
        updateDto,
        req.user.username,
      );
      
      return ApiResponseBuilder.success(result, '공정 설비 정보가 수정되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || '공정 설비 정보 수정에 실패했습니다.',
      );
    }
  }

  @Put('bulk')
  @Auth()
  @ApiOperation({ 
    summary: '공정 설비 정보 일괄 수정', 
    description: '여러 공정 설비 정보를 한 번에 수정합니다.' 
  })
  @ApiBody({
    description: '수정할 공정 설비 정보 목록',
    schema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: '수정할 공정 설비 ID',
                example: 1
              },
              processCode: {
                type: 'string',
                description: '새로운 공정 코드 (선택사항)',
                example: 'PRC002',
                maxLength: 20
              },
              equipmentCode: {
                type: 'string',
                description: '새로운 설비 코드 (선택사항)',
                example: 'EQ002',
                maxLength: 20
              }
            },
            required: ['id']
          }
        }
      },
      example: {
        updates: [
          {
            id: 1,
            processCode: 'PRC002',
            equipmentCode: 'EQ002'
          },
          {
            id: 2,
            processCode: 'PRC003'
          }
        ]
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '일괄 수정 성공',
    schema: {
      example: {
        success: true,
        message: '공정 설비 정보가 일괄 수정되었습니다.',
        data: [
          {
            id: 1,
            processCode: 'PRC002',
            equipmentCode: 'EQ002',
            createdAt: '2025-01-08T00:00:00.000Z',
            updatedAt: '2025-01-08T00:00:00.000Z'
          },
          {
            id: 2,
            processCode: 'PRC003',
            equipmentCode: 'EQ001',
            createdAt: '2025-01-08T00:00:00.000Z',
            updatedAt: '2025-01-08T00:00:00.000Z'
          }
        ],
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '잘못된 요청',
    schema: {
      example: {
        success: false,
        message: '수정할 데이터가 없습니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  async updateMultipleProcessEquipments(
    @Body() body: { updates: UpdateMultipleProcessEquipmentDto[] },
    @Req() req: Request & { user: { username: string } },
  ): Promise<any> {
    try {
      const { updates } = body;
      
      if (!updates || updates.length === 0) {
        return ApiResponseBuilder.error('수정할 데이터가 없습니다.');
      }

      const results = await this.processEquipmentUpdateService.updateMultipleProcessEquipments(
        updates,
        req.user.username,
      );
      
      return ApiResponseBuilder.success(results, '공정 설비 정보가 일괄 수정되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || '공정 설비 정보 일괄 수정에 실패했습니다.',
      );
    }
  }
}
