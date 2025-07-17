import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { BusinessBankCreateService } from '../services/business-bank-create.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateBusinessBankDto } from '../dto/create-business-bank.dto';
import { BusinessBank } from '../entities/business-bank.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('BusinessBank')
@Controller('business-bank')
export class BusinessBankCreateController {
  constructor(
    private readonly businessBankCreateService: BusinessBankCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({
    summary: '사업장 은행 정보 생성',
    description: '신규 사업장 은행 정보를 생성합니다.',
  })
  async createBusinessBank(
    @Body() createBusinessDto: CreateBusinessBankDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.businessBankCreateService.createBusinessBank(
        createBusinessDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '사업장 은행 정보가 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createBusinessDto, req.user.username, error);
      throw error;
    }
  }

  private async writeCreateLog(result: BusinessBank, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '사업장 관리',
      action: 'CREATE',
      username,
      targetId: result.businessCode,
      targetName: result.bankName,
      details: '새로운 사업장 은행 정보 생성',
    });
  }

  private async writeCreateFailLog(dto: CreateBusinessBankDto, username: string, error: Error) {
    await this.logService
      .createDetailedLog({
        moduleName: '사업장 관리',
        action: 'CREATE_FAIL',
        username,
        targetId: '',
        targetName: dto.bankName,
        details: `생성 실패: ${error.message}`,
      })
      .catch(() => {});
  }
}
