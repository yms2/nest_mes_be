import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Res,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { Auth } from '../../../../../common/decorators/auth.decorator';
import { ProductFileService } from '../services/product-file.service';
import { ProductFileUploadDto } from '../dto/product-file-upload.dto';

@ApiTags('ProductFile')
@Controller('product-file')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProductFileController {
  constructor(private readonly productFileService: ProductFileService) {}

  @Post('upload')
  @Auth()
  @ApiOperation({ summary: '품목 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        productId: { type: 'number', description: '품목 ID' },
        description: { type: 'string', description: '파일 설명' },
        fileType: { type: 'string', description: '파일 타입' },
      },
      required: ['file', 'productId'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    // productId를 숫자로 변환
    const uploadDto: ProductFileUploadDto = {
      productId: parseInt(body.productId, 10),
      description: body.description,
      fileType: body.fileType,
    };

    const result = await this.productFileService.uploadFile(
      file,
      uploadDto,
      'admin', // TODO: 실제 사용자 정보로 변경
    );

    return {
      success: true,
      message: '파일이 성공적으로 업로드되었습니다.',
      data: result,
    };
  }

  @Get('product/:productId')
  @Auth()
  @ApiOperation({ summary: '품목별 파일 목록 조회' })
  @ApiParam({ name: 'productId', description: '품목 ID' })
  async getProductFiles(@Param('productId', ParseIntPipe) productId: number) {
    const files = await this.productFileService.getProductFiles(productId);

    return {
      success: true,
      message: '파일 목록을 조회했습니다.',
      data: files,
    };
  }

  @Get('product/:productId/preview')
  @Auth()
  @ApiOperation({ summary: '품목별 파일 목록 조회 (미리보기 포함)' })
  @ApiParam({ name: 'productId', description: '품목 ID' })
  async getProductFilesWithPreview(@Param('productId', ParseIntPipe) productId: number) {
    const files = await this.productFileService.getProductFilesWithPreview(productId);

    return {
      success: true,
      message: '파일 목록을 조회했습니다.',
      data: files,
    };
  }

  @Get('download/:fileId')
  @Auth()
  @ApiOperation({ summary: '파일 다운로드' })
  @ApiParam({ name: 'fileId', description: '파일 ID' })
  async downloadFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
  ) {
    await this.productFileService.downloadFile(fileId, res);
  }

  @Get('preview/:fileId')
  @Auth()
  @ApiOperation({ summary: '파일 미리보기 (이미지, PDF, 비디오 지원)' })
  @ApiParam({ name: 'fileId', description: '파일 ID' })
  async previewFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @Res() res: Response,
  ) {
    await this.productFileService.previewFile(fileId, res);
  }

  @Delete(':fileId')
  @Auth()
  @ApiOperation({ summary: '파일 삭제' })
  @ApiParam({ name: 'fileId', description: '파일 ID' })
  async deleteFile(@Param('fileId', ParseIntPipe) fileId: number) {
    await this.productFileService.deleteFile(fileId);

    return {
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
    };
  }
} 