import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { DateFormatter } from '../../../../../common/utils/date-formatter.util';

@Injectable()
export class ProductInfoSearchService {
  private readonly validFields = [
    'productName',
    'productType',
    'productSize',
    'productOrderUnit',
    'productInventoryUnit',
    'unitQuantity',
    'safeInventory',
    'taxType',
    'price',
    'productBigo',
    'createBy',
    'updateAt',
    'createAt',
  ];

  private readonly datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/;

  constructor(
    @InjectRepository(ProductInfo)
    private readonly productInfoRepository: Repository<ProductInfo>,
  ) {}

  //통합검색
  async searchProductInfo(
    keyword: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResult> {
    const trimmedKeyword = keyword.trim();
    const offset = (page - 1) * limit;

    const queryBuilder = this.productInfoRepository
      .createQueryBuilder('product')
      .where(
        new Brackets(qb => {
          // 텍스트 검색 조건 추가
          this.addTextSearchConditions(qb, trimmedKeyword);

          // 날짜 검색 조건 추가
          if (this.isDateSearch(trimmedKeyword)) {
            this.addDateSearchConditions(qb, trimmedKeyword);
          }
        }),
      )
      .orderBy('customer.customerName', 'ASC')
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
  async searchProductInfoByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchResult> {
    this.validateDateRange(startDate, endDate);

    const offset = (page - 1) * limit;

    // 시작일은 00:00:00, 종료일은 23:59:59로 설정
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);

    const queryBuilder = this.productInfoRepository
      .createQueryBuilder('product')
      .where('DATE(product.createdAt) >= DATE(:startDate)', { startDate })
      .andWhere('DATE(product.createdAt) <= DATE(:endDate)', { endDate })
      .orderBy('product.createdAt', 'DESC')
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
      qb.orWhere(`product.${field} LIKE :keyword`, { keyword: `%${keyword}%` });
    });
  }

  private addDateSearchConditions(qb: WhereExpressionBuilder, keyword: string): void {
    const searchDate = new Date(keyword);
    qb.orWhere('DATE(customer.createdAt) = DATE(:searchDate)', { searchDate }).orWhere(
      'DATE(customer.updatedAt) = DATE(:searchDate)',
      { searchDate },
    );
  }

  private isDateSearch(keyword: string): boolean {
    return this.datePattern.test(keyword);
  }

  private validateDateRange(startDate: string, endDate: string): void {
    // 문자열 타입 검증 추가
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      throw new BadRequestException('날짜는 문자열이어야 합니다.');
    }

    if (!this.datePattern.test(startDate) || !this.datePattern.test(endDate)) {
      throw new BadRequestException('날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 또는 YYYY/MM/DD)');
    }
  }
}

interface SearchResult {
  data: ProductInfo[];
  total: number;
  page: number;
  limit: number;
}
