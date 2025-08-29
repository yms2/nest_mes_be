import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BomProcessCreateService } from '../services/bom-process-create.service';
import { CreateBomProcessDto, CreateMultipleBomProcessDto } from '../dto/create-bom-process.dto';
import { BomProcess } from '../entities/bom-process.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('BOM 공정 관리')
@Controller('bom-process')
export class BomProcessCreateController {
  constructor(
    private readonly bomProcessCreateService: BomProcessCreateService,
  ) {}


  @Post('batch')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'BOM 공정 일괄 등록',
    description: '여러 BOM 공정을 한 번에 등록합니다.',
  })
  @ApiBody({
    type: CreateMultipleBomProcessDto,
    description: 'BOM 공정 일괄 등록 정보',
    examples: {
      example1: {
        summary: '여러 BOM 공정 일괄 등록',
        value: {
          bomProcesses: [
            { productCode: 'PRD001', processOrder: 1, processCode: 'PRC001', processName: '절삭' },
            { productCode: 'PRD001', processOrder: 2, processCode: 'PRC002', processName: '연마' },
            { productCode: 'PRD001', processOrder: 3, processCode: 'PRC003', processName: '도장' },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'BOM 공정 일괄 등록 완료',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '총 3개 중 3개 BOM 공정이 등록되었습니다.',
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
              productCode: { type: 'string' },
              processOrder: { type: 'number' },
              processCode: { type: 'string' },
              processName: { type: 'string' },
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
  async createMultipleBomProcess(
    @Body() createMultipleBomProcessDto: CreateMultipleBomProcessDto,
  ): Promise<{ message: string; createdCount: number; failedItems: any[] }> {
    return this.bomProcessCreateService.createMultipleBomProcess(createMultipleBomProcessDto);
  }
}
