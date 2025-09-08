import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { DevProductInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductInfoHandler } from '../handlers/product-info.handler';
import { SearchProductInfoDto } from '../dto/product-info-read.dto';
@ApiTags('ProductInfo')
@Controller('product-info')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductInfoReadController {
  constructor(private readonly productInfoHandler: ProductInfoHandler) {}

  @Get()
  @DevProductInfoAuth.read()
  @ApiOperation({ summary: '품목 정보 조호/검색', description: '조건별 품목 정보 조회' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
  @ApiQuery({ name: 'productName', required: false, description: '품명 (포함 검색)' })
  async getProductInfo(@Query() query: SearchProductInfoDto) {
    const pagination: PaginationDto = {
      page: query.page || 1,
      limit: query.limit || 10,
    };

    // 날짜 범위 검색
    if (query.startDate && query.endDate) {
      return this.productInfoHandler.handleDateRangeSearch(
        query.startDate,
        query.endDate,
        pagination,
      );
    }

    // 품명이 있으면 search 값 무시하고 포함 검색
    if (query.productName && query.productName.trim() !== '') {
      return this.productInfoHandler.handleSearchByField('productName', query.productName, pagination);
    }

    // 통합 검색 (search만)
    if (query.search && query.search.trim() !== '') {
      return this.productInfoHandler.handleSearch(query.search, pagination);
    }

    // 전체 목록 조회
    return this.productInfoHandler.handleListRead(pagination);
  }
}
