import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Auth } from '../../../../../common/decorators/auth.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductInfoHandler } from '../handlers/product-info.handler';
import { SearchProductInfoDto } from '../dto/product-info-read.dto';
@ApiTags('ProductInfo')
@Controller('product-info')
@UseInterceptors(ClassSerializerInterceptor)
export class ProductInfoReadController {
  constructor(private readonly productInfoHandler: ProductInfoHandler) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: '품목 정보 조호/검색', description: '조건별 품목 정보 조회' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
  async getProductInfo(@Query() query: SearchProductInfoDto) {
    const pagination: PaginationDto = {
      page: query.page || 1,
      limit: query.limit || 10,
    };

    if (query.startDate && query.endDate) {
      return this.productInfoHandler.handleDateRangeSearch(
        query.startDate,
        query.endDate,
        pagination,
      );
    }

    if (query.search && query.search.trim() !== '') {
      return this.productInfoHandler.handleSearch(query.search, pagination);
    }

    return this.productInfoHandler.handleListRead(pagination);
  }
}
