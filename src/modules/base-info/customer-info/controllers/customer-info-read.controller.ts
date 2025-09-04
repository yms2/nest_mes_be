import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { SearchCustomerInfoDto } from '../dto/customer-info-search.dto';
import { DevCustomerInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { CustomerInfoHandler } from '../handlers/customer-info.handler';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('CustomerInfo')
@Controller('customer-info')
@UseInterceptors(ClassSerializerInterceptor)
export class CustomerInfoReadController {
  constructor(private readonly customerInfoHandler: CustomerInfoHandler) {}

  @Get()
  @DevCustomerInfoAuth.read()
  @ApiOperation({ summary: '거래처 정보 조회/검색', description: '조건별 거래처 정보 조회' })
  @ApiQuery({ name: 'customerNumber', required: false, description: '사업자등록번호 (정확 매칭)' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색)' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
  async getCustomerInfo(@Query() query: SearchCustomerInfoDto) {
    // PaginationDto 생성
    const pagination: PaginationDto = {
      page: query.page || 1,
      limit: query.limit || 10,
    };

    // 사업자등록번호로 단일 조회
    if (query.customerNumber && query.customerNumber.trim() !== '') {
      return this.customerInfoHandler.handleSingleRead(query);
    }

    // 날짜 범위 검색
    if (query.startDate && query.endDate) {
      return this.customerInfoHandler.handleDateRangeSearch(
        query.startDate,
        query.endDate,
        pagination,
      );
    }

    // 통합 검색
    if (query.search && query.search.trim() !== '') {
      return this.customerInfoHandler.handleSearch(query.search, pagination);
    }

    // 전체 목록 조회
    return this.customerInfoHandler.handleListRead(pagination);
  }
}
