import { Controller, Post, Body } from '@nestjs/common';
import { BomCopyService } from '../../services';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CopyBomDto } from '../../dto/copy-bom.dto';

@ApiTags('BOM')
@Controller('bom')
export class BomCopyController {
  constructor(private readonly bomCopyService: BomCopyService) {}

  @Post('copy')
  @ApiOperation({ summary: 'BOM 복사', description: '등록된 BOM을 복사합니다.' })
  async copyBom(@Body() body: CopyBomDto) {
    const { sourceProductCode, targetProductCode } = body;
    return this.bomCopyService.copyBom(sourceProductCode, targetProductCode);
  }
}
