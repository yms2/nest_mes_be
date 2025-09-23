import { Controller, Post, UploadedFile, UseInterceptors, HttpCode, HttpStatus, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiBody } from '@nestjs/swagger';
import { DevEquipmentInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { EquipmentUploadService } from '../services/equipment-upload.service';
import { DevAuth } from '@/common/decorators/dev-auth.decorator';
import { Request } from 'express';

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
  details: Array<{
    row: number;
    status: 'success' | 'failed';
    errors?: string[];
    data?: any;
  }>;
}

@DevAuth()
@ApiTags('설비 관리')
@Controller('equipment')
export class EquipmentUploadController {
  constructor(
    private readonly equipmentUploadService: EquipmentUploadService,
  ) {}

  @Post('upload-excel')
  @DevEquipmentInfoAuth.create()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '설비정보 엑셀 업로드',
    description: '엑셀 파일을 업로드하여 설비정보를 일괄 등록합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '설비정보 엑셀 파일 업로드',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '설비정보가 포함된 엑셀 파일 (.xlsx, .xls)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '엑셀 업로드 및 설비 등록 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '설비정보가 성공적으로 등록되었습니다.' },
        data: {
          type: 'object',
          properties: {
            success: { type: 'number', example: 8 },
            failed: { type: 'number', example: 2 },
            errors: {
              type: 'array',
              items: { type: 'string' },
              example: ['행 3: 설비명은 필수입니다', '행 5: 유효한 구매일 형식이 아닙니다']
            },
            totalProcessed: { type: 'number', example: 10 }
          }
        }
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일이 없거나 지원하지 않는 형식)',
  })
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: { username: string } }
  ) {
    if (!file) {
      throw new BadRequestException('파일이 업로드되지 않았습니다.');
    }

    if (!file.originalname.endsWith('.xlsx') && !file.originalname.endsWith('.xls')) {
      throw new BadRequestException('엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.');
    }

    const result = await this.equipmentUploadService.processExcelFile(file, req.user?.username || 'system');

    if (!result) {
      throw new BadRequestException('업로드 처리 중 오류가 발생했습니다.');
    }

    return {
      success: true,
      message: `설비정보 업로드 완료: 성공 ${result.success}개, 실패 ${result.failed}개`,
      data: {
        success: result.success,
        failed: result.failed,
        errors: result.errors,
        totalProcessed: result.success + result.failed
      }
    };
  }
}