import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  UseInterceptors,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { BusinessInfoCreateService } from '../services/business-info-create.service';
import { BusinessInfoSearchService } from '../services/business-info-search.service';
import { CreateBusinessInfoDto } from '../dto/create-business-info.dto';
import { UpdateBusinessInfoDto } from '../dto/update-business-info.dto';
import { ReadBusinessInfoDto } from '../dto/read-business-info.dto';
import { BusinessInfoReadService } from '../services/business-info-read.service';
import { BusinessInfoUpdateService } from '../services/business-info-update.service';
import { BusinessInfoDeleteService } from '../services/business-info-delete.service';
import { logService } from '../../../log/Services/log.service';
import { ApiResponseBuilder } from '../../../../common/interfaces/api-response.interface';
import { NotEmptyStringPipe } from '../../../../common/pipes/not-empty-string.pipe';
import { buildPaginatedResponse } from '../../../../common/utils/pagination.util';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  page?: number;
  limit?: number;
  total?: number;
}

@ApiTags('BusinessInfo')
@Controller('business-info')
@UseInterceptors(ClassSerializerInterceptor)
export class BusinessInfoController {
  constructor(
    private readonly businessInfoReadService: BusinessInfoReadService,
    private readonly businessInfoSearchService: BusinessInfoSearchService,
    private readonly logService: logService,
  ) {}


  @Get('')
  @ApiOperation({
    summary: '사업장 정보 조회/검색',
    description:
      'businessNumber: 단일 조회, search: 통합검색, startDate/endDate: 날짜 범위 검색, 둘 다 없으면: 전체 조회',
  })
  @ApiQuery({ name: 'businessNumber', required: false, description: '사업자번호 (단일 조회용)' })
  @ApiQuery({ name: 'search', required: false, description: '검색어 (통합검색용)' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수 (기본값: 10)' })
  async getBusinessInfo(
    @Query() query: ReadBusinessInfoDto,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const pagination = this.getPagination(page, limit);

    let result: ApiResponse;

    // 단일 조회 (우선순위 최고)
    if (query.businessNumber) {
      result = await this.handleSingleRead(query);
    }
    // 날짜 범위 검색 (우선순위 높음)
    else if (startDate && endDate) {
      result = await this.handleDateRangeSearch(startDate, endDate, pagination);
    }
    // 통합검색 (우선순위 중간)
    else if (search) {
      result = await this.handleSearch(search, pagination);
    }
    // 전체 조회 (기본값)
    else {
      result = await this.handleListRead(pagination);
    }

    return result;
  }

  private getPagination(page?: number, limit?: number) {
    return {
      page: page || 1,
      limit: limit || 10,
    };
  }

  private async handleSingleRead(query: ReadBusinessInfoDto) {
    const result = await this.businessInfoReadService.readBusinessInfo(query);
    return ApiResponseBuilder.success(result, '사업장 정보 조회되었습니다.');
  }

  private async handleSearch(search: string, pagination: { page: number; limit: number }) {
    const result = await this.businessInfoSearchService.search(
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

  private async handleListRead(pagination: { page: number; limit: number }) {
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

  private async handleDateRangeSearch(
    startDate: string,
    endDate: string,
    pagination: { page: number; limit: number },
  ) {
    const result = await this.businessInfoSearchService.searchByDateRange(
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
