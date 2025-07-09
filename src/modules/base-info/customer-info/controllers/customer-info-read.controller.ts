import { ClassSerializerInterceptor, Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Auth } from "src/common/decorators/auth.decorator";
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CustomerInfoHandler } from "../handlers/customer-info.handler";
import { SearchCustomerInfoDto } from "../dto/customer-info-search.dto";

@ApiTags('CustomerInfo')
@Controller('customer-info')
@UseInterceptors(ClassSerializerInterceptor)
export class CustomerInfoReadController {
  constructor(
    private readonly customerInfoHandler: CustomerInfoHandler,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: '거래처 검색/조회', description: '거래처 정보를 검색하거나 조회합니다.' })
  @ApiQuery({ name: 'customerNumber', required: false })
  @ApiQuery({ name: 'search', required: false, description: '검색어' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
  async getCustomerInfo(
    @Query() query: SearchCustomerInfoDto,
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (query.customerNumber) {
      return this.customerInfoHandler.handleSingleRead(query);
    }

    if (startDate && endDate) {
      return this.customerInfoHandler.handleDateRangeSearch(startDate, endDate, pagination);
    }

    if (search) {
      return this.customerInfoHandler.handleSearch(search, pagination);
    }

      return this.customerInfoHandler.handleListRead(pagination);
  }
}