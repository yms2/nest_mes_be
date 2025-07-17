import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { CustomerBankHandler } from '../handlers/customer-bank-handler';
import { ReadCustomerBankDto } from '../dto/customer-bank-read.dto';

@ApiTags('CustomerBank')
@Controller('customer-bank')
export class CustomerBankReadController {
  constructor(private readonly customerBankHandler: CustomerBankHandler) {}

  @Get(':customerCode')
  @Auth()
  @ApiOperation({
    summary: '거래처 은행 정보 조회',
    description: '거래처 은행 정보를 조회/검색합니다.',
  })
  @ApiParam({ name: 'customerCode', description: '거래처 코드 (정확 매칭)' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async readSingle(
    @Param('customerCode') customerCode: string,
    @Query() query: Omit<ReadCustomerBankDto, 'customerCode'>,
  ) {
    const dto: ReadCustomerBankDto = { ...query, customerCode };
    return this.customerBankHandler.handleSingleRead(dto);
  }
}