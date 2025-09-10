import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { logService } from 'src/modules/log/Services/log.service';
import { EmployeeBankCreateService } from '../services/employee-bank-create.service';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CreateEmployeeBankDto } from '../dto/employee-bank-create.dto';
import { EmployeeBank } from '../entities/employee-bank.entity';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@ApiTags('EmployeeBank')
@Controller('employee-bank')
export class EmployeeBankCreateController {
  constructor(
    private readonly employeeBankCreateService: EmployeeBankCreateService,
    private readonly logService: logService,
  ) {}

  @Post()
  @Auth()
  @ApiOperation({
    summary: '직원 은행 정보 생성',
    description: '신규 직원 은행 정보를 생성합니다.',
  })
  async createEmployeeBank(
    @Body() createEmployeeBankDto: CreateEmployeeBankDto,
    @Req() req: Request & { user: { username: string } },
  ) {
    try {
      const result = await this.employeeBankCreateService.createEmployeeBank(
        createEmployeeBankDto,
        req.user.username,
      );

      await this.writeCreateLog(result, req.user.username);

      return ApiResponseBuilder.success(result, '직원 은행 정보가 등록되었습니다.');
    } catch (error) {
      await this.writeCreateFailLog(createEmployeeBankDto, req.user.username, error);
      throw error;
    }
  }

  private async writeCreateLog(result: EmployeeBank, username: string) {
    await this.logService.createDetailedLog({
      moduleName: '직원 계좌 관리',
      action: 'CREATE',
      username,
      targetId: result.employeeCode,
      targetName: result.bankName,
      details: '새로운 직원 은행 정보 생성',
    });
  }

  private async writeCreateFailLog(dto: CreateEmployeeBankDto, username: string, error: Error) {
    await this.logService.createDetailedLog({
      moduleName: '직원 계좌 관리',
      action: 'CREATE_FAIL',
      username,
      targetId: '',
      targetName: '',
      details: `직원 은행 정보 생성 실패: ${error.message}`,
    });
  }

}