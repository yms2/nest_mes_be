import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags, ApiParam } from '@nestjs/swagger';
import { BusinessBankHandler } from '../handlers/business-bank.handler';
import { ReadBusinessBankDto } from '../dto/read-business-bank.dto';
import { Auth } from 'src/common/decorators/auth.decorator';

@ApiTags('BusinessBank')
@Controller('business-bank')
export class BusinessBankReadController {
  constructor(private readonly businessBankHandler: BusinessBankHandler) {}

  @Get(':businessCode')
  @Auth()
  @ApiOperation({
    summary: '사업장 은행 정보 조회',
    description: '사업장 은행 정보를 조회/검색합니다.',
  })
  @ApiParam({ name: 'businessCode', description: '사업장 코드 (정확 매칭)' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async readSingle(
    @Param('businessCode') businessCode: string,
    @Query() query: Omit<ReadBusinessBankDto, 'businessCode'>,
  ) {
    const dto: ReadBusinessBankDto = { ...query, businessCode };
    return this.businessBankHandler.handleSingleRead(dto);
  }
}
