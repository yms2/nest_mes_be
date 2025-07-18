import { Put, Controller, Param, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { BaseProductDeleteService } from '../services/base-product-delete.service';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('BaseProduct')
@Controller('base-product')
export class BaseProductDeleteController {
  constructor(
    private readonly baseProductDeleteService: BaseProductDeleteService,
    private readonly logService: logService,
  ) {}

  @Delete(':id')
  @Auth()
  @ApiOperation({
    summary: '기본 제품 정보 영구 삭제',
    description: '기본 제품 정보를 영구적으로 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: 'ID', example: '1' })
  async deleteBaseProduct(
    @Param('id') id: string,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      await this.baseProductDeleteService.hardDeleteBaseProduct(Number(id));

      await this.logService.createDetailedLog({
        moduleName: '제품관리',
        action: 'HARD_DELETE',
        username: req.user.username,
        targetId: id,
        details: '기본 제품 정보 영구 삭제',
      });

      return ApiResponseBuilder.success(null, '기본 제품 정보가 삭제되었습니다.');
    } catch (error) {
      await this.logService
        .createDetailedLog({
          moduleName: '제품관리',
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