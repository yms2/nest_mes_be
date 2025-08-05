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
import { UploadResponse, ValidationResponse } from '../dto/upload-business-info.dto';


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
