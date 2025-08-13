import { Put, Controller, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { CreateBusinessBankDto } from '../dto/create-business-bank.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { BusinessBankUpdateService } from '../services/business-bank-update.service';
import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { BusinessBank } from '../entities/business-bank.entity';
import { InjectRepository } from '@nestjs/typeorm';

@ApiTags('BusinessBank')
@Controller('business-bank')
export class BusinessBankUpdateController {
  constructor(
    private readonly businessBankUpdateService: BusinessBankUpdateService,
    private readonly logService: logService,
   ) {}

   @Put(':id')
   @Auth()
   @ApiOperation({ summary: '사업장 계좌 정보 수정', description: '기존 사업장 계좌 정보를 수정합니다.' })
   @ApiParam({ name: 'id', description: '사업장 계좌 ID', example: '1' })

   async updateBusinessBank(
    @Param('id') id: number,
    @Body() createBusinessBankDto: CreateBusinessBankDto,
    @Req() req: Request & { user: { username: string } }, // 추가
   ){
    try {
      const result = await this.businessBankUpdateService.updateBusinessBank(
        id,
        createBusinessBankDto,
        req.user.username, // 수정자 정보
      );

      await this.writeUpdateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '사업장 계좌 정보가 수정되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.writeUpdateFailLog(createBusinessBankDto, req.user.username, error);
      throw error;
    }
   }

   private async writeUpdateLog(result: BusinessBank, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '사업장계좌관리',
      action: 'UPDATE',
      username,
      targetId: result.id.toString(),
      targetName: result.accountNumber,
      details: '새로운 사업장 계좌 정보 수정',
    });
   }

    private async writeUpdateFailLog(dto: CreateBusinessBankDto, username: string, error: Error) {
      await this.logService.createDetailedLog({
        moduleName: '사업장계좌관리',
        action: 'UPDATE_FAIL',
        username,
        targetId:'',
        targetName: dto.accountNumber,
        details: `사업장 계좌 정보 수정 실패: ${error.message}`,
      });
    }
}