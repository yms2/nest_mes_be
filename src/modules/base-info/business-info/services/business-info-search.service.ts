import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { BusinessInfo } from '../entities/business-info.entity';
import { DateFormatter } from '../../../../common/utils/date-formatter.util';

@Injectable()
export class BusinessInfoSearchService {
  private readonly validFields = [
    'businessName',
    'businessNumber',
    'businessType',
    'businessCeo',
    'businessItem',
    'corporateRegistrationNumber',
    'businessTel',
    'businessMobile',
    'businessCeoEmail',
    'businessFax',
    'businessZipcode',
    'businessAddress',
    'businessAddressDetail',
    'createdAt',
    'updatedAt',
  ];

  private readonly datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;

  constructor(
    @InjectRepository(BusinessInfo)
    private readonly businessInfoRepository: Repository<BusinessInfo>,
  ) {}

  // 통합검색 - 가장 많이 사용되는 검색
  async searchBusinessInfo(
    keyword: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResult> {
    const trimmedKeyword = keyword.trim();
    const offset = (page - 1) * limit;

    const queryBuilder = this.businessInfoRepository
      .createQueryBuilder('business')
      .where('business.isDeleted = false')
      .andWhere(
        new Brackets(qb => {
          this.addTextSearchConditions(qb, trimmedKeyword);
          if (this.isDateSearch(trimmedKeyword)) {
            this.addDateSearchConditions(qb, trimmedKeyword);
          }
        }),
      )
      .orderBy('business.businessName', 'ASC')
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

  // 특정 필드에서만 검색
  async searchBusinessInfoByField(
    fieldName: string,
    keyword: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResult> {
    const trimmedKeyword = keyword.trim();
    const offset = (page - 1) * limit;

    const queryBuilder = this.businessInfoRepository
      .createQueryBuilder('business')
      .where('business.isDeleted = false')
      .andWhere(`business.${fieldName} LIKE :keyword`, { keyword: `%${trimmedKeyword}%` })
      .orderBy('business.businessName', 'ASC')
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

  // 날짜 범위 검색
  async searchBusinessInfoByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 99999,
  ): Promise<SearchResult> {
    this.validateDateRange(startDate, endDate);

    const offset = (page - 1) * limit;

    // 시작일은 00:00:00, 종료일은 23:59:59로 설정
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const queryBuilder = this.businessInfoRepository
      .createQueryBuilder('business')
      .where('business.isDeleted = false')
      .andWhere('DATE(business.createdAt) >= :startDate', { startDate })
      .andWhere('DATE(business.createdAt) <= :endDate', { endDate })
      .orderBy('business.createdAt', 'DESC')
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
      qb.orWhere(`business.${field} LIKE :keyword`, { keyword: `%${keyword}%` });
    });
  }

  private addDateSearchConditions(qb: WhereExpressionBuilder, keyword: string): void {
    const searchDate = new Date(keyword);
    qb.orWhere('DATE(business.createdAt) = DATE(:searchDate)', { searchDate }).orWhere(
      'DATE(business.updatedAt) = DATE(:searchDate)',
      { searchDate },
    );
  }

  private isDateSearch(keyword: string): boolean {
    return this.datePattern.test(keyword);
  }

  private validateDateRange(startDate: string, endDate: string): void {
    if (!this.datePattern.test(startDate) || !this.datePattern.test(endDate)) {
      throw new BadRequestException('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 또는 YYYY/MM/DD)');
    }
  }
}

interface SearchResult {
  data: BusinessInfo[];
  total: number;
  page: number;
  limit: number;
}
