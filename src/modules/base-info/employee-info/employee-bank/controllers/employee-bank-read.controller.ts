import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { EmployeeBankHandler } from '../handlers/employee-bank.handler';
import { ReadEmployeeBankDto } from '../dto/employee-bank-read.dto';

@ApiTags('EmployeeBank')
@Controller('employee-bank')
export class EmployeeBankReadController {
  constructor(private readonly employeeBankHandler: EmployeeBankHandler) {}

  @Get(':employeeCode')
  @Auth()
  @ApiOperation({
    summary: '직원 은행 정보 조회',
    description: '직원 은행 정보를 조회/검색합니다.',
  })
  @ApiParam({ name: 'employeeCode', description: '직원 코드 (정확 매칭)' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async readSingle(
    @Param('employeeCode') employeeCode: string,
    @Query() query: Omit<ReadEmployeeBankDto, 'employeeCode'>,
  ) {
    const dto: ReadEmployeeBankDto = { ...query, employeeCode };
    return this.employeeBankHandler.handleSingleRead(dto);
  }
}