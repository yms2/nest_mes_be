import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { create } from 'domain';
import { NotEmptyStringPipe } from 'src/common/pipes/not-empty-string.pipe';
import { logService } from "src/modules/log/Services/log.service";
//import { CreateCustomerInfoDto } from '../dto/create-customer-info.dto';
import { CustomerInfoCreateService } from '../services/customer-info-create.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CreateCustomerInfoDto } from '../dto/customer-info-create.dto';

@ApiTags("CutomerInfo")
@Controller('customer-info')
export class CustomerInfoCreateController {
  constructor(
    private readonly createCustomerInfoService: CustomerInfoCreateService,
    private readonly logService: logService, 
  ) {}


  @Post('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '거래처 정보 생성', description: '신규 거래처 정보를 생성합니다.' })
  async createCustomerInfo(
    // @Body('customerNumber', NotEmptyStringPipe) bodyCustomerNumber: string,
    // @Body('customerName', NotEmptyStringPipe) bodyCustomerName: string,
    // @Body('customerCeo', NotEmptyStringPipe) bodyCustomerCeo: string,
    @Body() createCustomerInfoDto: CreateCustomerInfoDto,
    @Req() req: Request & { user: { username: string } },  // 추가
  ) {
    try {
      const result = await this.createCustomerInfoService.createCustomerInfo(
        createCustomerInfoDto,
        req.user.username,
      );

      // 상세 로그 생성
      await this.logService.createDetailedLog({
        moduleName: '거래처관리',
        action: 'CREATE',
        username: req.user.username, // 생성자 정보
        targetId: result.customerNumber,
        targetName: result.customerName,
        details: '새로운 거래처 정보 생성',
      });

      return ApiResponseBuilder.success(result, '거래처 정보 등록되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.logService
        .createDetailedLog({
          moduleName: '거래처관리',
          action: 'CREATE_FAIL',
          username: req.user.username, // 생성자 정보
          targetId: createCustomerInfoDto.customerNumber,
          targetName: createCustomerInfoDto.customerName,
          details: `생성 실패: ${(error as Error).message}`,
        })
        .catch(() => {});

      throw error;
    }
  }
}