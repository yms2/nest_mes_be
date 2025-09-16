import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BomInfoUploadService } from '../../services/excel/bom-info-upload.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import * as multer from 'multer';

@ApiTags('BOM')
@Auth()
@Controller('bom')
export class BomInfoUploadController {
  constructor(private readonly bomService: BomInfoUploadService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'BOM 업로드',
    description: '등록된 BOM 데이터를 엑셀 파일을 업로드합니다.',
  })
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      // 한글 파일명을 제대로 처리하기 위한 설정
      if (file.originalname) {
        try {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (error) {
          console.warn('파일명 디코딩 실패:', error);
        }
      }
      cb(null, true);
    },
  }))
  @ApiConsumes('multipart/form-data') // ← multipart 처리
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // ← Swagger에서 파일 첨부로 표시됨
        },
      },
    },
  })
  async uploadBom(@UploadedFile() file: Express.Multer.File) {
    return this.bomService.uploadBomExcel(file.buffer);
  }
}
