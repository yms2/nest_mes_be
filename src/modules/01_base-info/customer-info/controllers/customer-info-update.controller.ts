import { Put, Controller, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CustomerInfoUpdateService } from '../services/customer-info-update.service';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CustomerInfo } from '../entities/customer-info.entity';

@ApiTags('CustomerInfo')
@Controller('customer-info')
export class CustomerInfoUpdateController {
  constructor(
    private readonly customerInfoUpdateService: CustomerInfoUpdateService,
    private readonly logService: logService,
  ) {}

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: 'id 정보 수정', description: '기존 거래처 정보를 수정합니다.' })
  async updateCustomerInfo(
    @Param('id') id: number,
    @Body() createCustomerInfoDto: CreateCustomerInfoDto,
    @Req() req: Request & { user: { username: string } }, // 추가
  ) {
    try {
      const result = await this.customerInfoUpdateService.updateCustomerInfo(
        id,
        createCustomerInfoDto,
        req.user.username, // 수정자 정보
      );
      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '거래처 정보가 수정되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.writeCreateFailLog(createCustomerInfoDto, req.user.username, error);
      throw error;
    }
  }

  private async writeCreateLog(result: CustomerInfo, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '사업장관리',
      action: 'UPDATE',
      username,
      targetId: result.customerNumber,
      targetName: result.customerName,
      details: '새로운 사업장 정보 수정',
    });
  }

  private async writeCreateFailLog(dto: CreateCustomerInfoDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '사업장관리',
        action: 'UPDATE_FAIL',
        username,
        targetId: dto.customerNumber,
        targetName: dto.customerName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
