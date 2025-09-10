import { Injectable } from '@nestjs/common';

import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductInfoReadService } from '../services/product-info-read.service';
import { ProductInfoSearchService } from '../services/product-info-search.service';

@Injectable()
export class ProductInfoHandler {
  constructor(
    private readonly productInfoReadService: ProductInfoReadService,
    private readonly productInfoSearchService: ProductInfoSearchService,
  ) {}

  async handleSearch(search: string, pagination: PaginationDto) {
    const result = await this.productInfoSearchService.searchProductInfo(
      search,
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(
      result.data,
      result.page,
      result.limit,
      result.total,
      '품목 정보 통합검색이 완료되었습니다.',
    );
  }

  async handleSearchByField(fieldName: string, keyword: string, pagination: PaginationDto) {
    const result = await this.productInfoSearchService.searchProductInfoByField(
      fieldName,
      keyword,
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(
      result.data,
      result.page,
      result.limit,
      result.total,
      `품목 정보 ${fieldName} 검색이 완료되었습니다.`,
    );
  }

  async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
    const result = await this.productInfoSearchService.searchProductInfoByDateRange(
      startDate,
      endDate,
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(
      result.data,
      result.page,
      result.limit,
      result.total,
      '거래처 정보 날짜 범위 검색이 완료되었습니다.',
    );
  }

  async handleListRead(pagination: PaginationDto) {
    const result = await this.productInfoReadService.getAllProductInfo(
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(
      result.data,
      result.page,
      result.limit,
      result.total,
      '거래처 정보 전체 조회되었습니다.',
    );
  }
}
