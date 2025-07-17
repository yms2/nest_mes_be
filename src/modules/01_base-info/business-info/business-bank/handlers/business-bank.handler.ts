import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessBankReadService } from '../services/business-bank-read.service';
import { BusinessBankSearchService } from '../services/business-bank-search.service';
import { ReadBusinessBankDto } from '../dto/read-business-bank.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { BaseSearchDto } from 'src/common/dto/base-search.dto';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class BusinessBankHandler {
  constructor(
    private readonly businessBankReadService: BusinessBankReadService,
    private readonly businessBankSearchService: BusinessBankSearchService,
  ) {}

async handleSingleRead(query: ReadBusinessBankDto) {
  const pagination: PaginationDto = {
    page: query.page || 1,
    limit: query.limit || 10,
  };

  // 필수: businessCode가 반드시 존재해야 함
  if (!query.businessCode) {
    throw new BadRequestException('사업장 코드는 필수입니다.');
  }

  // 🔍 검색어가 있는 경우 → businessCode 내에서 검색
  if (query.search && query.search.trim() !== '') {
    const { data, total } =
      await this.businessBankReadService.getBusinessBanksWithSearchAndPaging(query, pagination);

    return ApiResponseBuilder.paginated(
      data,
      pagination.page,
      pagination.limit,
      total,
      '사업장 내 검색 결과가 조회되었습니다.',
    );
  }

  // ✅ 검색어 없을 경우 → businessCode 내 전체 조회 (페이징)
  const { data, total } =
    await this.businessBankReadService.getBusinessBanksWithSearchAndPaging(query, pagination);

  return ApiResponseBuilder.paginated(
    data,
    pagination.page,
    pagination.limit,
    total,
    '사업장 계좌 목록이 조회되었습니다.',
  );
}

}
