import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeBankReadService } from '../services/employee-bank-read.service';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';  
import { ReadEmployeeBankDto } from '../dto/employee-bank-read.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class EmployeeBankHandler {
  constructor(
    private readonly employeeBankReadService: EmployeeBankReadService,
  ) {}

  async handleSingleRead(query: ReadEmployeeBankDto) {
    const pagination: PaginationDto = {
      page: query.page || 1,
      limit: query.limit || 10,
    };

    // 필수: employeeCode가 반드시 존재해야 함
    if (!query.employeeCode) {
      throw new BadRequestException('직원 코드는 필수입니다.');
    }

    // 🔍 검색어가 있는 경우 → employeeCode 내에서 검색
    if (query.search && query.search.trim() !== '') {
      const { data, total } =
        await this.employeeBankReadService.getEmployeeBanksWithSearchAndPaging(query, pagination);

      return ApiResponseBuilder.paginated(
        data,
        pagination.page,
        pagination.limit,
        total,
        '직원 내 검색 결과가 조회되었습니다.',
      );
    }

    // ✅ 검색어 없을 경우 → employeeCode 내 전체 조회 (페이징)
    const { data, total } =
      await this.employeeBankReadService.getEmployeeBanksWithSearchAndPaging(query, pagination);

    return ApiResponseBuilder.paginated(
      data,
      pagination.page,
      pagination.limit,
      total,
      '직원 계좌 목록이 조회되었습니다.',
    );
  }
}