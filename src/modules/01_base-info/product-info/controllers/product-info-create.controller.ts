import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { ProductInfoCreateService } from '../services/product-info-create.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateProductInfoDto } from '../dto/product-info-create.dto';
import { ProductInfo } from '../entities/product-info.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('ProductInfo')
@Controller('product-info')
export class ProductInfoCreateController {
  constructor(
    private readonly ProductInfoCreateService: ProductInfoCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: '품목 정보 생성', description: '신규 품목 정보를 생성합니다.' })
  async createProductInfo(
    @Body() createProductInfoDto: CreateProductInfoDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.ProductInfoCreateService.createProductInfo(
        createProductInfoDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '품목 정보 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createProductInfoDto, req.user.username, error);
      throw error;
    }
  }

  private async writeCreateLog(result: ProductInfo, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '품목관리',
      action: 'CREATE',
      username,
      targetId: result.productCode,
      targetName: result.productName,
      details: '새로운 품목 정보 생성',
    });
  }

  private async writeCreateFailLog(dto: CreateProductInfoDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '품목관리',
        action: 'CREATE_FAIL',
        username,
        targetId: '',
        targetName: dto.productName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
