import { Controller, Query, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { SearchEmployeeDto } from '../dto/employee-search.dto';
import { DevUserInfoAuth } from '@/common/decorators/dev-menu-permissions.decorator';
import { EmployeeInfoHandler } from '../handlers/employee-info.handler';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('EmployeeInfo')
@Controller('employee-info')
@UseInterceptors(ClassSerializerInterceptor)
export class EmployeeReadController {
    constructor(private readonly employeeInfoHandler: EmployeeInfoHandler) {}

    @Get()
    @DevUserInfoAuth.read()
    @ApiOperation({ summary: '직원 정보 조회/검색', description: '조건별 직원 정보 조회' })
    @ApiQuery({ name: 'employeeCode', required: false, description: '직원 코드 (정확 매칭)' })
    @ApiQuery({ name: 'search', required: false, description: '검색어 (통합 검색)' })
    @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
    @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
    @ApiQuery({ name: 'limit', required: false, description: '페이지당 개수' })
    async getEmployeeInfo(@Query() query: SearchEmployeeDto) {
        const pagination: PaginationDto = {
            page: query.page || 1,
            limit: query.limit || 10,
        };

        if (query.employeeCode && query.employeeCode.trim() !== '') {
            return this.employeeInfoHandler.handleSingleRead(query);
        }

        if (query.startDate && query.endDate) {
            return this.employeeInfoHandler.handleDateRangeSearch(query.startDate, query.endDate, pagination);
        }

        if (query.search && query.search.trim() !== '') {
            return this.employeeInfoHandler.handleSearch(query.search, pagination);
        }

        return this.employeeInfoHandler.handleListRead(pagination);
    }
}