import { Injectable } from '@nestjs/common';
import { ProcessReadService } from '../services/process-read.service';
import { SearchProcessInfoDto } from '../dto/process-search.dto';
import { ApiResponseBuilder } from 'src/common/interfaces/api-response.interface';
import { buildPaginatedResponse } from 'src/common/utils/pagination.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProcessSearchService } from '../services/process-search.service';

@Injectable()
export class ProcessHandler {
    constructor(
        private readonly processReadService: ProcessReadService,
        private readonly processSearchService: ProcessSearchService,
    ) {}

    async handleSingleRead(query: SearchProcessInfoDto) {
        const result = await this.processReadService.getProcessInfoByNumber(query);
        return ApiResponseBuilder.success(result, '공정 정보(단일) 조회되었습니다.');
    }

    async handleSearch(search: string, pagination: PaginationDto) {
        const result = await this.processSearchService.searchProcessInfo(search, pagination.page, pagination.limit);
        return buildPaginatedResponse(result.data, result.page, result.limit, result.total);
    }
    
    async handleDateRangeSearch(startDate: string, endDate: string, pagination: PaginationDto) {
        const result = await this.processSearchService.searchProcessInfoByDateRange(
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
            '공정 정보 날짜 범위 검색이 완료되었습니다.',
        );
    }

    async handleListRead(pagination: PaginationDto) {
        const result = await this.processReadService.getAllProcessInfo(pagination.page, pagination.limit);
        return buildPaginatedResponse(result.data, result.page, result.limit, result.total);
    }
}