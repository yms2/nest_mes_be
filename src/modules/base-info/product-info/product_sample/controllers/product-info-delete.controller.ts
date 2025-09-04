import { logService } from 'src/modules/log/Services/log.service';
import { ProductInfoDeleteService } from '../services/product-info-delete.service';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Param, Req } from '@nestjs/common';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { DevProductInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('ProductInfo')
@Controller('product-info')
export class ProductInfoDeleteController {
  constructor(
    private readonly productInfoDeleteService: ProductInfoDeleteService,
    private readonly logService: logService,
  ) {}

  @Delete(':id')
  @DevProductInfoAuth.delete()
  @ApiOperation({
    summary: '품목 정보 영구 삭제',
    description: '품목 정보를 영구적으로 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: 'ID', example: '1' })
  async deleteProductInfo(
    @Param('id') id: string,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      await this.productInfoDeleteService.hardDeleteProductInfo(Number(id));

      await this.logService.createDetailedLog({
        moduleName: '품목관리',
        action: 'HARD_DELETE',
        username: req.user.username,
        targetId: id,
        details: '품목 정보 영구 삭제',
      });

      return ApiResponseBuilder.success(null, '품목 정보가 영구 삭제되었습니다.');
    } catch (error) {
      await this.logService
        .createDetailedLog({
          moduleName: '품목관리',
          action: 'HARD_DELETE_FAIL',
          username: req.user.username,
          targetId: id,
          details: `영구 삭제 실패: ${(error as Error).message}`,
        })
        .catch(() => {});

      throw error;
    }
  }
}
