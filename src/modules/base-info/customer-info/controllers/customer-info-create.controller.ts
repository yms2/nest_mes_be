import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { CustomerInfoCreateService } from '../services/customer-info-create.service';

import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';
import { CustomerInfo } from '../entities/customer-info.entity';
import { Auth } from 'src/common/decorators/auth.decorator';
import { DevCustomerInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('CustomerInfo')
@Controller('customer-info')
export class CustomerInfoCreateController {
  constructor(
    private readonly createCustomerInfoService: CustomerInfoCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @DevCustomerInfoAuth.create()
  @ApiOperation({ summary: '거래처 정보 생성', description: '신규 거래처 정보를 생성합니다.' })
  async createCustomerInfo(
    @Body() createCustomerInfoDto: CreateCustomerInfoDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.createCustomerInfoService.createCustomerInfo(
        createCustomerInfoDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '거래처 정보 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createCustomerInfoDto, req.user.username, error);
      throw error;
    }
  }
  /**
   * 거래처 생성 성공 로그
   */
  private async writeCreateLog(result: CustomerInfo, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '거래처관리',
      action: 'CREATE',
      username,
      targetId: result.customerNumber,
      targetName: result.customerName,
      details: '새로운 거래처 정보 생성',
    });
  }

  /**
   * 거래처 생성 실패 로그
   */
  private async writeCreateFailLog(dto: CreateCustomerInfoDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '거래처관리',
        action: 'CREATE_FAIL',
        username,
        targetId: dto.customerNumber,
        targetName: dto.customerName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
