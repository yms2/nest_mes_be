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

  //엑셀 검증
  @ApiOperation({
    summary: '사업장 엑셀 검증',
    description:
      '업로드할 엑셀 파일을 검증하고 중복 데이터를 확인합니다.\n\n' +
      '실제 저장은 하지 않고 미리보기만 제공합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: '업로드할 엑셀 파일 (.xlsx)' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '검증 완료',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '검증이 완료되었습니다.' },
        sessionId: { type: 'string', example: 'validation_1234567890_abc123def' },
        result: {
          type: 'object',
          properties: {
            totalCount: { type: 'number', example: 100 },
            duplicateCount: { type: 'number', example: 15 },
            newCount: { type: 'number', example: 80 },
            errorCount: { type: 'number', example: 5 },
            hasDuplicates: { type: 'boolean', example: true },
            hasErrors: { type: 'boolean', example: true },
            duplicates: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  row: { type: 'number', example: 3 },
                  businessNumber: { type: 'string', example: '1234567890' },
                  businessName: { type: 'string', example: '새로운회사명' },
                  existingBusinessName: { type: 'string', example: '기존회사명' },
                },
              },
            },
            preview: {
              type: 'object',
              properties: {
                toCreate: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      businessNumber: { type: 'string' },
                      businessName: { type: 'string' },
                      businessCeo: { type: 'string' },
                    },
                  },
                },
                toUpdate: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      businessNumber: { type: 'string' },
                      businessName: { type: 'string' },
                      businessCeo: { type: 'string' },
                      existingBusinessName: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
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

  //검증된 데이터 저장
  @ApiOperation({
    summary: '검증된 데이터 저장',
    description:
      '검증 단계에서 확인된 데이터를 실제로 저장합니다.\n\n' +
      '이 API는 검증 단계에서 반환된 데이터를 기반으로 저장하므로,\n' +
      '파일을 다시 업로드할 필요가 없습니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        validationId: {
          type: 'string',
          description: '검증 세션 ID (검증 API에서 반환된 값)',
          example: 'validation_123456789',
        },
        mode: {
          type: 'string',
          enum: ['add', 'overwrite'],
          description: '업로드 모드',
          example: 'overwrite',
        },
      },
      required: ['validationId', 'mode'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '저장 완료',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '저장이 완료되었습니다.' },
        result: {
          type: 'object',
          properties: {
            successCount: { type: 'number', example: 95 },
            failCount: { type: 'number', example: 5 },
            totalCount: { type: 'number', example: 100 },
            summary: {
              type: 'object',
              properties: {
                created: { type: 'number', example: 80 },
                updated: { type: 'number', example: 15 },
                skipped: { type: 'number', example: 0 },
              },
            },
          },
        },
      },
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
