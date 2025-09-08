import { Put, Controller, Param, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { CustomerInfoDeleteService } from '../services/customer-info-delete.service';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { DevCustomerInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';

@ApiTags('CustomerInfo')
@Controller('customer-info')
export class CustomerInfoDeleteController {
  constructor(
    private readonly customerInfoDeleteService: CustomerInfoDeleteService,
    private readonly logService: logService,
  ) {}

  @Delete(':id')
  @DevCustomerInfoAuth.delete()
  @ApiOperation({
    summary: '거래처 정보 영구 삭제',
    description: '거래처 정보를 영구적으로 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: 'ID', example: '1' })
  async deleteCustomerInfo(
    @Param('id') id: string,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      await this.customerInfoDeleteService.hardDeleteCustomerInfo(Number(id));
      await this.writeDeleteLog(id, req.user.username);
      return ApiResponseBuilder.success(null, '거래처 정보가 삭제되었습니다.');
    } catch (error) {
      await this.writeDeleteFailLog(id, req.user.username, error);
      throw error;
    }
  }

  private async writeDeleteLog(id: string, username: string) {  
      await this.logService.createDetailedLog({
        moduleName: '거래처관리',
        action: 'HARD_DELETE',
        username,
        targetId: id,
        targetName: id,
        details: '거래처 정보 영구 삭제',
      });
    }

    private async writeDeleteFailLog(id: string, username: string, error: Error) {
      await this.logService
        .createDetailedLog({
          moduleName: '거래처관리',
          action: 'HARD_DELETE_FAIL',
          username,
          targetId: id,
          targetName: id,
          details: `거래처 정보 영구 삭제 실패: ${error.message}`,
        })
        .catch(() => {});
    }
}
