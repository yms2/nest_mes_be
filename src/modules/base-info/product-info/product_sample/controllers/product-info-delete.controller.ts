import { logService } from 'src/modules/log/Services/log.service';
import { ProductInfoDeleteService } from '../services/product-info-delete.service';
import { ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Controller, Delete, Param, Req, NotFoundException, BadRequestException } from '@nestjs/common';
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
    description: '품목 정보를 영구적으로 삭제합니다. 연결된 파일들도 함께 삭제됩니다.',
  })
  @ApiParam({ name: 'id', description: '품목 ID', example: '1' })
  @ApiResponse({ status: 200, description: '품목이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '삭제할 품목을 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '품목 삭제 중 오류가 발생했습니다.' })
  async deleteProductInfo(
    @Param('id') id: string,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      // ID 유효성 검사
      const productId = Number(id);
      if (isNaN(productId) || productId <= 0) {
        throw new BadRequestException('유효하지 않은 품목 ID입니다.');
      }

      await this.productInfoDeleteService.hardDeleteProductInfo(productId);

      await this.logService.createDetailedLog({
        moduleName: '품목관리',
        action: 'HARD_DELETE',
        username: req.user.username,
        targetId: id,
        details: '품목 정보 영구 삭제 (연결된 파일들도 함께 삭제됨)',
      });

      return ApiResponseBuilder.success(null, '품목 정보가 성공적으로 삭제되었습니다.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      
      await this.logService
        .createDetailedLog({
          moduleName: '품목관리',
          action: 'HARD_DELETE_FAIL',
          username: req.user.username,
          targetId: id,
          details: `영구 삭제 실패: ${errorMessage}`,
        })
        .catch(() => {});

      // 오류 타입에 따라 적절한 HTTP 상태 코드와 메시지 반환
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`삭제할 품목을 찾을 수 없습니다. (ID: ${id})`);
      }
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // 기타 예상치 못한 오류
      throw new BadRequestException(`품목 삭제 중 오류가 발생했습니다: ${errorMessage}`);
    }
  }
}
