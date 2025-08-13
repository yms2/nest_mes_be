import { Put, Controller, Param, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CustomerBankDeleteService } from '../services/customer-bank-delete.service';


@ApiTags('CustomerBank')
@Controller('customer-bank')
export class CustomerBankDeleteController {
  constructor(
    private readonly customerBankDeleteService: CustomerBankDeleteService,
    private readonly logService: logService,
  ) {}

  @Delete(':id')
  @Auth()
  @ApiOperation({
    summary: '거래처 은행 정보 영구 삭제',
    description: '거래처 은행 정보를 영구적으로 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: 'ID', example: '1' })
  async deleteCustomerBank(
    @Param('id') id: string,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      await this.customerBankDeleteService.hardDeleteCustomerBank(Number(id));

      await this.logService.createDetailedLog({
        moduleName: '거래처 계좌관리',
        action: 'HARD_DELETE',
        username: req.user.username,
        targetId: id,
        details: '거래처 은행 정보 영구 삭제',
      });

      return ApiResponseBuilder.success(null, '거래처 계좌 정보가 삭제되었습니다.');
    } catch (error) {
      await this.logService
        .createDetailedLog({
          moduleName: '거래처 계좌관리',
          action: 'HARD_DELETE_FAIL',
          username: req.user.username,
          targetId: id,
          details: `영구 삭제 실패: ${(error as Error).message}`,
        })
        .catch(() => {});

      throw error;
    }
  }
}