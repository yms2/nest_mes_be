import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { DevBusinessInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
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
  @DevBusinessInfoAuth.read()
  @ApiOperation({ summary: '사업장 정보 조회/검색', description: '조건별 사업장 정보 조회' })
  @ApiQuery({ name: 'businessNumber', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'businessName', required: false })
  async getBusinessInfo(
    @Query() query: ReadBusinessInfoDto,
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('businessName') businessName?: string,
  ) {
    // 사업자등록번호가 있으면 search 값 무시하고 포함 검색
    if (query.businessNumber && query.businessNumber.trim() !== '') {
      return this.businessInfoHandler.handleSearchByField('businessNumber', query.businessNumber, pagination);
    }

    // 날짜 범위 검색
    if (startDate && endDate) {
      return this.businessInfoHandler.handleDateRangeSearch(startDate, endDate, pagination);
    }

    // 사업자명이 있으면 search 값 무시하고 사업자명으로 포함 검색
    if (businessName && businessName.trim() !== '') {
      return this.businessInfoHandler.handleSearchByField('businessName', businessName, pagination);
    }

    // 통합 검색 (search만)
    if (search && search.trim() !== '') {
      return this.businessInfoHandler.handleSearch(search, pagination);
    }

    // 전체 목록 조회
    return this.businessInfoHandler.handleListRead(pagination);
  }
}
