import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BomProcessReadService } from '../services/bom-process-read.service';
import { BomProcess } from '../entities/bom-process.entity';
import { Auth } from '@/common/decorators/auth.decorator';

@ApiTags('BOM 공정 관리')
@Controller('bom-process')
export class BomProcessReadController {
  constructor(private readonly bomProcessReadService: BomProcessReadService) {}

  @Get('product/:productCode')
  @Auth()
  @ApiOperation({ summary: '제품 코드로 BOM 공정 조회', description: '특정 제품 코드의 BOM 공정을 조회합니다.' })
  @ApiParam({ name: 'productCode', description: '제품 코드', type: String })
  @ApiResponse({ status: 200, description: '조회 성공 (데이터가 없으면 빈 배열 반환)', type: [BomProcess] })
  async getBomProcessesByProductCode(@Param('productCode') productCode: string): Promise<BomProcess[]> {
    return await this.bomProcessReadService.getBomProcessesByProductCode(productCode);
  }

}
