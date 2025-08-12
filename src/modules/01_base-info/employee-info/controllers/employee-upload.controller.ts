import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Auth } from '../../../../common/decorators/auth.decorator';
import { EmployeeUploadService, ValidationResponse, UploadResponse } from '../services/employee-upload/employee-upload.service';

@ApiTags('EmployeeUpload')
@Controller('employee-upload')
export class EmployeeUploadController {
  constructor(private readonly uploadService: EmployeeUploadService) {}

  @Post('validate')
  @Auth()
  @ApiOperation({ summary: '직원 정보 엑셀 검증' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file')) 
  async validateExcel(@UploadedFile() file: Express.Multer.File): Promise<ValidationResponse> {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    return await this.uploadService.validateExcel(file.buffer);
  }

  @Post('confirmed')
  @Auth()
    @ApiOperation({ summary: '검증된 직원 정보 저장' })
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
  async uploadConfirmed(
    @Body() body: { validationId: string; mode: 'add' | 'overwrite' },
  ): Promise<UploadResponse> {
    if (!body) {
      throw new BadRequestException('요청 본문이 없습니다.');
    }
    
    if (!body.validationId) {
      throw new BadRequestException('검증 ID가 필요합니다.');
    }

    if (!body.mode || !['add', 'overwrite'].includes(body.mode)) {
      throw new BadRequestException('유효한 모드(add 또는 overwrite)가 필요합니다.');
    }

    return await this.uploadService.processValidatedData(body.validationId, body.mode);
  }
} 