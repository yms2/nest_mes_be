import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { BusinessInfoSearchService } from '../services/business-info-search.service';
import { BusinessInfoReadService } from '../services/business-info-read.service';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { ApiResponseBuilder } from '../../../../common/interfaces/api-response.interface';
import { buildPaginatedResponse } from '../../../../common/utils/pagination.util';
import { Auth } from '../../../../common/decorators/auth.decorator';

interface PaginationDto {
  page: number;
  limit: number;
}

@ApiTags('BusinessInfo')
@Controller('business-info')
@UseInterceptors(ClassSerializerInterceptor)
export class BusinessInfoController {
  constructor(
    private readonly businessInfoReadService: BusinessInfoReadService,
    private readonly businessInfoSearchService: BusinessInfoSearchService,
  ) {}

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
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = this.getPagination(page, limit);

    if (query.businessNumber) {
      return this.handleSingleRead(query);
    }

    if (startDate && endDate) {
      return this.handleDateRangeSearch(startDate, endDate, pagination);
    }

    if (search) {
      return this.handleSearch(search, pagination);
    }

    return this.handleListRead(pagination);
  }

  private getPagination(page?: number, limit?: number): PaginationDto {
    return {
      page: page || 1,
      limit: limit || 10,
    };
  }

  private async handleSingleRead(query: ReadBusinessInfoDto) {
    const result = await this.businessInfoReadService.getBusinessInfoByNumber(query);
    return ApiResponseBuilder.success(result, '사업장 정보 조회되었습니다.');
  }

  private async handleSearch(search: string, pagination: PaginationDto) {
    const result = await this.businessInfoSearchService.searchBusinessInfo(
      search,
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(
      result.data,
      result.page,
      result.limit,
      result.total,
      '사업장 정보 통합검색이 완료되었습니다.',
    );
  }

  private async handleListRead(pagination: PaginationDto) {
    const result = await this.businessInfoReadService.getAllBusinessInfo(
      pagination.page,
      pagination.limit,
    );
    return buildPaginatedResponse(
      result.data,
      result.page,
      result.limit,
      result.total,
      '사업장 정보 전체 조회되었습니다.',
    );
  }

  private async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
    const result = await this.businessInfoSearchService.searchBusinessInfoByDateRange(
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
      '사업장 정보 날짜 범위 검색이 완료되었습니다.',
    );
  }
}