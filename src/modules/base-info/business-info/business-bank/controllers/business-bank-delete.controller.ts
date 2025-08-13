import { Put, Controller, Param, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { BusinessBankDeleteService } from '../services/business-bank-delete.service';

@ApiTags('BusinessBank')
@Controller('business-bank')
export class BusinessBankDeleteController {
  constructor(
    private readonly businessBankDeleteService: BusinessBankDeleteService,
    private readonly logService: logService,
  ) {}

  @Delete(':id')
  @Auth()
  @ApiOperation({
    summary: '사업장 은행 정보 영구 삭제',
    description: '사업장 은행 정보를 영구적으로 삭제합니다.',
  })
  @ApiParam({ name: 'id', description: 'ID', example: '1' })
  async deleteBusinessBank(
    @Param('id') id: string,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      await this.businessBankDeleteService.hardDeleteBusinessBank(Number(id));

      await this.logService.createDetailedLog({
        moduleName: '사업장 계좌관리',
        action: 'HARD_DELETE',
        username: req.user.username,
        targetId: id,
        details: '사업장 은행 정보 영구 삭제',
      });

      return ApiResponseBuilder.success(null, '사업장 계좌 정보가 삭제되었습니다.');
    } catch (error) {
      await this.logService
        .createDetailedLog({
          moduleName: '사업장 계좌관리',
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