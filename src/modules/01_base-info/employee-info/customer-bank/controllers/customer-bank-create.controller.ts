import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { CustomerBankCreateService } from '../services/customer-bank-create.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateCustomerBankDto } from '../dto/customer-bank-create.dto';
import { CustomerBank } from '../entities/customer-bank.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('CustomerBank')
@Controller('customer-bank')
export class CustomerBankCreateController {
  constructor(
    private readonly customerBankCreateService: CustomerBankCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({
    summary: '거래처 은행 정보 생성',
    description: '신규 거래처 은행 정보를 생성합니다.',
  })
  async createCustomerBank(
    @Body() createCustomerBankDto: CreateCustomerBankDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.customerBankCreateService.createCustomerBank(
        createCustomerBankDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '거래처 은행 정보가 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createCustomerBankDto, req.user.username, error);
      throw error;
    }
  }

  private async writeCreateLog(result: CustomerBank, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '거래처 계좌 관리',
      action: 'CREATE',
      username,
      targetId: result.customerCode,
      targetName: result.bankName,
      details: '새로운 거래처 은행 정보 생성',
    });
  }

  private async writeCreateFailLog(dto: CreateCustomerBankDto, username: string, error: Error) {
    await this.logService.createDetailedLog({
      moduleName: '거래처 계좌 관리',
      action: 'CREATE_FAIL',
      username,
      targetId: '',
      targetName: '',
      details: `거래처 은행 정보 생성 실패: ${error.message}`,
    });
  }

}