import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { SearchProcessInfoDto } from '../dto/process-search.dto';
import { DevProcessInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProcessHandler } from '../handlers/process-handler';

@ApiTags('ProcessInfo')
@Controller('process-info')
@UseInterceptors(ClassSerializerInterceptor)
export class ProcessReadController {
    constructor(private readonly processHandler: ProcessHandler) {}

    @Get()
    @DevProcessInfoAuth.read()
    @ApiOperation({ summary: '공정 정보 조회/검색', description: '조건별 공정 정보 조회' })
    @ApiQuery({ name: 'processCode', required: false, description: '공정 코드 (정확 매칭)' })
    @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색)' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
    async getProcessInfo(@Query() query: SearchProcessInfoDto) {
        const pagination: PaginationDto = {
            page: query.page || 1,
            limit: query.limit || 10,
        };

        if (query.processCode) {
            return this.processHandler.handleSingleRead(query);
        }

        if (query.startDate && query.endDate) {
            return this.processHandler.handleDateRangeSearch(
                query.startDate,
                query.endDate,
                pagination,
            );
        }

        if (query.search && query.search.trim() !== '') {
            return this.processHandler.handleSearch(query.search, pagination);
        }

        return this.processHandler.handleListRead(pagination);
    }
}