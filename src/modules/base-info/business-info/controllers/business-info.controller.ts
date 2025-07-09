import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { Auth } from '../../../../common/decorators/auth.decorator';
import { BusinessInfoHandler } from '../handlers/business-info.handler';

interface PaginationDto {
  page: number;
  limit: number;
}

@ApiTags('BusinessInfo')
@Controller('business-info')
@UseInterceptors(ClassSerializerInterceptor)
export class BusinessInfoController {
  constructor(private readonly businessInfoHandler: BusinessInfoHandler) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: '사업장 정보 조회/검색', description: '조건별 사업장 정보 조회' })
  @ApiQuery({ name: 'businessNumber', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getBusinessInfo(
    @Query() query: ReadBusinessInfoDto,
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (query.businessNumber) {
      return this.businessInfoHandler.handleSingleRead(query);
    }

    if (startDate && endDate) {
      return this.businessInfoHandler.handleDateRangeSearch(startDate, endDate, pagination);
    }

    if (search) {
      return this.businessInfoHandler.handleSearch(search, pagination);
    }

    return this.businessInfoHandler.handleListRead(pagination);
  }
}