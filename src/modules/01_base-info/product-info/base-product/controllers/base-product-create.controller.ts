import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { BaseProductCreateService } from '../services/base-product-create.service';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { BaseProductCreateDto } from '../dto/base-product-create.dto';
import { BaseProduct } from '../entities/base-product.entity';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('BaseProduct')
@Controller('base-product')
export class BaseProductCreateController {
  constructor(
    private readonly baseProductCreateService: BaseProductCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({ summary: '기본 제품 정보 생성', description: '신규 기본 제품 정보를 생성합니다.' })
  async createBaseProduct(
    @Body() createBaseProductDto: BaseProductCreateDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.baseProductCreateService.createBaseProduct(
        createBaseProductDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '기본 제품 정보가 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createBaseProductDto, req.user.username, error);
      throw error;
    }
  }

  private async writeCreateLog(result: BaseProduct, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '제품관리',
      action: 'CREATE',
      username,
      targetId: result.productCode,
      targetName: result.productName,
      details: '새로운 기본 제품 정보 생성',
    });
  }

  private async writeCreateFailLog(dto: BaseProductCreateDto, username: string, error: Error) {
    await this.logService.createDetailedLog({
      moduleName: '제품관리',
      action: 'CREATE_FAIL',
      username,
      details: `기본 제품 정보 생성 실패 - ${error.message}`,
    });
  }
}