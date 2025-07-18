import { Injectable } from '@nestjs/common';
import { BaseProductReadService } from '../services/base-product-read.service';
import { BaseProductReadDto } from '../dto/base-product-read.dto';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BaseProductHandler {
  constructor(
    private readonly baseProductReadService: BaseProductReadService,
  ) {}

  async handleSearch(search: string, pagination: PaginationDto) {
    const searchDto: BaseProductReadDto = {
      ...pagination,
      search,
    };

    const result = await this.baseProductReadService.findAll(searchDto);
    
    return buildPaginatedResponse(
      result.data,
      pagination.page,
      pagination.limit,
      result.total,
      '기본 제품 정보 통합검색이 완료되었습니다.',
    );
  }

  async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
    const searchDto: BaseProductReadDto = {
      ...pagination,
      startDate,
      endDate,
    };

    const result = await this.baseProductReadService.findAll(searchDto);
    
    return buildPaginatedResponse(
      result.data,
      pagination.page,
      pagination.limit,
      result.total,
      '기본 제품 정보 날짜 범위 검색이 완료되었습니다.',
    );
  }

  async handleListRead(pagination: PaginationDto) {
    const searchDto: BaseProductReadDto = {
      ...pagination,
    };

    const result = await this.baseProductReadService.findAll(searchDto);
    
    return buildPaginatedResponse(
      result.data,
      pagination.page,
      pagination.limit,
      result.total,
      '기본 제품 정보 전체 조회되었습니다.',
    );
  }

  async handleProductCodeSearch(productCode: string, pagination: PaginationDto) {
    const searchDto: BaseProductReadDto = {
      ...pagination,
      productCode,
    };

    const result = await this.baseProductReadService.findAll(searchDto);
    
    return buildPaginatedResponse(
      result.data,
      pagination.page,
      pagination.limit,
      result.total,
      '제품 검색이 완료되었습니다.',
    );
  }
} 