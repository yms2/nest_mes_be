import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { DateFormatter } from 'src/common/utils/date-formatter.util';

@Injectable()
export class EmployeeSearchService {
    private readonly validFields = [
        'employeeName',
        'employeeCode',
        'department',
        'position',
        'gender',
        'domesticForeign',
        'birthday',
        'employeePhone',
        'employeeEmail',
        'hireDate',
        'resignationDate',
        'zipcode',
        'address',
        'addressDetail',
        'createdBy',
    ];

    private readonly datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;

    constructor(
        @InjectRepository(Employee)
        private readonly employeeRepository: Repository<Employee>,
    ) {}

    async searchEmployee(
        keyword: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<SearchResult> {
        const trimmedKeyword = keyword.trim();
        const offset = (page - 1) * limit;

        const queryBuilder = this.employeeRepository
            .createQueryBuilder('employee')
            .where(
                new Brackets(qb => {
                    this.addTextSearchConditions(qb, trimmedKeyword);
                })
            )
            .orderBy('employee.employeeName', 'ASC')
            .skip(offset)
            .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async searchEmployeeByDateRange(
        startDate: string,
        endDate: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<SearchResult> {
        this.validateDateRange(startDate, endDate);

        const offset = (page - 1) * limit;

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0);

        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);

        const queryBuilder = this.employeeRepository
            .createQueryBuilder('employee')
            .where('DATE(employee.createdAt) >= DATE(:startDate)', { startDate })
            .andWhere('DATE(employee.createdAt) <= DATE(:endDate)', { endDate })
            .orderBy('employee.createdAt', 'DESC')
            .skip(offset)
            .take(limit);

        const [data, total] = await queryBuilder.getManyAndCount();

        return {
            data: DateFormatter.formatBusinessInfoArrayDates(data),
            total,
            page,
            limit,
        };
    }

    private addTextSearchConditions(qb: WhereExpressionBuilder, keyword: string): void {
        this.validFields.forEach(field => {
            qb.orWhere(`employee.${field} LIKE :keyword`, { keyword: `%${keyword}%` });
        });
    }

    private addDateSearchConditions(qb: WhereExpressionBuilder, keyword: string): void {
        const searchDate = new Date(keyword);
        qb.orWhere('DATE(employee.createdAt) = DATE(:searchDate)', { searchDate }).orWhere(
            'DATE(employee.updatedAt) = DATE(:searchDate)',
            { searchDate },
        );
    }

    private isDateSearch(keyword: string): boolean {
        return this.datePattern.test(keyword);
    }

    private validateDateRange(startDate: string, endDate: string): void {
        if (typeof startDate !== 'string' || typeof endDate !== 'string') {
            throw new BadRequestException('날짜는 문자열이어야 합니다.');
        }

        if (!this.datePattern.test(startDate) || !this.datePattern.test(endDate)) {
            throw new BadRequestException('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 또는 YYYY/MM/DD)');
        }
    }
}

interface SearchResult {
    data: Employee[];
    total: number;
    page: number;
    limit: number;
  }