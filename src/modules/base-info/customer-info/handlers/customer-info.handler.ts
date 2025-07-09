import { Injectable } from "@nestjs/common";
import { CustomerInfoReadService, CustomerInfoSearchService } from "../services";
import { ReadCustomerInfoDto } from "../dto/customer-info-read.dto";
import { ApiResponseBuilder } from "src/common/interfaces/api-response.interface";
import { buildPaginatedResponse } from "src/common/utils/pagination.util";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Injectable()
export class CustomerInfoHandler {
  constructor(
    private readonly customerInfoReadService: CustomerInfoReadService,
    private readonly customerInfoSearchService: CustomerInfoSearchService,
  ) {}

  async handleSingleRead(query: ReadCustomerInfoDto) {
    const result = await this.customerInfoReadService.getCustomerInfoByNumber(query);
    return ApiResponseBuilder.success(result, '거래처 정보(단일) 조회되었습니다.');
  }

  async handleSearch(search: string, pagination: PaginationDto) {
    const result = await this.customerInfoSearchService.searchCustomerInfo(search, pagination.page, pagination.limit);
    return buildPaginatedResponse(result.data, result.page, result.limit, result.total, '고객 정보 통합검색이 완료되었습니다.');
  }

  async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
    const result = await this.customerInfoSearchService.searchCustomerInfoByDateRange(startDate, endDate, pagination.page, pagination.limit);
    return buildPaginatedResponse(result.data, result.page, result.limit, result.total, '고객 정보 날짜 범위 검색이 완료되었습니다.');
  }

  async handleListRead(pagination: PaginationDto) {
    const result = await this.customerInfoReadService.getAllCustomerInfo(pagination.page, pagination.limit);
    return buildPaginatedResponse(result.data, result.page, result.limit, result.total, '고객 정보 전체 조회되었습니다.');
  }
}