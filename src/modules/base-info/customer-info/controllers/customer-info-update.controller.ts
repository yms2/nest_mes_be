import { Put, Controller, Param, Body, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { NotEmptyStringPipe } from "src/common/pipes/not-empty-string.pipe";
import { CreateCustomerInfoDto } from "../dto/customer-info-create.dto";
import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { CustomerInfoUpdateService } from "../services/customer-info-update.service";
import { logService } from "src/modules/log/Services/log.service";
import { Auth } from "src/common/decorators/auth.decorator";

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
    @Body('customerName', NotEmptyStringPipe) bodyCustomerName: string,
    @Body('customerCeo', NotEmptyStringPipe) bodyCustomerCeo: string,
    @Body() createCustomerInfoDto: CreateCustomerInfoDto,
    @Req() req: Request & { user: { username: string } }, // 추가
  ) {
    try {
      const result = await this.customerInfoUpdateService.updateCustomerInfo(
        id,
        createCustomerInfoDto,
        req.user.username, // 수정자 정보
      );
      // 상세 로그 생성
      await this.logService.createDetailedLog({
        moduleName: '거래처관리',
        action: 'UPDATE',
        username: req.user.username, // 수정자 정보
        targetId: result.customerNumber,
        targetName: result.customerName,
        details: '거래처 정보 수정',
      });

      return ApiResponseBuilder.success(result, '거래처 정보가 수정되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.logService
        .createDetailedLog({
          moduleName: '거래처관리',
          action: 'UPDATE_FAIL',
          username: req.user.username, // 수정자 정보
          targetId: bodyCustomerName,
          targetName: bodyCustomerCeo,
          details: `수정 실패: ${(error as Error).message}`,
        })
        .catch(() => {});

      throw error; // 에러를 다시 던져서 상위 핸들러에서 처리하도록 함
    }
  }
}
