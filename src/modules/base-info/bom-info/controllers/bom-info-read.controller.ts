import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BomInfoService } from '../services';
import { DevBomInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('BOM')
@Controller('bom')
export class BomInfoController {
  constructor(private readonly bomService: BomInfoService) {}

  @Get('tree/:productCode')
  @DevBomInfoAuth.read()
  @ApiOperation({
    summary: 'BOM 트리 조회',
    description: '지정한 품목 코드에 대한 BOM 트리 구조를 재귀적으로 조회합니다.',
  })
  async getBomTree(@Param('productCode') productCode: string) {
    return this.bomService.getBomTree(productCode);
  }
}
