import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, WhereExpressionBuilder } from 'typeorm';
import { ProductInfo } from '../entities/product-info.entity';
import { CustomerInfo } from '../../../customer-info/entities/customer-info.entity';
import { DateFormatter } from '../../../../../common/utils/date-formatter.util';

@Injectable()
export class ProductInfoSearchService {
  private readonly validFields = [
    'productName',
    'productType',
    'productCategory',
    'productSize1',
    'productSize2',
    'customerCode',
    'productOrderUnit',
    'productInventoryUnit',
    'unitQuantity',
    'safeInventory',
    'taxType',
    'productPrice',
    'taxTypeSale',
    'productPriceSale',
    'productHomepage',
    'productBigo',
  ];

  // 실제 데이터베이스 컬럼명 매핑
  private readonly fieldMapping = {
    productName: 'product_name',
    productType: 'product_type',
    productCategory: 'product_category',
    productSize1: 'product_size1',
    productSize2: 'product_size2',
    customerCode: 'customer_code',
    productOrderUnit: 'product_order_unit',
    productInventoryUnit: 'product_inventory_unit',
    unitQuantity: 'unit_quantity',
    safeInventory: 'safe_inventory',
    taxType: 'tax_type',
    productPrice: 'product_price',
    taxTypeSale: 'tax_type_sale',
    productPriceSale: 'product_price_sale',
    productHomepage: 'product_homepage',
    productBigo: 'product_bigo',
  };

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

    // QueryBuilder를 사용한 검색
    const queryBuilder = this.productInfoRepository
      .createQueryBuilder('product')
      .leftJoin('customer_info', 'customer', 'customer.customer_code = product.customer_code')
      .select([
        'product.*',
        'customer.customer_name as customerName',
      ])
              .where(
          new Brackets(qb => {
            // 텍스트 검색 조건 추가 (실제 DB 컬럼명 사용)
            this.validFields.forEach(field => {
              const dbField = this.fieldMapping[field];
              qb.orWhere(`product.${dbField} LIKE :keyword`, { keyword: `%${trimmedKeyword}%` });
            });

            // 거래처명 검색 조건 추가
            qb.orWhere(`customer.customer_name LIKE :keyword`, { keyword: `%${trimmedKeyword}%` });

            // 날짜 검색 조건 추가
            if (this.isDateSearch(trimmedKeyword)) {
              const searchDate = new Date(trimmedKeyword);
              qb.orWhere('DATE(product.created_at) = DATE(:searchDate)', { searchDate });
            }
          }),
        )
      .orderBy('product.product_name', 'ASC')
      .skip(offset)
      .take(limit);

    const [data, total] = await Promise.all([
      queryBuilder.getRawMany(),
      this.productInfoRepository.count(),
    ]);

    // 날짜 포맷팅 적용
    const formattedData = data.map(item => ({
      ...item,
      createdAt: DateFormatter.formatDate(item.created_at),
      updatedAt: DateFormatter.formatDate(item.updated_at),
    }));

    return {
      data: formattedData,
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
      .leftJoin('customer_info', 'customer', 'customer.customer_code = product.customer_code')
      .select([
        'product.*',
        'customer.customer_name as customerName',
      ])
      .where('DATE(product.created_at) >= DATE(:startDate)', { startDate })
      .andWhere('DATE(product.created_at) <= DATE(:endDate)', { endDate })
      .orderBy('product.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    const [data, total] = await Promise.all([
      queryBuilder.getRawMany(),
      this.productInfoRepository.count(),
    ]);

    // 날짜 포맷팅 적용
    const formattedData = data.map(item => ({
      ...item,
      createdAt: DateFormatter.formatDate(item.created_at),
      updatedAt: DateFormatter.formatDate(item.updated_at),
    }));

    return {
      data: formattedData,
      total,
      page,
      limit,
    };
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
