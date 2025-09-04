import { Put, Controller, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { CreateBusinessInfoDto } from '../dto/create-business-info.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { BusinessInfoUpdateService } from '../services/business-info-update.service';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { BusinessInfo } from '../entities/business-info.entity';
import { DevAuthWithPermission } from '@/common/decorators/dev-auth-with-permission.decorator';
@ApiTags('BusinessInfo')
@Controller('business-info')
export class BusinessInfoUpdateController {
  constructor(
    private readonly businessInfoUpdateService: BusinessInfoUpdateService,
    private readonly logService: logService,
  ) {}

  @Put(':businessNumber')
  @DevAuthWithPermission('businessInfo', 'update')
  @ApiOperation({ summary: '사업장 정보 수정', description: '기존 사업장 정보를 수정합니다.' })
  @ApiParam({ name: 'businessNumber', description: '사업자 번호', example: '6743001715' })
  async updateBusinessInfo(
    @Param('businessNumber') businessNumber: string,
    @Body() createBusinessInfoDto: CreateBusinessInfoDto,
    @Req() req: Request & { user: { username: string } }, // 추가
  ) {
    try {
      const result = await this.businessInfoUpdateService.updateBusinessInfo(
        businessNumber,
        createBusinessInfoDto,
        req.user.username, // 수정자 정보
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '사업장 정보가 수정되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.writeCreateFailLog(createBusinessInfoDto, req.user.username, error);
      throw error;
    }
  }
  private async writeCreateLog(result: BusinessInfo, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '사업장관리',
      action: 'UPDATE',
      username,
      targetId: result.businessNumber,
      targetName: result.businessName,
      details: '새로운 사업장 정보 수정',
    });
  }

  private async writeCreateFailLog(dto: CreateBusinessInfoDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '사업장관리',
        action: 'UPDATE_FAIL',
        username,
        targetId: dto.businessNumber,
        targetName: dto.businessName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
