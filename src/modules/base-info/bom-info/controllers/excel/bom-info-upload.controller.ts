import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BomInfoUploadService } from '../../services/excel/bom-info-upload.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('BOM')
@Auth()
@Controller('bom')
export class BomInfoUploadController {
  constructor(private readonly bomService: BomInfoUploadService) {}

  @Post('upload')
    @ApiOperation({ summary: 'BOM 업로드', description: '등록된 BOM 데이터를 엑셀 파일을 업로드합니다.' })
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')  // ← multipart 처리
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',  // ← Swagger에서 파일 첨부로 표시됨
        },
      },
    },
  })
  async uploadBom(@UploadedFile() file: Express.Multer.File) {
    return this.bomService.uploadBomExcel(file.buffer);
  }
}
