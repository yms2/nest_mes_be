import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, WhereExpressionBuilder } from 'typeorm';
import { ProcessInfo } from '../entities/process.entity';
import { DateFormatter } from 'src/common/utils/date-formatter.util';

@Injectable()
export class ProcessSearchService {
    private readonly validFields = [
        'processCode',
        'processName',
        'description',
        'createdBy',
        'createdAt',
        'updatedAt',
    ];

    private readonly datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;

    constructor(
        @InjectRepository(ProcessInfo)
        private readonly processInfoRepository: Repository<ProcessInfo>,
    ) {}

    async searchProcessInfo(
        keyword: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<SearchResult> {
        const trimmedKeyword = keyword.trim();
        const offset = (page - 1) * limit;

        const queryBuilder = this.processInfoRepository
            .createQueryBuilder('process')
            .where(
                new Brackets(qb => {
                    if (/^\d+$/.test(trimmedKeyword)) {
                        qb.orWhere('process.processCode = :exactNumber', { exactNumber: trimmedKeyword });
                    }

                    this.addTextSearchConditions(qb, trimmedKeyword);

                    if (this.isDateSearch(trimmedKeyword)) {
                        this.addDateSearchConditions(qb, trimmedKeyword);
                    }
                })
            )
            .orderBy('process.processCode', 'ASC')
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

    async searchProcessInfoByDateRange(
        startDate: string,
        endDate: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<SearchResult> {
        this.validateDateRange(startDate, endDate);

        const offset = (page - 1) * limit;

        const queryBuilder = this.processInfoRepository
            .createQueryBuilder('process')
            .where('DATE(process.createdAt) >= DATE(:startDate)', { startDate })
            .andWhere('DATE(process.createdAt) <= DATE(:endDate)', { endDate })
            .orderBy('process.createdAt', 'DESC')
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
        if (this.validFields.some(field => keyword.toLowerCase().includes(field.toLowerCase()))) {
            qb.andWhere(`process.${keyword} LIKE :search`, { search: `%${keyword}%` });
        }
    }

    private addDateSearchConditions(qb: WhereExpressionBuilder, keyword: string): void {
        if (this.datePattern.test(keyword)) {
            const [startDate, endDate] = keyword.split('~');
            qb.andWhere('process.createdAt BETWEEN :startDate AND :endDate', {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            });
        }
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
    data: ProcessInfo[];
    total: number;
    page: number;
    limit: number;
  }
  