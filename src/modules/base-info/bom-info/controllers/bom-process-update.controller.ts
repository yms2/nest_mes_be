import { Controller, Put, Param, Body, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BomProcessUpdateService } from '../services/bom-process-update.service';
import { UpdateBomProcessDto, UpdateMultipleBomProcessDto } from '../dto/update-bom-process.dto';
import { BomProcess } from '../entities/bom-process.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('BOM 공정 관리')
@Controller('bom-process')
export class BomProcessUpdateController {
  constructor(
    private readonly bomProcessUpdateService: BomProcessUpdateService,
  ) {}

  @Put(':id')
  @Auth()
  @ApiOperation({ 
    summary: 'BOM 공정 정보 수정', 
    description: '기존 BOM 공정 정보를 수정합니다. 제품 코드, 공정 순서, 공정 코드, 공정명을 변경할 수 있습니다.' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'BOM 공정 ID', 
    type: Number,
    example: 1
  })
  @ApiBody({
    description: '수정할 BOM 공정 정보',
    schema: {
      type: 'object',
      properties: {
        productCode: {
          type: 'string',
          description: '새로운 제품 코드 (선택사항)',
          example: 'PRD002',
          maxLength: 20
        },
        processOrder: {
          type: 'number',
          description: '새로운 공정 순서 (선택사항)',
          example: 2,
          minimum: 1
        },
        processCode: {
          type: 'string',
          description: '새로운 공정 코드 (선택사항)',
          example: 'PRC002',
          maxLength: 20
        },
        processName: {
          type: 'string',
          description: '새로운 공정명 (선택사항)',
          example: '연마',
          maxLength: 20
        }
      },
      example: {
        productCode: 'PRD002',
        processOrder: 2,
        processCode: 'PRC002',
        processName: '연마'
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: '수정 성공',
    schema: {
      example: {
        success: true,
        message: 'BOM 공정 정보가 수정되었습니다.',
        data: {
          id: 1,
          productCode: 'PRD002',
          processOrder: 2,
          processCode: 'PRC002',
          processName: '연마',
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
        message: '수정할 데이터가 없습니다. 최소 하나의 필드는 입력해야 합니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'BOM 공정을 찾을 수 없음',
    schema: {
      example: {
        success: false,
        message: 'ID 1에 해당하는 BOM 공정을 찾을 수 없습니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: '중복된 제품-공정 순서 조합',
    schema: {
      example: {
        success: false,
        message: '제품 코드 PRD002의 공정 순서 2가 이미 존재합니다.',
        data: null,
        timestamp: '2025-01-08T00:00:00.000Z'
      }
    }
  })
  async updateBomProcess(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateBomProcessDto,
    @Req() req: Request & { user: { username: string } },
  ): Promise<any> {
    try {
      const result = await this.bomProcessUpdateService.updateBomProcess(
        id,
        updateDto,
        req.user.username,
      );
      
      return ApiResponseBuilder.success(result, 'BOM 공정 정보가 수정되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || 'BOM 공정 정보 수정에 실패했습니다.',
      );
    }
  }

  @Put('bulk')
  @Auth()
  @ApiOperation({ 
    summary: 'BOM 공정 정보 일괄 수정', 
    description: '여러 BOM 공정 정보를 한 번에 수정합니다.' 
  })
  @ApiBody({
    description: '수정할 BOM 공정 정보 목록',
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
                description: '수정할 BOM 공정 ID',
                example: 1
              },
              productCode: {
                type: 'string',
                description: '새로운 제품 코드 (선택사항)',
                example: 'PRD002',
                maxLength: 20
              },
              processOrder: {
                type: 'number',
                description: '새로운 공정 순서 (선택사항)',
                example: 2,
                minimum: 1
              },
              processCode: {
                type: 'string',
                description: '새로운 공정 코드 (선택사항)',
                example: 'PRC002',
                maxLength: 20
              },
              processName: {
                type: 'string',
                description: '새로운 공정명 (선택사항)',
                example: '연마',
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
            productCode: 'PRD002',
            processOrder: 2,
            processCode: 'PRC002',
            processName: '연마'
          },
          {
            id: 2,
            processOrder: 3,
            processName: '도장'
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
        message: 'BOM 공정 정보가 일괄 수정되었습니다.',
        data: [
          {
            id: 1,
            productCode: 'PRD002',
            processOrder: 2,
            processCode: 'PRC002',
            processName: '연마',
            createdAt: '2025-01-08T00:00:00.000Z',
            updatedAt: '2025-01-08T00:00:00.000Z'
          },
          {
            id: 2,
            productCode: 'PRD001',
            processOrder: 3,
            processCode: 'PRC001',
            processName: '도장',
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
  async updateMultipleBomProcesses(
    @Body() body: { updates: UpdateMultipleBomProcessDto[] },
    @Req() req: Request & { user: { username: string } },
  ): Promise<any> {
    try {
      const { updates } = body;
      
      if (!updates || updates.length === 0) {
        return ApiResponseBuilder.error('수정할 데이터가 없습니다.');
      }

      const results = await this.bomProcessUpdateService.updateMultipleBomProcesses(
        updates,
        req.user.username,
      );
      
      return ApiResponseBuilder.success(results, 'BOM 공정 정보가 일괄 수정되었습니다.');
    } catch (error) {
      return ApiResponseBuilder.error(
        error.message || 'BOM 공정 정보 일괄 수정에 실패했습니다.',
      );
    }
  }
}
