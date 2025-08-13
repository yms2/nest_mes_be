import { Injectable } from '@nestjs/common';
import { EmployeeReadService } from '../services/employee-read.service';
import { SearchEmployeeDto } from '../dto/employee-search.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { EmployeeSearchService } from '../services/employee-search.service';

@Injectable()
export class EmployeeInfoHandler {
    constructor(
            private readonly employeeReadService: EmployeeReadService,
            private readonly employeeSearchService: EmployeeSearchService,
    ) {}

    async handleSingleRead(query: SearchEmployeeDto) {
        const result = await this.employeeReadService.getEmployeeByCode(query);
        return ApiResponseBuilder.success(result, '직원 정보(단일) 조회되었습니다.');
    }

    async handleSearch(search: string, pagination: PaginationDto) {
        const result = await this.employeeSearchService.searchEmployee(
            search,
            pagination.page,
            pagination.limit,
        );
        return buildPaginatedResponse(
            result.data,
            result.page,
            result.limit,
            result.total,
            '직원 정보 통합검색이 완료되었습니다.',
        );
    }

    async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
        const result = await this.employeeSearchService.searchEmployeeByDateRange(
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
            '직원 정보 날짜 범위 검색이 완료되었습니다.',
        );
    }

    async handleListRead(pagination: PaginationDto) {
        const result = await this.employeeReadService.getAllEmployee(
            pagination.page,
            pagination.limit,
        );
        return buildPaginatedResponse(
            result.data,
            result.page,
            result.limit,
            result.total,
            '직원 정보 전체 조회되었습니다.',
        );
    }
}