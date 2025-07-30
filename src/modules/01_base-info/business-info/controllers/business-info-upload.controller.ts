import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessUploadService } from '../services';
import {
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
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

interface ValidationResponse {
  message: string;
  sessionId?: string; // 검증 세션 ID
  result: {
    totalCount: number;
    duplicateCount: number;
    newCount: number;
    errorCount: number;
    hasDuplicates: boolean; // 중복 데이터 존재 여부
    hasErrors: boolean; // 오류 데이터 존재 여부
    duplicates: Array<{
      row: number;
      businessNumber: string;
      businessName: string;
      existingBusinessName: string;
    }>;
    errors: Array<{
      row: number;
      businessNumber?: string;
      businessName?: string;
      error: string;
    }>;
    preview: {
      toCreate: Array<{
        businessNumber: string;
        businessName: string;
        businessCeo: string;
      }>;
      toUpdate: Array<{
        businessNumber: string;
        businessName: string;
        businessCeo: string;
        existingBusinessName: string;
      }>;
    };
  };
}

@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessUploadController {
  constructor(private readonly uploadService: BusinessUploadService) {}

  @ApiOperation({ summary: '사업장 엑셀 검증' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @Post('upload/validate')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  async validateExcel(@UploadedFile() file: Express.Multer.File): Promise<ValidationResponse> {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    return await this.uploadService.validateExcel(file.buffer);
  }

  @ApiOperation({ summary: '검증된 데이터 저장' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        validationId: { type: 'string' },
        mode: { type: 'string', enum: ['add', 'overwrite'] },
      },
      required: ['validationId', 'mode'],
    },
  })
  @Post('upload/confirmed')
  @Auth()
  async uploadConfirmed(
    @Body() body: { validationId: string; mode: 'add' | 'overwrite' },
  ): Promise<UploadResponse> {
    if (!body.validationId) {
      throw new BadRequestException('검증 ID가 필요합니다.');
    }

    return await this.uploadService.processValidatedData(body.validationId, body.mode);
  }
}
