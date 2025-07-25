import { Put, Controller, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerBankUpdateService } from '../services/customer-bank-update.service';
import { CustomerBank } from '../entities/customer-bank.entity';
import { CreateCustomerBankDto } from '../dto/customer-bank-create.dto';

@ApiTags('CustomerBank')
@Controller('customer-bank')
export class CustomerBankUpdateController {
  constructor(
    private readonly customerBankUpdateService: CustomerBankUpdateService,
    private readonly logService: logService,
  ){}

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: '거래처 계좌 정보 수정', description: '기존 거래처 계좌 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '거래처 계좌 ID', example: '1' })
  async updateCustomerBank(
    @Param('id') id: number,
    @Body() createCustomerBankDto: CreateCustomerBankDto,
    @Req() req: Request & { user: { username: string } }, // 추가
  ) {
    try {
      const result = await this.customerBankUpdateService.updateCustomerBank(
        id,
        createCustomerBankDto,
        req.user.username, // 수정자 정보
      );

      await this.writeUpdateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '거래처 계좌 정보가 수정되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.writeUpdateFailLog(createCustomerBankDto, req.user.username, error);
      throw error;
    }
  }
  
     private async writeUpdateLog(result: CustomerBank, username: string) {
      await this.logService.createDetailedLog({
        moduleName: '거래처계좌관리',
        action: 'UPDATE',
        username,
        targetId: result.id.toString(),
        targetName: result.accountNumber,
        details: '새로운 거래처 계좌 정보 수정',
      });
     }
  
      private async writeUpdateFailLog(dto: CreateCustomerBankDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
          moduleName: '거래처계좌관리',
          action: 'UPDATE_FAIL',
          username,
          targetId:'',
          targetName: dto.accountNumber,
          details: `거래처 계좌 정보 수정 실패: ${error.message}`,
        });
      }
}