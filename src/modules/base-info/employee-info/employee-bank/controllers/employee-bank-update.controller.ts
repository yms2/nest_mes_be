import { Put, Controller, Param, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

import { logService } from 'src/modules/log/Services/log.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeBankUpdateService } from '../services/employee-bank-update.service';
import { EmployeeBank } from '../entities/employee-bank.entity';
import { CreateEmployeeBankDto } from '../dto/employee-bank-create.dto';

@ApiTags('EmployeeBank')
@Controller('employee-bank')
export class EmployeeBankUpdateController {
  constructor(
    private readonly employeeBankUpdateService: EmployeeBankUpdateService,
    private readonly logService: logService,
  ){}

  @Put(':id')
  @Auth()
  @ApiOperation({ summary: '직원 계좌 정보 수정', description: '기존 직원 계좌 정보를 수정합니다.' })
  @ApiParam({ name: 'id', description: '직원 계좌 ID', example: '1' })
  async updateEmployeeBank(
    @Param('id') id: number,
    @Body() createEmployeeBankDto: CreateEmployeeBankDto,
    @Req() req: Request & { user: { username: string } }, // 추가
  ) {
    try {
      const result = await this.employeeBankUpdateService.updateEmployeeBank(
        id,
        createEmployeeBankDto,
        req.user.username, // 수정자 정보
      );

      await this.writeUpdateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '직원 계좌 정보가 수정되었습니다.');
    } catch (error) {
      // 에러 로그 생성
      await this.writeUpdateFailLog(createEmployeeBankDto, req.user.username, error);
      throw error;
    }
  }
  
     private async writeUpdateLog(result: EmployeeBank, username: string) {
      await this.logService.createDetailedLog({
        moduleName: '직원계좌관리',
        action: 'UPDATE',
        username,
        targetId: result.id.toString(),
        targetName: result.accountNumber,
        details: '새로운 직원 계좌 정보 수정',
      });
     }
  
      private async writeUpdateFailLog(dto: CreateEmployeeBankDto, username: string, error: Error) {
        await this.logService.createDetailedLog({
          moduleName: '직원계좌관리',
          action: 'UPDATE_FAIL',
          username,
          targetId:'',
          targetName: dto.accountNumber,
          details: `직원 계좌 정보 수정 실패: ${error.message}`,
        });
      }
}