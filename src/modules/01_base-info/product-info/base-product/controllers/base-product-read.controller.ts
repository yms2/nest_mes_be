import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { BaseProductReadDto } from '../dto/base-product-read.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { BaseProductReadService } from '../services/base-product-read.service';
import { BaseProductHandler } from '../handlers/base-product.handler';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('BaseProduct')
@Controller('base-product')
@UseInterceptors(ClassSerializerInterceptor)
export class BaseProductReadController {
  constructor(
    private readonly baseProductReadService: BaseProductReadService,
    private readonly baseProductHandler: BaseProductHandler,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: '기본 제품 정보 조회/검색', description: '조건별 기본 제품 정보 조회' })
  @ApiResponse({ status: 200, description: '기본 제품 정보 목록을 반환합니다.' })
  async findAll(@Query() query: BaseProductReadDto) {
    const pagination: PaginationDto = {
      page: query.page || 1,
      limit: query.limit || 10,
    };

    // 제품 코드 검색
    if (query.productCode && query.productCode.trim() !== '') {
      return await this.baseProductHandler.handleProductCodeSearch(query.productCode, pagination);
    }

    // 날짜 범위 + 검색어 (둘 다 있을 때)
    if (query.startDate && query.endDate && query.search && query.search.trim() !== '') {
      return await this.baseProductHandler.handleDateRangeWithSearch(
        query.startDate,
        query.endDate,
        query.search,
        pagination,
      );
    }

    // 날짜 범위 검색 (검색어 없을 때)
    if (query.startDate && query.endDate) {
      return await this.baseProductHandler.handleDateRangeSearch(
        query.startDate,
        query.endDate,
        pagination,
      );
    }

    // 통합 검색 (날짜 범위 없을 때)
    if (query.search && query.search.trim() !== '') {
      return await this.baseProductHandler.handleSearch(query.search, pagination);
    }

    // 전체 목록 조회
    return await this.baseProductHandler.handleListRead(pagination);
  }
}