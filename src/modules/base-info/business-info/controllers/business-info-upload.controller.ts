import { BadRequestException, Controller, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessUploadService } from '../services';
import { ApiOperation, ApiTags, ApiConsumes, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';

interface UploadResponse {
  message: string;
  result: {
    successCount: number;
    failCount: number;
    totalCount: number;
    errors: Array<{
      row: number;
      businessNumber?: string;
      businessName?: string;
      error: string;
      details?: string;
    }>;
    summary: {
      created: number;
      updated: number;
      skipped: number;
    };
  };
}

@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessUploadController {
  constructor(private readonly uploadService: BusinessUploadService) {}
  
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '업로드할 엑셀 파일 (.xlsx)' },
      },
    },
  })
  @ApiQuery({
    name: 'mode',
    required: false,
    description: '업로드 모드 (add: 신규만 등록 / overwrite: 중복 시 덮어쓰기)',
    schema: { default: 'add', enum: ['add', 'overwrite'] },
  })
  @Post('upload')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Query('mode') mode: 'add' | 'overwrite' = 'add',
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    return await this.uploadService.processExcel(file.buffer, mode);
  }
}
