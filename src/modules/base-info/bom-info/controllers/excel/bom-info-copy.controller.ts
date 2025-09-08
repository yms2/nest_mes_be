import { Controller, Post, Body } from '@nestjs/common';
import { BomCopyService } from '../../services';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CopyBomDto } from '../../dto/copy-bom.dto';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('BOM')
@Controller('bom')
export class BomCopyController {
  constructor(private readonly bomCopyService: BomCopyService) {}

  @Post('copy')
  @Auth()
  @ApiOperation({ 
    summary: 'BOM 복사', 
    description: '등록된 BOM을 복사합니다. 중복되는 BOM은 자동으로 제외됩니다.' 
  })
  async copyBom(@Body() body: CopyBomDto) {
    const { sourceProductCode, targetProductCode } = body;
    return this.bomCopyService.copyBom(sourceProductCode, targetProductCode);
  }
}
