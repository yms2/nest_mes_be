import { Controller, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { BomProcessDeleteService } from '../services/bom-process-delete.service';
import { DeleteBomProcessDto } from '../dto/delete-bom-process.dto';
import { BomProcess } from '../entities/bom-process.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('BOM 공정 관리')
@Controller('bom-process')
export class BomProcessDeleteController {
  constructor(
    private readonly bomProcessDeleteService: BomProcessDeleteService,
  ) {}

  @Delete(':id')
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'BOM 공정 삭제',
    description: 'ID를 통해 BOM 공정을 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '삭제할 BOM 공정 ID',
    example: 1,
  })
  @ApiBody({
    type: DeleteBomProcessDto,
    description: '삭제 정보 (선택사항)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'BOM 공정 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'BOM 공정 ID 1이 성공적으로 삭제되었습니다.',
        },
        deletedBomProcess: {
          $ref: '#/components/schemas/BomProcess',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'BOM 공정을 찾을 수 없음',
  })
  async deleteBomProcessById(
    @Param('id') id: number,
    @Body() deleteBomProcessDto?: DeleteBomProcessDto,
  ): Promise<{ message: string; deletedBomProcess: BomProcess }> {
    return this.bomProcessDeleteService.deleteBomProcessById(id, deleteBomProcessDto);
  }
}
