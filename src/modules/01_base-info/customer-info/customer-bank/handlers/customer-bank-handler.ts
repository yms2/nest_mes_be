import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CustomerBankReadService } from '../services/customer-bank-read.service';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { ReadCustomerBankDto } from '../dto/customer-bank-read.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CustomerBankHandler {
  constructor(
    private readonly customerBankReadService: CustomerBankReadService,
  ) {}

  async handleSingleRead(query: ReadCustomerBankDto) {
    const pagination: PaginationDto = {
      page: query.page || 1,
      limit: query.limit || 10,
    };

    // 필수: customerCode가 반드시 존재해야 함
    if (!query.customerCode) {
      throw new BadRequestException('거래처 코드는 필수입니다.');
    }

    // 🔍 검색어가 있는 경우 → customerCode 내에서 검색
    if (query.search && query.search.trim() !== '') {
      const { data, total } =
        await this.customerBankReadService.getCustomerBanksWithSearchAndPaging(query, pagination);

      return ApiResponseBuilder.paginated(
        data,
        pagination.page,
        pagination.limit,
        total,
        '거래처 내 검색 결과가 조회되었습니다.',
      );
    }

    // ✅ 검색어 없을 경우 → customerCode 내 전체 조회 (페이징)
    const { data, total } =
      await this.customerBankReadService.getCustomerBanksWithSearchAndPaging(query, pagination);

    return ApiResponseBuilder.paginated(
      data,
      pagination.page,
      pagination.limit,
      total,
      '거래처 계좌 목록이 조회되었습니다.',
    );
  }
}