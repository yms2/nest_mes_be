import { Injectable, NotFoundException, BadRequestException, Controller, Put, Param, Body, Req, InternalServerErrorException } from '@nestjs/common';

import { BaseProduct } from '../entities/base-product.entity';
import { BaseProductCreateDto } from '../dto/base-product-create.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseProductUpdateService } from '../services';
import { logService } from '@/modules/log/Services/log.service';
import { Auth } from '@/common/decorators/auth.decorator';
import { ApiResponseBuilder } from '@/common/interfaces/api-response.interface';

@ApiTags('BaseProduct')
@Controller('base-product')
export class BaseProductUpdateController {
  constructor(
    private readonly baseProductservice: BaseProductUpdateService,
    private readonly logService: logService,
  ) {}

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: '기본 제품 정보 수정', description: '기존 기본 제품 정보를 수정합니다.' })
  async updateBaseProduct(
    @Param('id') id: number,
    @Body() createBaseProductDto: BaseProductCreateDto,
    @Req() req: Request & { user: { username: string } }, // 추가
  ) {
    try{
    const result = await this.baseProductservice.updateBaseProduct(
      id,
      createBaseProductDto,
      req.user.username, // 수정자 정보
    );
    await this.writeUpdateLog(result, req.user.username);

    return ApiResponseBuilder.success(result, '기본 제품 정보가 수정되었습니다.');
  } catch (error) {
      // 에러 로그 생성
      await this.writeUpdateFailLog(createBaseProductDto, req.user.username, error);
      
      throw new InternalServerErrorException(error.message || '서버 에러 발생');
      
    }
  }
  private async writeUpdateLog(result: BaseProduct, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '제품관리',
      action: 'UPDATE',
      username,
      targetId: result.productCode,
      targetName: result.productName,
      details: '기본 제품 정보 수정',
    });
  }

  private async writeUpdateFailLog(dto: BaseProductCreateDto, username: string, error: Error) {
    await this.logService.createDetailedLog({
      moduleName: '제품관리',
      action: 'UPDATE_FAIL',
      username,
      details: `기본 제품 정보 수정 실패 - ${error.message}`,
    });
  }
}