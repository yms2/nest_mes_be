import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductInfoUpdateService } from '../services/product-info-update.service';
import { Body, Controller, Param, Put, Req } from '@nestjs/common';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateProductInfoDto } from '../dto/product-info-create.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { ProductInfo } from '../entities/product-info.entity';

@ApiTags('ProductInfo')
@Controller('product-info')
export class ProductInfoUpdateController {
  constructor(
    private readonly productInfoUpdateService: ProductInfoUpdateService,
    private readonly logService: logService,
  ) {}

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: 'id로 품목 정보 수정', description: '기존 품목 정보를 수정합니다.' })
  async updateProductInfo(
    @Param('id') id: number,
    @Body() CreateProductInfoDto: CreateProductInfoDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.productInfoUpdateService.updateProductInfo(
        id,
        CreateProductInfoDto,
        req.user.username,
      );
      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '품목정보가 수정되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(CreateProductInfoDto, req.user.username, error);
      throw error;
    }
  }
  private async writeCreateLog(result: ProductInfo, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '품목관리',
      action: 'UPDATE',
      username,
      targetId: '',
      targetName: result.productName,
      details: '품목 정보 수정',
    });
  }

  private async writeCreateFailLog(dto: CreateProductInfoDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '품목관리',
        action: 'UPDATE_FAIL',
        username,
        targetId: '',
        targetName: dto.productName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
