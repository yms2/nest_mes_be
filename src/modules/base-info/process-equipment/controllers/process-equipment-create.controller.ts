import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProcessEquipmentCreateService } from '../services/process-equipment-create.service';
import { CreateProcessEquipmentDto, CreateMultipleProcessEquipmentDto } from '../dto/create-process-equipment.dto';
import { ProcessEquipment } from '../entities/process-equipment.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('공정 설비 관리')
@Controller('process-equipment')
export class ProcessEquipmentCreateController {
  constructor(
    private readonly processEquipmentCreateService: ProcessEquipmentCreateService,
  ) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '공정 설비 등록',
    description: '공정에 설비를 등록합니다.',
  })
  @ApiBody({
    type: CreateProcessEquipmentDto,
    description: '공정 설비 등록 정보',
    examples: {
      example1: {
        summary: '단일 공정 설비 등록',
        value: {
          processEquipment: {
            processCode: 'PRC001',
            equipmentCode: 'EQ001',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '공정 설비 등록 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '공정 PRC001에 설비 EQ001가 성공적으로 등록되었습니다.',
        },
        processEquipment: {
          $ref: '#/components/schemas/ProcessEquipment',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 409,
    description: '이미 등록된 공정 설비',
  })
  async createProcessEquipment(
    @Body() createProcessEquipmentDto: CreateProcessEquipmentDto,
  ): Promise<{ message: string; processEquipment: ProcessEquipment }> {
    return this.processEquipmentCreateService.createProcessEquipment(createProcessEquipmentDto);
  }

  @Post('batch')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '공정 설비 일괄 등록',
    description: '여러 공정 설비를 한 번에 등록합니다.',
  })
  @ApiBody({
    type: CreateMultipleProcessEquipmentDto,
    description: '공정 설비 일괄 등록 정보',
    examples: {
      example1: {
        summary: '여러 공정 설비 일괄 등록',
        value: {
          processEquipments: [
            { processCode: 'PRC001', equipmentCode: 'EQ001' },
            { processCode: 'PRC001', equipmentCode: 'EQ002' },
            { processCode: 'PRC002', equipmentCode: 'EQ003' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '공정 설비 일괄 등록 완료',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '총 3개 중 3개 공정 설비가 등록되었습니다.',
        },
        createdCount: {
          type: 'number',
          example: 3,
        },
        failedItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              processCode: { type: 'string' },
              equipmentCode: { type: 'string' },
            },
          },
          example: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  async createMultipleProcessEquipment(
    @Body() createMultipleProcessEquipmentDto: CreateMultipleProcessEquipmentDto,
  ): Promise<{ message: string; createdCount: number; failedItems: any[] }> {
    return this.processEquipmentCreateService.createMultipleProcessEquipment(createMultipleProcessEquipmentDto);
  }
}
