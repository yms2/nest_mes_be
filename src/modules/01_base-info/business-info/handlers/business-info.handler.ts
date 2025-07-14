import { Injectable } from '@nestjs/common';
import { BusinessInfoReadService } from '../services/business-info-read.service';
import { BusinessInfoSearchService } from '../services/business-info-search.service';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';

@Injectable()
export class BusinessInfoHandler {
  constructor(
    private readonly businessInfoReadService: BusinessInfoReadService,
    private readonly businessInfoSearchService: BusinessInfoSearchService,
  ) {}

  async handleSingleRead(query: ReadBusinessInfoDto) {
    const result = await this.businessInfoReadService.getBusinessInfoByNumber(query);
    return ApiResponseBuilder.success(result, '사업장 정보(단일) 조회되었습니다.');
  }

  async handleSearch(search: string, pagination: PaginationDto) {
    const result = await this.businessInfoSearchService.searchBusinessInfo(search, pagination.page, pagination.limit);
    return buildPaginatedResponse(result.data, result.page, result.limit, result.total, '사업장 정보 통합검색이 완료되었습니다.');
  }

  async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
    const result = await this.businessInfoSearchService.searchBusinessInfoByDateRange(startDate, endDate, pagination.page, pagination.limit);
    return buildPaginatedResponse(result.data, result.page, result.limit, result.total, '사업장 정보 날짜 범위 검색이 완료되었습니다.');
  }

  async handleListRead(pagination: PaginationDto) {
    const result = await this.businessInfoReadService.getAllBusinessInfo(pagination.page, pagination.limit);
    return buildPaginatedResponse(result.data, result.page, result.limit, result.total, '사업장 정보 전체 조회되었습니다.');
  }
}
